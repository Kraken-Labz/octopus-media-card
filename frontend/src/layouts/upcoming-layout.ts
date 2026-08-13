import { html } from "lit";

import "../components/media-strip";
import type { LayoutRenderer } from "./layout-strategy";
import { calculateStripGeometry } from "./strip-geometry";

export const renderUpcomingLayout: LayoutRenderer = ({
  config,
  entryId,
  hass,
  items,
  width,
  height,
  partial,
  stale,
}) => {
  const geometry = calculateStripGeometry(width, height, config.posters_visible, items.length);
  return html`
    <octopus-media-strip
      class="layout upcoming"
      data-layout="upcoming"
      variant="upcoming"
      .partial=${partial ?? false}
      .stale=${stale ?? false}
      .hass=${hass}
      .items=${items}
      .entryId=${entryId}
      .posterHeight=${geometry.posterHeight}
      .posterWidth=${geometry.posterWidth}
      .gap=${geometry.gap}
      .wide=${width >= 560}
      .showTitles=${config.show_titles}
      .showDates=${true}
      .showRatings=${false}
      .showBadges=${config.show_badges}
      .showArrows=${config.show_arrows}
    ></octopus-media-strip>
  `;
};
