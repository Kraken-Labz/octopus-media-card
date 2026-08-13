import { html } from "lit";

import "../components/media-poster";
import type { LayoutRenderer } from "./layout-strategy";

export const renderPortraitLayout: LayoutRenderer = ({ config, entryId, hass, items }) => html`
  <div class="layout portrait" data-layout="portrait">
    ${items.map(
      (item) => html`
        <octopus-media-poster
          .item=${item}
          .hass=${hass}
          .entryId=${entryId}
          .variant=${"poster-large"}
          .showTitle=${config.show_titles}
          .showBadge=${config.show_badges}
          .titlePosition=${config.title_position}
        ></octopus-media-poster>
      `,
    )}
  </div>
`;
