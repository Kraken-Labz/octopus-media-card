import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("octopus-empty-state")
export class EmptyState extends LitElement {
  @property({ type: String }) message = "No media to display";

  protected override render() {
    return html`<div role="status">
      <span class="mark" aria-hidden="true"><ha-icon icon="mdi:octopus"></ha-icon></span>
      <strong>${this.message}</strong>
      <small>Octopus Media</small>
    </div>`;
  }

  static override styles = css`
    div {
      align-items: center;
      color: var(--octopus-media-muted, #8fa4ad);
      display: flex;
      flex-direction: column;
      background: radial-gradient(
        circle at center,
        color-mix(in srgb, var(--octopus-accent, #8b5cf6) 13%, transparent),
        transparent 58%
      );
      border-radius: var(--octopus-radius-poster, 12px);
      gap: 5px;
      justify-content: center;
      min-height: 96px;
      text-align: center;
    }
    .mark {
      align-items: center;
      background: color-mix(in srgb, var(--octopus-accent, #8b5cf6) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--octopus-accent, #8b5cf6) 32%, transparent);
      border-radius: 999px;
      color: var(--octopus-accent, #8b5cf6);
      display: flex;
      height: 38px;
      justify-content: center;
      margin-bottom: 3px;
      width: 38px;
    }
    ha-icon {
      height: 20px;
      width: 20px;
    }
    strong {
      color: var(--octopus-text, #f3f6fb);
      font-size: 12px;
      font-weight: 550;
    }
    small {
      color: var(--octopus-muted, #8795a8);
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `;
}
