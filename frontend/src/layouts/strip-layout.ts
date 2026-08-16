import { html } from "lit";

import "../components/media-strip";
import type { LayoutRenderer } from "./layout-strategy";
import { calculateStripGeometry } from "./strip-geometry";

export const renderStripLayout: LayoutRenderer = ({
  config,
  entryId,
  focusedItemRef,
  hass,
  height,
  items,
  width,
}) => {
  const geometry = calculateStripGeometry(width, height, config.posters_visible, items.length);
  return html`
    <octopus-media-strip
      class="layout strip"
      data-layout="strip"
      data-appearance=${config.appearance}
      .hass=${hass}
      .items=${items}
      .entryId=${entryId}
      .focusedRef=${focusedItemRef}
      .posterHeight=${geometry.posterHeight}
      .posterWidth=${geometry.posterWidth}
      .gap=${geometry.gap}
      .wide=${width >= 560}
      .showTitles=${config.show_titles}
      .showDates=${config.show_dates}
      .showRatings=${config.show_ratings}
      .showBadges=${config.show_badges}
      .showArrows=${config.show_arrows}
      .autoScroll=${config.auto_scroll}
      .autoScrollInterval=${config.auto_scroll_interval}
    ></octopus-media-strip>
  `;
};
