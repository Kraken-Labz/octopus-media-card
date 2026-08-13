import { html } from "lit";

import "../components/media-image";
import type { LayoutRenderer } from "./layout-strategy";

export const renderCompactLayout: LayoutRenderer = ({ entryId, hass, items, width }) => {
  const visibleItems = items.slice(0, 3);
  return html`
    <div class="layout compact" data-layout="compact">
      ${visibleItems.map(
        (item, index) => html`
          <article
            class=${`compact-item ${index === 0 ? "featured" : ""}`}
            aria-label=${item.title}
          >
            <octopus-media-image
              .hass=${hass}
              .entryId=${entryId}
              .imageRef=${item.poster_ref}
              .variant=${width < 420 ? "poster-small" : "poster-medium"}
              .alt=${item.title}
            ></octopus-media-image>
            <div class="compact-overlay">
              <strong title=${item.title}>${item.title}</strong>
              ${index === 0 && item.subtitle ? html`<span>${item.subtitle}</span>` : ""}
            </div>
          </article>
        `,
      )}
    </div>
  `;
};
