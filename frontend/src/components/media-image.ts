import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HomeAssistant } from "../ha-types";
import {
  imageResolverFor,
  PLACEHOLDER_IMAGE,
  type ImageResolutionRequest,
  type ImageVariant,
} from "../image-resolver";

type ImageState = "idle" | "loading" | "loaded" | "missing" | "temporary";

@customElement("octopus-media-image")
export class MediaImage extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) entryId = "";
  @property({ type: String }) imageRef?: string;
  @property({ type: String }) variant: ImageVariant = "poster-medium";
  @property({ type: String }) alt = "";
  @property({ type: Boolean }) backdrop = false;

  @state() private imageUrl = PLACEHOLDER_IMAGE;
  @state() private imageState: ImageState = "idle";

  private observer?: IntersectionObserver;
  private nearViewport = false;
  private generation = 0;
  private renewalAttempts = 0;
  private retryTimer?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    this.armObserver();
  }

  override disconnectedCallback(): void {
    this.generation += 1;
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.retryTimer !== undefined) window.clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (
      changed.has("imageRef") ||
      changed.has("entryId") ||
      changed.has("variant") ||
      changed.has("hass")
    ) {
      this.resetImage();
    }
  }

  protected override render() {
    return html`<img
      src=${this.imageUrl}
      alt=${this.alt}
      data-state=${this.imageState}
      loading="lazy"
      decoding="async"
      @load=${this.onLoad}
      @error=${this.onError}
    />`;
  }

  private armObserver(): void {
    if (this.observer || !this.isConnected) return;
    if (typeof IntersectionObserver === "undefined") {
      this.nearViewport = true;
      void this.loadSignedPath();
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) return;
        this.nearViewport = true;
        this.observer?.disconnect();
        this.observer = undefined;
        void this.loadSignedPath();
      },
      { rootMargin: "180px 180px", threshold: 0.01 },
    );
    this.observer.observe(this);
  }

  private resetImage(): void {
    this.generation += 1;
    this.renewalAttempts = 0;
    this.imageUrl = PLACEHOLDER_IMAGE;
    this.imageState = "idle";
    if (this.retryTimer !== undefined) window.clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    if (this.nearViewport) void this.loadSignedPath();
  }

  private request(): ImageResolutionRequest | undefined {
    if (!this.hass || !this.imageRef || !this.entryId) return undefined;
    return { entryId: this.entryId, imageRef: this.imageRef, variant: this.variant };
  }

  private async loadSignedPath(): Promise<void> {
    const hass = this.hass;
    const request = this.request();
    if (!request || !hass) {
      this.imageState = "missing";
      return;
    }
    const generation = this.generation;
    this.imageState = "loading";
    try {
      const path = await imageResolverFor(hass).resolve(request);
      if (generation === this.generation) this.imageUrl = path;
    } catch {
      if (generation !== this.generation) return;
      this.imageState = "temporary";
      this.imageUrl = PLACEHOLDER_IMAGE;
      this.scheduleBackoffRetry();
    }
  }

  private readonly onLoad = (): void => {
    if (this.imageUrl === PLACEHOLDER_IMAGE) return;
    this.imageState = "loaded";
    this.dispatchEvent(
      new CustomEvent("octopus-image-ready", {
        bubbles: true,
        composed: true,
        detail: { imageRef: this.imageRef },
      }),
    );
  };

  private readonly onError = (): void => {
    void this.handleImageError();
  };

  private async handleImageError(): Promise<void> {
    const request = this.request();
    if (!request || !this.hass) {
      this.imageState = "missing";
      this.imageUrl = PLACEHOLDER_IMAGE;
      return;
    }
    if (this.renewalAttempts === 0) {
      this.renewalAttempts = 1;
      imageResolverFor(this.hass).invalidate(request);
      this.imageUrl = PLACEHOLDER_IMAGE;
      await this.updateComplete;
      await this.loadSignedPath();
      return;
    }
    this.imageState = "missing";
    this.imageUrl = PLACEHOLDER_IMAGE;
  }

  private scheduleBackoffRetry(): void {
    if (this.renewalAttempts > 0 || this.retryTimer !== undefined) return;
    this.renewalAttempts = 1;
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = undefined;
      void this.loadSignedPath();
    }, 5000);
  }

  static override styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    img {
      display: block;
      height: 100%;
      object-fit: cover;
      opacity: 1;
      transition: opacity 160ms ease;
      width: 100%;
    }
    img[data-state="idle"],
    img[data-state="loading"] {
      opacity: 0.72;
    }
    @media (prefers-reduced-motion: reduce) {
      img {
        transition: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-media-image": MediaImage;
  }
}
