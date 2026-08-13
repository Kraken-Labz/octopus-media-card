"""Normalized model tests."""

from datetime import datetime

from custom_components.octopus_media.models import (
    AvailabilityState,
    MediaSource,
    build_empty_snapshot,
)


def test_empty_snapshot_is_truthful_and_utc() -> None:
    """The scaffold emits no fake media and preserves the HA timezone."""
    snapshot = build_empty_snapshot("fixture_entry_001", "Etc/UTC")
    payload = snapshot.as_dict()
    assert payload["schema_version"] == 1
    assert payload["time_zone"] == "Etc/UTC"
    offset = datetime.fromisoformat(payload["updated_at"].replace("Z", "+00:00")).utcoffset()
    assert offset is not None and offset.total_seconds() == 0
    assert payload["recent"]["items"] == []
    assert payload["upcoming"]["items"] == []
    assert payload["playing"]["items"] == []
    assert set(payload["availability"]) == {source.value for source in MediaSource}
    assert all(
        service["state"] == AvailabilityState.NOT_CONFIGURED
        for service in payload["availability"].values()
    )
