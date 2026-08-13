import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("octopus-error-state")
export class ErrorState extends LitElement {
  @property({ type: String }) message = "Unable to load media";

  protected override render() {
    return html`<div role="alert"><span aria-hidden="true">!</span>${this.message}</div>`;
  }

  static override styles = css`
    div {
      align-items: center;
      color: #ffb8b8;
      display: flex;
      gap: 10px;
      justify-content: center;
      min-height: 96px;
      text-align: center;
    }
    span {
      align-items: center;
      border: 1px solid #ff7b7b;
      border-radius: 50%;
      display: inline-flex;
      height: 28px;
      justify-content: center;
      width: 28px;
    }
  `;
}
