import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { HomeAssistant } from "../ha-types";
import type { ImageVariant } from "../image-resolver";
import { translate } from "../localization";
import type { MediaItem } from "../models";
import "./media-image";

@customElement("octopus-media-poster")
export class MediaPoster extends LitElement {
  @property({ attribute: false }) item?: MediaItem;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) entryId = "";
  @property({ type: String }) variant: ImageVariant = "poster-medium";
  @property({ type: Boolean }) showTitle = true;
  @property({ type: Boolean }) showBadge = true;
  @property({ type: Boolean }) showSubtitle = true;
  @property({ type: String }) titlePosition: "overlay" | "below" = "overlay";
  @property({ type: Boolean, reflect: true }) focused = false;
  @property({ type: Number }) itemIndex = 0;

  protected override render() {
    if (!this.item) return nothing;
    return html`
      <article
        aria-label=${this.item.title}
        tabindex="0"
        data-focused=${String(this.focused)}
        data-title-position=${this.titlePosition}
        @focus=${this.announceFocus}
        @pointerenter=${this.announceHoverFocus}
        @pointerdown=${this.announceFocus}
      >
        <div class="image-frame">
          <octopus-media-image
            .hass=${this.hass}
            .entryId=${this.entryId}
            .imageRef=${this.item.poster_ref}
            .variant=${this.variant}
            .alt=${this.item.title}
          ></octopus-media-image>
          ${this.showBadge ? html`<span class="badge">${this.badgeLabel()}</span>` : nothing}
          ${
            this.showTitle && this.titlePosition === "overlay"
              ? html`<div class="overlay-copy">
                  <h3 class="title">${this.item.title}</h3>
                  ${
                    this.showSubtitle && this.item.subtitle
                      ? html`<p>${this.item.subtitle}</p>`
                      : nothing
                  }
                </div>`
              : nothing
          }
        </div>
        ${
          this.showTitle && this.titlePosition === "below"
            ? html`<h3 class="title">${this.item.title}</h3>`
            : nothing
        }
        ${
          this.titlePosition === "below" && this.showSubtitle && this.item.subtitle
            ? html`<p>${this.item.subtitle}</p>`
            : nothing
        }
      </article>
    `;
  }

  private badgeLabel(): string {
    if (!this.item) return "";
    if (this.item.type === "episode" && "season" in this.item && "episode" in this.item) {
      if (this.item.season !== null && this.item.episode !== null) {
        return `T${String(this.item.season).padStart(2, "0")}E${String(this.item.episode).padStart(2, "0")}`;
      }
    }
    return translate(this.hass?.language, this.item.type);
  }

  private readonly announceFocus = (): void => {
    if (!this.item) return;
    this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: true,
        composed: true,
        detail: { index: this.itemIndex, ref: this.item.ref },
      }),
    );
  };

  private readonly announceHoverFocus = (event: PointerEvent): void => {
    if (event.pointerType === "mouse") this.announceFocus();
  };

  static override styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      min-width: 0;
    }
    article {
      color: var(--octopus-text, #f3f6fb);
      display: grid;
      gap: 3px;
      grid-template-rows: minmax(0, 1fr) auto auto;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }
    article:focus-visible {
      border-radius: var(--octopus-radius-poster, 12px);
      outline: 2px solid var(--octopus-accent-secondary, #43d8d1);
      outline-offset: -2px;
    }
    .image-frame {
      aspect-ratio: 2 / 3;
      background: var(--octopus-surface-elevated, #101820);
      border: 1px solid color-mix(in srgb, var(--octopus-border, #293748) 70%, transparent);
      border-radius: var(--octopus-radius-poster, 12px);
      box-shadow: 0 9px 22px rgb(0 0 0 / 28%);
      box-sizing: border-box;
      height: 100%;
      justify-self: center;
      max-width: 100%;
      min-height: 0;
      overflow: hidden;
      position: relative;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease;
      width: auto;
    }
    article:hover .image-frame,
    article:focus-visible .image-frame {
      box-shadow: 0 12px 26px rgb(0 0 0 / 34%);
      transform: translateY(-2px);
    }
    octopus-media-image {
      display: block;
      height: 100%;
      width: 100%;
    }
    .badge {
      backdrop-filter: blur(8px);
      background: rgb(7 12 22 / 68%);
      border: 1px solid
        color-mix(in srgb, var(--octopus-accent-secondary, #43d8d1) 38%, transparent);
      border-radius: 999px;
      color: var(--octopus-text, #f3f6fb);
      font-size: 8px;
      left: 7px;
      line-height: 1;
      padding: 3px 5px;
      position: absolute;
      top: 7px;
    }
    .overlay-copy {
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgb(3 7 14 / 24%) 18%,
        rgb(3 7 14 / 92%) 100%
      );
      bottom: 0;
      box-sizing: border-box;
      display: grid;
      gap: 2px;
      left: 0;
      padding: 28px 8px 8px;
      position: absolute;
      right: 0;
    }
    .title {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      font-size: clamp(11px, 2.5cqi, 12px);
      font-weight: 600;
      line-height: 1.14;
      margin: 1px 2px 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    p {
      color: var(--octopus-muted, #8795a8);
      font-size: 9px;
      margin: 0 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .overlay-copy .title,
    .overlay-copy p {
      color: var(--octopus-text, #f3f6fb);
      margin-inline: 0;
      text-shadow: 0 1px 4px rgb(0 0 0 / 65%);
    }
    .overlay-copy p {
      color: color-mix(in srgb, var(--octopus-text, #f3f6fb) 72%, transparent);
    }
    @media (hover: none) {
      article:hover .image-frame {
        transform: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .image-frame {
        transition: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-media-poster": MediaPoster;
  }
}
