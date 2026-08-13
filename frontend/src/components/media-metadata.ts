import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { MediaItem } from "../models";

@customElement("octopus-media-metadata")
export class MediaMetadata extends LitElement {
  @property({ attribute: false }) item?: MediaItem;
  @property({ type: Boolean }) showSubtitle = true;

  protected override render() {
    if (!this.item) return nothing;
    return html`
      <strong>${this.item.title}</strong>
      ${
        this.showSubtitle && this.item.subtitle ? html`<span>${this.item.subtitle}</span>` : nothing
      }
    `;
  }

  static override styles = css`
    :host {
      display: grid;
      gap: 4px;
      max-height: 100%;
      min-width: 0;
      overflow: hidden;
    }
    strong {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      font-size: var(--octopus-metadata-title-size, inherit);
      line-height: var(--octopus-metadata-title-line-height, normal);
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    span {
      color: var(--octopus-media-muted, #8fa4ad);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
}
