import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { HomeAssistant } from "../ha-types";
import type { MediaItem } from "../models";
import "./media-image";

@customElement("octopus-media-thumbnail")
export class MediaThumbnail extends LitElement {
  @property({ attribute: false }) item?: MediaItem;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) entryId = "";

  protected override render() {
    if (!this.item) return nothing;
    return html`<octopus-media-image
      .hass=${this.hass}
      .entryId=${this.entryId}
      .imageRef=${this.item.poster_ref}
      .variant=${"poster-small"}
      .alt=${this.item.title}
    ></octopus-media-image>`;
  }

  static override styles = css`
    :host {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      min-height: 0;
      min-width: 0;
    }
    octopus-media-image {
      aspect-ratio: 2 / 3;
      border: 1px solid var(--octopus-media-border, #334851);
      border-radius: 8px;
      display: block;
      height: var(--octopus-thumbnail-height, 64px);
      max-height: 100%;
      max-width: 100%;
      overflow: hidden;
    }
  `;
}
