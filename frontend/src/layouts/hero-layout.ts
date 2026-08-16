import { html, nothing } from "lit";

import "../components/media-metadata";
import "../components/media-image";
import "../components/media-poster";
import "../components/playing-hero";
import "../components/progress-bar";
import type { PlayingItem } from "../models";
import type { LayoutRenderer } from "./layout-strategy";

const hasProgress = (item: object): item is PlayingItem => "progress" in item;

export const renderHeroLayout: LayoutRenderer = (context) => {
  const {
    config,
    entryId,
    focusedItemRef,
    hass,
    height,
    heroState,
    items,
    language,
    mode,
    partial,
    serviceOffline,
    stale,
  } = context;
  if (mode === "playing") {
    const playingItems = items.filter(hasProgress);
    return html`
      <octopus-playing-hero
        .config=${config}
        data-appearance=${config.appearance}
        .entryId=${entryId}
        .focusedRef=${focusedItemRef}
        .hass=${hass}
        .heroState=${heroState ?? (playingItems.length > 0 ? "ready" : "empty")}
        .items=${playingItems}
        .language=${language}
        .partial=${partial ?? false}
        .serviceOffline=${serviceOffline ?? false}
        .stale=${stale ?? false}
      ></octopus-playing-hero>
    `;
  }

  const item = items[0];
  return html`
    <div class="layout hero" data-layout="hero">
      ${
        item
          ? html`
              <octopus-media-image
                class="hero-backdrop"
                .hass=${hass}
                .entryId=${entryId}
                .imageRef=${
                  "backdrop_ref" in item ? (item.backdrop_ref ?? item.still_ref) : undefined
                }
                .variant=${
                  "backdrop_ref" in item && item.backdrop_ref ? "backdrop-medium" : "poster-large"
                }
                .alt=${""}
                .backdrop=${true}
              ></octopus-media-image>
              <octopus-media-poster
                .item=${item}
                .hass=${hass}
                .entryId=${entryId}
                .variant=${"poster-medium"}
                .showTitle=${false}
                .showBadge=${config.show_badges && height >= 185}
                .showSubtitle=${false}
                .titlePosition=${config.title_position}
              ></octopus-media-poster>
              <div class="hero-copy">
                <octopus-media-metadata
                  .item=${item}
                  .showSubtitle=${height >= 155}
                ></octopus-media-metadata>
                ${
                  hasProgress(item)
                    ? html`<octopus-progress-bar .value=${item.progress}></octopus-progress-bar>`
                    : nothing
                }
              </div>
            `
          : nothing
      }
    </div>
  `;
};
