import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("octopus-progress-bar")
export class ProgressBar extends LitElement {
  @property({ type: Number }) value = 0;

  protected override render() {
    const value = Math.min(100, Math.max(0, this.value));
    return html`
      <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${value}>
        <span style=${`width:${String(value)}%`}></span>
      </div>
    `;
  }

  static override styles = css`
    div {
      background: #25343b;
      border-radius: 999px;
      height: 5px;
      overflow: hidden;
    }
    span {
      background: var(--octopus-media-accent, #3dd6c6);
      display: block;
      height: 100%;
    }
  `;
}
