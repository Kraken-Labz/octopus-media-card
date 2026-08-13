import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("octopus-navigation-controls")
export class NavigationControls extends LitElement {
  protected override render() {
    return html`
      <button type="button" aria-label="Previous item" @click=${() => this.emit("previous")}>
        ‹
      </button>
      <button type="button" aria-label="Next item" @click=${() => this.emit("next")}>›</button>
    `;
  }

  private emit(name: "previous" | "next"): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  static override styles = css`
    :host {
      display: flex;
      gap: 4px;
    }
    button {
      align-items: center;
      background: #142229;
      border: 1px solid var(--octopus-media-border, #334851);
      border-radius: 999px;
      color: var(--octopus-media-text, #e8f1f4);
      cursor: pointer;
      display: inline-flex;
      font-size: 22px;
      height: 44px;
      justify-content: center;
      width: 44px;
    }
    button:focus-visible {
      outline: 2px solid var(--octopus-media-accent, #3dd6c6);
      outline-offset: 2px;
    }
  `;
}
