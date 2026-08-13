import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { HomeAssistant } from "../ha-types";
import { translate } from "../localization";
import type { MediaItem } from "../models";

@customElement("octopus-media-badges")
export class MediaBadges extends LitElement {
  @property({ attribute: false }) item?: MediaItem;
  @property({ attribute: false }) hass?: HomeAssistant;

  protected override render() {
    return this.item
      ? html`<span>${translate(this.hass?.language, this.item.type)}</span>`
      : nothing;
  }

  static override styles = css`
    span {
      backdrop-filter: blur(8px);
      background: color-mix(in srgb, var(--octopus-surface-elevated, #111c2a) 68%, transparent);
      border: 1px solid var(--octopus-border, #293748);
      border-radius: 999px;
      color: var(--octopus-media-muted, #8fa4ad);
      display: inline-flex;
      font-size: 8px;
      padding: 3px 5px;
    }
  `;
}
