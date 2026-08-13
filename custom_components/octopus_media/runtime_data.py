"""Typed shared runtime, snapshot reconciliation, and refresh limiting."""

from __future__ import annotations

import asyncio
import time
from collections.abc import Callable
from dataclasses import dataclass, field

from homeassistant.core import callback

from .api.jellyfin import JellyfinClient
from .const import REFRESH_RATE_LIMIT_SECONDS
from .coordinators.base import error_code
from .coordinators.playing import JellyfinPlayingCoordinator
from .coordinators.recent import JellyfinRecentCoordinator
from .coordinators.upcoming import UpcomingCoordinator
from .image_cache import ImageMemoryCache
from .image_store import ImageReferenceStore
from .models import (
    AvailabilityState,
    DashboardSnapshot,
    EntryCapabilities,
    MediaSource,
    PlayingItem,
    RecentItem,
    SectionSnapshot,
    ServiceAvailability,
    UpcomingItem,
    UpcomingState,
    utc_now_iso,
)

SnapshotListener = Callable[[DashboardSnapshot], None]


@dataclass(slots=True)
class OctopusMediaRuntimeData:
    """Objects shared by every card using one config entry."""

    capabilities: EntryCapabilities
    snapshot: DashboardSnapshot
    image_store: ImageReferenceStore
    client: JellyfinClient
    recent_coordinator: JellyfinRecentCoordinator
    playing_coordinator: JellyfinPlayingCoordinator
    upcoming_coordinator: UpcomingCoordinator | None = None
    image_cache: ImageMemoryCache = field(default_factory=ImageMemoryCache)
    listeners: set[SnapshotListener] = field(default_factory=set)
    closed: bool = False
    _coordinator_unsubscribers: list[Callable[[], None]] = field(default_factory=list)
    _refresh_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    _last_refresh_request: float = field(default=float("-inf"))

    @callback
    def attach_coordinators(self) -> None:
        """Listen once to both shared coordinators."""
        self._coordinator_unsubscribers.extend((
            self.recent_coordinator.async_add_listener(self.reconcile_snapshot),
            self.playing_coordinator.async_add_listener(self.reconcile_snapshot),
        ))
        if self.upcoming_coordinator is not None:
            self._coordinator_unsubscribers.append(
                self.upcoming_coordinator.async_add_listener(self.reconcile_snapshot)
            )
        self.reconcile_snapshot()

    @callback
    def subscribe(self, listener: SnapshotListener) -> Callable[[], None]:
        """Subscribe to semantically changed normalized snapshots."""
        self.listeners.add(listener)

        @callback
        def unsubscribe() -> None:
            self.listeners.discard(listener)

        return unsubscribe

    @callback
    def publish(self, snapshot: DashboardSnapshot) -> None:
        """Publish a changed snapshot to current subscribers."""
        self.snapshot = snapshot
        for listener in tuple(self.listeners):
            listener(snapshot)

    @callback
    def reconcile_snapshot(self) -> None:
        """Preserve valid data, mark stale failures, and suppress duplicates."""
        if self.closed:
            return
        old = self.snapshot
        recent_data = self.recent_coordinator.data
        playing_data = self.playing_coordinator.data
        upcoming_data = (
            self.upcoming_coordinator.data if self.upcoming_coordinator is not None else None
        )
        recent_items = recent_data.items if recent_data is not None else ()
        playing_items = playing_data.items if playing_data is not None else ()
        recent_stale = not self.recent_coordinator.last_update_success
        playing_stale = not self.playing_coordinator.last_update_success
        recent_partial = recent_data.partial if recent_data is not None else False
        playing_partial = playing_data.partial if playing_data is not None else False
        upcoming_items = upcoming_data.items if upcoming_data is not None else ()
        upcoming_stale = (
            self.upcoming_coordinator is not None
            and not self.upcoming_coordinator.last_update_success
        )
        upcoming_partial = upcoming_data.partial if upcoming_data is not None else False

        recent_changed = self._section_changed(
            old.recent, recent_items, recent_stale, recent_partial
        )
        playing_changed = self._section_changed(
            old.playing, playing_items, playing_stale, playing_partial
        )
        timestamp = utc_now_iso()
        recent = self._section(
            old.recent, recent_items, recent_stale, recent_partial, recent_changed, timestamp
        )
        playing = self._section(
            old.playing, playing_items, playing_stale, playing_partial, playing_changed, timestamp
        )
        upcoming_state = self._upcoming_state(upcoming_data, upcoming_stale, upcoming_partial)
        upcoming_changed = (
            self._section_changed(old.upcoming, upcoming_items, upcoming_stale, upcoming_partial)
            or old.upcoming.state != upcoming_state
        )
        upcoming = self._section(
            old.upcoming,
            upcoming_items,
            upcoming_stale,
            upcoming_partial,
            upcoming_changed,
            timestamp,
            state=upcoming_state,
        )

        failures = [
            coordinator
            for coordinator in (self.recent_coordinator, self.playing_coordinator)
            if not coordinator.last_update_success
        ]
        old_jellyfin = old.availability[MediaSource.JELLYFIN]
        if failures:
            jellyfin = ServiceAvailability(
                AvailabilityState.OFFLINE,
                old_jellyfin.last_success_at,
                error_code(failures[0].last_exception),
            )
        else:
            last_success = (
                old_jellyfin.last_success_at
                if old_jellyfin.state is AvailabilityState.ONLINE
                else timestamp
            )
            jellyfin = ServiceAvailability(AvailabilityState.ONLINE, last_success, None)
        availability = {
            MediaSource.JELLYFIN: jellyfin,
            MediaSource.RADARR: self._service_availability("radarr", timestamp),
            MediaSource.SONARR: self._service_availability("sonarr", timestamp),
        }
        availability_changed = availability != old.availability
        if not (recent_changed or playing_changed or upcoming_changed or availability_changed):
            return
        self.publish(
            DashboardSnapshot(
                schema_version=old.schema_version,
                entry_id=old.entry_id,
                revision=old.revision + 1,
                updated_at=timestamp,
                time_zone=old.time_zone,
                availability=availability,
                recent=recent,
                upcoming=upcoming,
                playing=playing,
            )
        )

    async def async_refresh(self, requested: set[str]) -> tuple[bool, str | None]:
        """Refresh recent/playing with a per-entry anti-spam window."""
        async with self._refresh_lock:
            if self.closed:
                return False, "closed"
            now = time.monotonic()
            if now - self._last_refresh_request < REFRESH_RATE_LIMIT_SECONDS:
                return False, "rate_limited"
            self._last_refresh_request = now
            sections = {"recent", "playing"} if "all" in requested else requested
            if "all" in requested and self.upcoming_coordinator is not None:
                sections.add("upcoming")
            refresh_recent = "recent" in sections
            refresh_playing = "playing" in sections
            refresh_upcoming = "upcoming" in sections
            if not refresh_recent and not refresh_playing and not refresh_upcoming:
                return False, "invalid_section"
            if refresh_playing:
                self.playing_coordinator.device_catalog.invalidate()
            if refresh_upcoming and self.upcoming_coordinator is None:
                return False, "not_configured"
            if refresh_recent and refresh_playing:
                await asyncio.gather(
                    self.recent_coordinator.async_request_refresh(),
                    self.playing_coordinator.async_request_refresh(),
                )
            elif refresh_recent and refresh_upcoming:
                await asyncio.gather(
                    self.recent_coordinator.async_request_refresh(),
                    self.upcoming_coordinator.async_request_refresh(),  # type: ignore[union-attr]
                )
            elif refresh_playing and refresh_upcoming:
                await asyncio.gather(
                    self.playing_coordinator.async_request_refresh(),
                    self.upcoming_coordinator.async_request_refresh(),  # type: ignore[union-attr]
                )
            elif refresh_upcoming:
                await self.upcoming_coordinator.async_request_refresh()  # type: ignore[union-attr]
            elif refresh_recent:
                await self.recent_coordinator.async_request_refresh()
            else:
                await self.playing_coordinator.async_request_refresh()
            return True, None

    async def async_close(self) -> None:
        """Cancel polling/listeners and close the runtime without leaking state."""
        self.closed = True
        for unsubscribe in self._coordinator_unsubscribers:
            unsubscribe()
        self._coordinator_unsubscribers.clear()
        await asyncio.gather(
            self.recent_coordinator.async_shutdown(),
            self.playing_coordinator.async_shutdown(),
            self.upcoming_coordinator.async_shutdown()
            if self.upcoming_coordinator is not None
            else asyncio.sleep(0),
        )
        timestamp = utc_now_iso()
        availability = dict(self.snapshot.availability)
        availability[MediaSource.JELLYFIN] = ServiceAvailability(
            AvailabilityState.OFFLINE,
            availability[MediaSource.JELLYFIN].last_success_at,
            "closed",
        )
        self.snapshot = DashboardSnapshot(
            schema_version=self.snapshot.schema_version,
            entry_id=self.snapshot.entry_id,
            revision=self.snapshot.revision + 1,
            updated_at=timestamp,
            time_zone=self.snapshot.time_zone,
            availability=availability,
            recent=self.snapshot.recent,
            upcoming=self.snapshot.upcoming,
            playing=self.snapshot.playing,
        )
        self.listeners.clear()
        await self.image_cache.async_close()
        self.image_store.clear()

    @staticmethod
    def _section_changed[ItemT: (RecentItem, UpcomingItem, PlayingItem)](
        old: SectionSnapshot[ItemT],
        items: tuple[ItemT, ...],
        stale: bool,
        partial: bool,
    ) -> bool:
        return old.items != items or old.stale != stale or old.partial != partial

    @staticmethod
    def _section[ItemT: (RecentItem, UpcomingItem, PlayingItem)](
        old: SectionSnapshot[ItemT],
        items: tuple[ItemT, ...],
        stale: bool,
        partial: bool,
        changed: bool,
        timestamp: str,
        *,
        state: UpcomingState | None = None,
    ) -> SectionSnapshot[ItemT]:
        if not changed:
            return old
        return SectionSnapshot(old.revision + 1, timestamp, stale, partial, items, state)

    def _service_availability(self, name: str, timestamp: str) -> ServiceAvailability:
        """Expose only safe service state and last successful timestamp."""
        coordinator = self.upcoming_coordinator
        if coordinator is None or getattr(coordinator, name) is None:
            return ServiceAvailability(AvailabilityState.NOT_CONFIGURED)
        if coordinator.service_success.get(name):
            return ServiceAvailability(AvailabilityState.ONLINE, timestamp, None)
        return ServiceAvailability(
            AvailabilityState.OFFLINE,
            self.snapshot.availability[
                MediaSource.RADARR if name == "radarr" else MediaSource.SONARR
            ].last_success_at,
            coordinator.service_errors.get(name),
        )

    @staticmethod
    def _upcoming_state(data: object, stale: bool, partial: bool) -> UpcomingState:
        if stale:
            return UpcomingState.STALE
        if data is None:
            return UpcomingState.UNAVAILABLE
        if partial:
            return UpcomingState.PARTIAL
        return UpcomingState.READY if getattr(data, "items", ()) else UpcomingState.EMPTY
