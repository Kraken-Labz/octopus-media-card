# Octopus Media Card configuration

The card references an Octopus Media ConfigEntry. Provider URLs, credentials, API keys,
Jellyfin IDs, and TLS settings belong to the integration UI and must not be placed in card
configuration.

## Minimal configuration

```yaml
type: custom:octopus-media-card
entry_id: YOUR_OCTOPUS_MEDIA_ENTRY_ID
mode: recent
layout: auto
appearance: auto
```

The visual editor is the recommended way to create a new card. It defaults to Recent,
automatic appearance, the supported item count, and disabled auto-scroll.

## Public settings

| Setting | Values | Applies to |
| --- | --- | --- |
| `entry_id` | Octopus Media ConfigEntry ID | All modes |
| `mode` | `recent`, `upcoming`, `playing` | All cards |
| `layout` | `auto`, `strip`, `grid`, `hero`, `compact`, `portrait`, `list` | All modes, with mode-specific behavior |
| `appearance` | `auto`, `dark`, `light` | All modes |
| `item_count` | 1–50 | Recent and Upcoming |
| `auto_scroll` | `true`/`false` | Recent and Upcoming |
| `auto_scroll_interval` | 2–3600 seconds | Recent and Upcoming when enabled |
| `height` | `auto` or at least 80 pixels | All modes |

Legacy YAML fields remain parsed where compatibility requires them. The visual editor
does not expose abandoned or non-functional presentation controls.

## Recent and Upcoming

Recent and Upcoming share the same responsive media-strip and poster-card geometry.
Recent uses Jellyfin recently added media. Upcoming uses Radarr movies and Sonarr episodes:

- movies show title and available date/time;
- episodes show the series title and `TxxExx · date · time` metadata.

The strip preserves portrait 2:3 artwork, scrolling, keyboard navigation, focus behavior,
and an intentional next-item peek when enough items exist.

## Playing

Playing uses the read-only Playing Hero when the selected layout resolves to `hero`.
It shows current Jellyfin session data, including state, title, device, user, progress,
and timing when available. It never provides playback controls and does not auto-scroll.

## Appearance

`auto` follows the Home Assistant theme when technically possible. `dark` and `light`
change interface tokens only; posters and other artwork retain their original colors.

## Removed ConfigEntry recovery

If the referenced ConfigEntry no longer exists, the card reports that the Octopus
configuration was not found. Edit the card and select a current ConfigEntry explicitly.
Entries are identified by `entry_id`, not by title, so the editor does not silently bind
an old card to a different entry with the same name.
