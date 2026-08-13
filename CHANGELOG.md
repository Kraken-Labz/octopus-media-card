# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Refined the official Playing Hero into a single visual block by removing its external heading
  capsule and integrating a localized, non-interactive "Now playing" eyebrow into the editorial
  content. Hover feedback now requires a fine hover-capable pointer so touch cannot retain it.

### Added

- Added the official Playing Hero contract, fictional editor preview and deterministic coverage for
  compact/wide geometry, all truthful states, multiple sessions, keyboard/touch navigation,
  progress reconciliation and safe artwork.
- Added a ConfigEntry-scoped Jellyfin device catalog with a 300-second TTL and
  `CustomName → DeviceName → Client → Dispositivo Jellyfin` normalization.
- Added deterministic editor previews for the official strip at 390 and 800 px using only fictional
  items, plus direct controls for height, titles, badges, arrows, theme, accent and item count.
- Added the D2 Cinematic Poster Strip as the official `strip` layout, with height-derived 2:3
  posters, overlay copy, secure focus-driven ambient artwork and deterministic geometry tests.
- Approved architecture and implementation plan.
- Phase 2 scaffold for the Home Assistant integration and Lovelace card.
- Phase 3A Jellyfin client, validated config/reauth flow, recent and playing normalization, shared coordinators, versioned WebSocket snapshots, frontend states and local playback progress.
- Official Jellyfin endpoint contract and fully fictitious backend/frontend test coverage.
- Added local Upcoming support through Radarr/Sonarr providers, normalization, shared coordination,
  partial/stale state handling, safe image references and deterministic backend/frontend fixtures.

### Changed

- Promoted Playing Hero V2.1 to the only official `mode: playing` + `layout: hero`
  implementation, removed the experimental wrapper/concept gate and made compatible
  `layout: auto` cards select it at 390×240 and wider.
- Playing progress now remains frozen for stale or offline snapshots while live playing snapshots
  continue to advance locally and reconcile on the next backend update.
- Cleared all 24 previously reported frontend lint findings in the Playing Hero/consolidation
  files without disabling rules or broad unrelated refactors.
- Consolidated the old shelf, gallery geometry and isolated D2 prototype into one official
  `octopus-media-strip` source of truth. `layout: auto` now uses it whenever auto resolves to strip.
- Preserved the approved 390/800/819 geometry, 10/12 px gaps, 22% target peek, start alignment,
  keyboard/touch parity, hidden native tooltips and safe signed-image path.
- Existing `visual_concept` values now affect the surrounding palette only; the official strip
  structure is shared. `title_position: below` remains accepted but is rendered as overlay in strip.
- Reworked the LAB-only Cinematic Octopus Gallery checkpoint to calculate poster width from each
  card's useful width, fill the shelf through the right-side peek, restore hover/focus hierarchy,
  explicitly initialize shelf scroll state, enrich secure ambient/fallback layers, and keep
  episode, long-title, and no-backdrop fixtures as complete galleries.
- Phase 3C adds the LAB-only Concept D, with a left-aligned fixed-gap shelf, below-poster titles,
  focus-driven secure ambient Jellyfin artwork, stable preloading, truthful gradient fallback and
  touch/keyboard/scroll focus hierarchy. Concepts A, B and C remain available and unchanged.
- Phase 3C adds three LAB-only cinematic concepts, centralized Octopus design tokens, reduced
  poster density, overlay/below title treatments, hidden-scrollbar shelf navigation and a richer
  compact/hero composition.
- Episode artwork is now contextual: vertical layouts use series then season posters, while the
  episode Primary is exposed separately as `still_ref` for horizontal hero/detail use.
- Phase 3A.3 persists a user-defined ConfigEntry instance name across creation, options, migration, and reauthentication.
- Diagnostics now expose an aggregate allowlist and never serialize raw ConfigEntry data or backend identifiers.
- Fixed-height strip, compact, and hero layouts now prioritize titles, progressively hide secondary metadata, and contain vertical overflow across the deterministic viewport matrix; compact thumbnails also reserve the title's full line box at 150 px.
- Resize observation coalesces visual updates without restarting the WebSocket subscription.

### Planned

- Replace the temporary `mdi:octopus` reference with an original purple octopus SVG in the later visual-identity phase; no icon asset is included yet.

### Phase 3B — Jellyfin images

- Added deterministic ConfigEntry/server-bound image descriptors with episode/series fallback.
- Added bounded Jellyfin image downloads, LRU/TTL memory cache, in-flight deduplication and sanitized diagnostics.
- Completed the authenticated Home Assistant image endpoint with ETag/304 support.
- Added lazy `IntersectionObserver` loading through Home Assistant `auth/sign_path` with bounded renewal.

### Development status

- Jellyfin recent, Jellyfin playing, image handling, the official strip and the Playing Hero are
  implemented with local test coverage.
- Upcoming, Radarr and Sonarr are implemented in the local codebase with backend and frontend
  fixture coverage; they have not yet been deployed to HA-LAB or released.
- Carousel remains partial: its configuration is accepted, but the current card renders only the
  first configured section rather than cycling through multiple sections.
