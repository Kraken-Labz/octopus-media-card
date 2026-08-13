import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("octopus-loading-state")
export class LoadingState extends LitElement {
  @property({ type: String }) message = "Loading media";

  protected override render() {
    return html`<div role="status" aria-live="polite"><span></span>${this.message}</div>`;
  }

  static override styles = css`
    div {
      align-items: center;
      color: var(--octopus-media-muted, #8fa4ad);
      display: flex;
      gap: 10px;
      justify-content: center;
      min-height: 96px;
    }
    span {
      animation: pulse 1s ease-in-out infinite alternate;
      background: var(--octopus-media-accent, #3dd6c6);
      border-radius: 50%;
      height: 10px;
      width: 10px;
    }
    @keyframes pulse {
      to {
        opacity: 0.3;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      span {
        animation: none;
      }
    }
  `;
}
