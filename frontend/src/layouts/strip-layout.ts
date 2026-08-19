import { html } from "lit";

import "../components/media-strip";
import type { LayoutRenderer } from "./layout-strategy";
import { calculateCanonicalStripGeometry } from "./strip-geometry";

export const renderStripLayout: LayoutRenderer = ({
  config,
  entryId,
  focusedItemRef,
  hass,
  height,
  items,
  mode,
  partial,
  stale,
  width,
}) => {
  const upcoming = mode === "upcoming";
  const geometry = calculateCanonicalStripGeometry(
    width,
    height,
    config.posters_visible,
    items.length,
  );
  return html`
    <octopus-media-strip
      class="layout strip"
      data-layout="strip"
      data-appearance=${config.appearance}
      variant=${upcoming ? "upcoming" : "recent"}
      .partial=${partial ?? false}
      .stale=${stale ?? false}
      .hass=${hass}
      .items=${items}
      .entryId=${entryId}
      .focusedRef=${focusedItemRef}
      .posterHeight=${geometry.posterHeight}
      .posterWidth=${geometry.posterWidth}
      .gap=${geometry.gap}
      .wide=${width >= 560}
      .showTitles=${config.show_titles}
      .showDates=${upcoming || config.show_dates}
      .showRatings=${upcoming ? false : config.show_ratings}
      .showArrows=${config.show_arrows}
      .autoScroll=${config.auto_scroll}
      .autoScrollInterval=${config.auto_scroll_interval}
    ></octopus-media-strip>
  `;
};
