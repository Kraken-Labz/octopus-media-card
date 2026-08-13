# Octopus Media Card

Octopus Media Card is a poster-focused Home Assistant custom card backed by a minimal custom integration. The backend securely normalizes Jellyfin recent/playing and Radarr/Sonarr upcoming data, and delivers images without sending service credentials to the frontend.

> **Current development status:** the approved Playing Hero V2.1 is the single official implementation
> of `mode: playing` with `layout: hero`; `layout: auto` selects it at compatible heights from
> 390 px wide. The D2 strip remains independently official and unchanged. `upcoming` is implemented
> locally through Radarr/Sonarr providers, normalization and a shared coordinator. The carousel is
> partial: it accepts carousel configuration but currently renders the first configured section only.

The states below describe the local development baseline. “Implemented” and “tested” refer to
repository code and fixtures; this baseline has not yet been deployed to HA-LAB and is not a stable
published or released HACS version.

## Card modes

- `recent`
- `upcoming`
- `playing`
- `carousel`

## Layout contract

- `auto`
- `strip`
- `grid`
- `hero`
- `compact`
- `portrait`
- `list`

The official strip uses height-derived 2:3 posters, fixed 10/12 px gaps, left alignment and an
intentional 20–30% next-item peek when enough items exist. One- and two-item collections are never
duplicated, stretched or spread across the width.

The official Playing Hero is read-only and shows the normalized session state, title, episode
context, friendly device name, user and locally advancing progress. Paused, empty, unavailable and
stale are distinct states; stale/offline progress is frozen. Multiple sessions use the same
keyboard, touch, arrow and indicator navigation without exposing playback controls.
It uses one continuous visual surface: the former external heading capsule is absent, while a
plain, non-interactive `EM REPRODUÇÃO` eyebrow sits inside the editorial content above the
independent state and media-type chips. Hover styling is limited to fine hover-capable pointers.

Upcoming renders normalized movie and episode items from Radarr and Sonarr, including source/date
metadata, partial and stale states, and safe image references. External service URLs and credentials
do not cross into the card.

## Minimal card configuration

```yaml
type: custom:octopus-media-card
entry_id: ID_DA_CONFIG_ENTRY
mode: recent
layout: auto
visual_concept: cinematic-overlay
title_position: overlay
```

No service URL, API key, user ID, TLS option, or timeout belongs in card YAML.

See the complete [configuration contract](docs/configuration.md) and the
[official strip](docs/official-strip.md) and
[official Playing Hero](docs/official-playing-hero.md) specifications.

## Development target

The initial development and CI target is Home Assistant 2026.7.x with Python 3.14.2 or newer. This is not yet the declared minimum public compatibility version; that decision will follow API and compatibility testing.

Backend commands:

```powershell
python -m pip install -r requirements-dev.txt
ruff check .
ruff format --check .
mypy custom_components tests
python -m pytest
```

Home Assistant's test runner is POSIX-oriented. On native Windows only, prepend the
collection shims before running pytest; they provide the missing `fcntl`/`resource`
imports and preserve pytest-socket's external-network block while allowing the
private asyncio wakeup socket pair:

```powershell
$env:PYTHONPATH = "tests\windows_compat;."
python -m pytest
```

Do not use these shims to run Home Assistant itself. Linux CI runs without them.

Frontend commands:

```powershell
pnpm --dir frontend install
pnpm --dir frontend lint
pnpm --dir frontend test
pnpm --dir frontend test:visual
pnpm --dir frontend build
pnpm --dir frontend verify:bundle
```

## Local development package

After the full test suite and frontend build pass, generate the installable local ZIP:

```powershell
.\scripts\package-dev.ps1
```

The command first requires the distribution and integration bundles to be byte-identical,
then creates `dist/octopus-media-card-dev.zip` deterministically. It includes only the
runtime subtree `custom_components/octopus_media/`, audits the finished archive for
forbidden paths and likely secrets/local addresses, and prints its exact contents and
SHA-256. This artifact is for controlled local validation only; it is not a release.

## HACS packaging

The repository is structured as one HACS integration. Everything required at runtime, including the card bundle, is located under `custom_components/octopus_media/`.

During development, the integration serves the bundle at:

```text
/octopus_media/octopus-media-card.js
```

The integration does not mutate Lovelace storage. Until a stable public auto-registration API is available, the resource will be added manually as a JavaScript module. Full installation instructions will be completed before the release candidate.

## Project metadata

Repository: [phgsbr/octopus-media-card](https://github.com/phgsbr/octopus-media-card)

Issues and project discussions are tracked in the [GitHub repository](https://github.com/phgsbr/octopus-media-card/issues).

## Documentation

- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [Official strip](docs/official-strip.md)
- [Official Playing Hero](docs/official-playing-hero.md)
- [Implementation plan](docs/implementation-plan.md)
- [Jellyfin API endpoints](docs/api-endpoints.md)
- [Controlled real Jellyfin validation](docs/real-jellyfin-validation.md)

## Security

Never include credentials, real service addresses, private diagnostics, or domestic environment fixtures in an issue or commit. See [SECURITY.md](SECURITY.md).

## License

MIT
