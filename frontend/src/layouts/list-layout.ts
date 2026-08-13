import { html } from "lit";

import "../components/media-badges";
import "../components/media-metadata";
import "../components/media-thumbnail";
import type { LayoutRenderer } from "./layout-strategy";

export const renderListLayout: LayoutRenderer = ({ config, entryId, hass, items }) => html`
  <div class="layout list" data-layout="list">
    ${items.map(
      (item) => html`
        <div class="list-row">
          <octopus-media-thumbnail
            .item=${item}
            .hass=${hass}
            .entryId=${entryId}
          ></octopus-media-thumbnail>
          <octopus-media-metadata .item=${item}></octopus-media-metadata>
          ${
            config.show_badges
              ? html`<octopus-media-badges .item=${item} .hass=${hass}></octopus-media-badges>`
              : null
          }
        </div>
      `,
    )}
  </div>
`;
