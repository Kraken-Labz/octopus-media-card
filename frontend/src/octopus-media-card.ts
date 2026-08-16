import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import { subscribeSnapshot } from "./api";
import "./components/empty-state";
import "./components/error-state";
import "./components/media-image";
import "./components/loading-state";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  SCAFFOLD_ENTRY_ID,
  type CardMode,
  type CardLayout,
  type OctopusMediaCardConfig,
} from "./config";
import type { HomeAssistant, LovelaceCardConfig, UnsubscribeFunc } from "./ha-types";
import type { ImageVariant } from "./image-resolver";
import { AutoLayoutController } from "./layouts/auto-layout";
import { renderLayout, renderUpcoming } from "./layouts/render-layout";
import { translate, type TranslationKey } from "./localization";
import type { DashboardSnapshot, MediaItem, PlayingItem } from "./models";
import "./octopus-media-editor";
import { cardStyles } from "./styles";

interface AmbientArtwork {
  imageRef: string;
  variant: ImageVariant;
}

@customElement("octopus-media-card")
export class OctopusMediaCard extends LitElement {
  @state() private config?: OctopusMediaCardConfig;
  @state() private snapshot?: DashboardSnapshot;
  @state() private loading = true;
  @state() private error?: string;
  @state() private containerWidth = 390;
  @state() private containerHeight = 210;
  @state() private localPlaying: PlayingItem[] = [];
  @state() private focusedItemRef?: string;
  @state() private ambientArtwork?: AmbientArtwork;
  @state() private pendingAmbientArtwork?: AmbientArtwork;

  private hassValue?: HomeAssistant;
  private unsubscribe?: UnsubscribeFunc;
  private subscriptionPending = false;
  private resizeObserver?: ResizeObserver;
  private resizeFrame?: number;
  private subscriptionGeneration = 0;
  private reconnectTimer?: number;
  private reconnectDelay = 1000;
  private progressTimer?: number;
  private progressTickAt = 0;
  private readonly autoLayout = new AutoLayoutController();

  set hass(value: HomeAssistant) {
    this.hassValue = value;
    this.requestUpdate();
    void this.ensureSubscription();
  }

  get hass(): HomeAssistant | undefined {
    return this.hassValue;
  }

  setConfig(config: LovelaceCardConfig): void {
    const previousEntry = this.config?.entry_id;
    this.config = normalizeConfig(config);
    if (previousEntry !== this.config.entry_id) {
      this.resetSubscription();
    }
    this.synchronizeFocusAndAmbient(true);
    void this.ensureSubscription();
  }

  static getStubConfig(): OctopusMediaCardConfig {
    return { ...DEFAULT_CONFIG, sections: [...DEFAULT_CONFIG.sections] };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("octopus-media-editor");
  }

  getCardSize(): number {
    if (typeof this.config?.height === "number") {
      return Math.max(1, Math.ceil(this.config.height / 50));
    }
    return 4;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.startResizeObserver();
    void this.ensureSubscription();
  }

  override disconnectedCallback(): void {
    this.subscriptionGeneration += 1;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.clearReconnectTimer();
    this.stopProgressTimer();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
    super.disconnectedCallback();
  }

  protected override render() {
    const config = this.config ?? DEFAULT_CONFIG;
    const language = this.hassValue?.language;
    const mode = this.effectiveMode(config);
    const effectiveConfig = { ...config, appearance: this.resolveAppearance(config.appearance) };
    const title =
      config.title ??
      (mode === "upcoming" ? this.t("upcoming", language).toUpperCase() : this.t(mode, language));
    const configuredHeight = config.height;
    const fixedHeight = typeof configuredHeight === "number";
    const effectiveHeight = fixedHeight ? configuredHeight : this.containerHeight;
    const resolvedLayout = this.resolveLayout(config, mode, effectiveHeight);
    const officialStrip = resolvedLayout === "strip";
    const headerTitle = officialStrip ? (mode === "recent" ? "RECENT" : "UPCOMING") : title;
    const officialPlayingHero = mode === "playing" && resolvedLayout === "hero";
    const style = [
      fixedHeight ? `--octopus-card-height:${String(configuredHeight)}px` : "",
      config.accent_color ? `--octopus-media-accent:${config.accent_color}` : "",
    ]
      .filter(Boolean)
      .join(";");

    return html`
      <article
        class=${`card ${fixedHeight ? "fixed" : ""}`}
        data-theme=${config.theme}
        data-appearance=${effectiveConfig.appearance}
        data-concept=${config.visual_concept}
        data-title-position=${config.title_position}
        data-header-alignment=${config.header_alignment}
        data-layout=${resolvedLayout}
        data-mode=${mode}
        data-wide=${String(this.containerWidth >= 560)}
        data-has-ambient=${String(officialStrip && Boolean(this.ambientArtwork))}
        data-playing-hero=${String(officialPlayingHero)}
        style=${style}
        @octopus-media-focus=${this.onMediaFocus}
      >
        ${officialStrip ? this.renderAmbientBackground(config) : nothing}
        ${
          officialPlayingHero
            ? nothing
            : html`<header>
                <span class="heading">
                  ${officialStrip ? nothing : html`<ha-icon icon="mdi:octopus" aria-hidden="true"></ha-icon>`}
                  <h2>${headerTitle}</h2>
                </span>
                ${
                  this.snapshot && officialStrip
                    ? html`<span
                        class="context"
                        aria-label=${`${String(this.itemsForMode(mode).length)} itens`}
                        >${this.itemsForMode(mode).length}</span
                      >`
                    : nothing
                }
              </header>`
        }
        <section class="content">
          ${this.renderContent(effectiveConfig, mode, language, resolvedLayout, effectiveHeight)}
        </section>
      </article>
    `;
  }

  private renderAmbientBackground(config: OctopusMediaCardConfig) {
    return html`
      ${
        this.ambientArtwork
          ? html`<octopus-media-image
              class="ambient-background"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${config.entry_id}
              .imageRef=${this.ambientArtwork.imageRef}
              .variant=${this.ambientArtwork.variant}
              .alt=${""}
              .backdrop=${true}
            ></octopus-media-image>`
          : nothing
      }
      ${
        this.pendingAmbientArtwork
          ? html`<octopus-media-image
              class="ambient-preload"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${config.entry_id}
              .imageRef=${this.pendingAmbientArtwork.imageRef}
              .variant=${this.pendingAmbientArtwork.variant}
              .alt=${""}
              .backdrop=${true}
              @octopus-image-ready=${this.onAmbientPreloadReady}
            ></octopus-media-image>`
          : nothing
      }
      <span class="ambient-color" aria-hidden="true"></span>
      <span class="ambient-vignette" aria-hidden="true"></span>
    `;
  }

  private renderContent(
    config: OctopusMediaCardConfig,
    mode: Exclude<CardMode, "carousel">,
    language: string | undefined,
    resolvedLayout: Exclude<CardLayout, "auto">,
    effectiveHeight: number,
  ) {
    if (config.entry_id === SCAFFOLD_ENTRY_ID) {
      return html`<octopus-empty-state
        .message=${this.t("notConfigured", language)}
      ></octopus-empty-state>`;
    }
    if (this.loading) {
      return html`<octopus-loading-state
        .message=${this.t("loading", language)}
      ></octopus-loading-state>`;
    }
    const officialPlayingHero = mode === "playing" && resolvedLayout === "hero";
    if (officialPlayingHero) {
      const items = this.localPlaying.slice(0, config.item_count);
      const offline = this.snapshot?.availability.jellyfin.state === "offline";
      const section = this.snapshot?.playing;
      return renderLayout("hero", {
        config,
        entryId: config.entry_id,
        focusedItemRef: this.focusedItemRef ?? items[0]?.ref,
        hass: this.hassValue,
        heroState:
          items.length > 0 ? "ready" : offline || Boolean(this.error) ? "unavailable" : "empty",
        items,
        language,
        mode,
        partial: section?.partial ?? false,
        serviceOffline: offline,
        stale: section?.stale ?? false,
        height: effectiveHeight,
        width: this.containerWidth,
      });
    }
    if (this.error) {
      return html`<octopus-error-state
        .message=${this.t("error", language)}
      ></octopus-error-state>`;
    }
    if (!this.snapshot) {
      return html`<octopus-empty-state
        .message=${this.t("notConfigured", language)}
      ></octopus-empty-state>`;
    }
    const items = this.itemsForMode(mode).slice(0, config.item_count);
    if (
      mode === "upcoming" &&
      this.snapshot.availability.radarr.state === "not_configured" &&
      this.snapshot.availability.sonarr.state === "not_configured"
    ) {
      return html`<octopus-empty-state
        .message=${this.t("upcomingNotConfigured", language)}
      ></octopus-empty-state>`;
    }
    if (
      (mode === "recent" || mode === "playing") &&
      this.snapshot.availability.jellyfin.state === "offline" &&
      items.length === 0
    ) {
      return html`<octopus-error-state
        .message=${this.t("unavailable", language)}
      ></octopus-error-state>`;
    }
    if (items.length === 0) {
      if (mode === "upcoming") {
        return html`<div class="upcoming-empty" role="status">
          <ha-icon icon="mdi:calendar-blank-outline" aria-hidden="true"></ha-icon>
          <span>${this.t("upcomingEmpty", language)}</span>
        </div>`;
      }
      const message = mode === "playing" ? "noPlaying" : "empty";
      return html`<octopus-empty-state
        .message=${this.t(message, language)}
      ></octopus-empty-state>`;
    }
    const section = this.snapshot[mode];
    if (mode === "upcoming") {
      return renderUpcoming({
        config,
        entryId: config.entry_id,
        focusedItemRef: this.focusedItemRef ?? items[0]?.ref,
        hass: this.hassValue,
        height: effectiveHeight,
        items,
        language,
        mode,
        partial: section.partial,
        stale: section.stale,
        width: this.containerWidth,
      });
    }
    return html`
      ${renderLayout(resolvedLayout, {
        config,
        entryId: config.entry_id,
        focusedItemRef: this.focusedItemRef ?? items[0]?.ref,
        hass: this.hassValue,
        height: effectiveHeight,
        items,
        language,
        mode,
        width: this.containerWidth,
      })}
      ${
        section.stale
          ? html`<p class="stale" role="status">${this.t("stale", language)}</p>`
          : nothing
      }
      ${
        section.partial
          ? html`<p class="partial" role="status">${this.t("partial", language)}</p>`
          : nothing
      }
    `;
  }

  private effectiveMode(config: OctopusMediaCardConfig): Exclude<CardMode, "carousel"> {
    return config.mode === "carousel" ? (config.sections[0] ?? "recent") : config.mode;
  }

  private resolveAppearance(appearance: OctopusMediaCardConfig["appearance"]): "dark" | "light" {
    if (appearance !== "auto") return appearance;
    return this.hassValue?.themes?.darkMode === false ? "light" : "dark";
  }

  private resolveLayout(
    config: OctopusMediaCardConfig,
    mode: Exclude<CardMode, "carousel">,
    height: number,
  ): Exclude<CardLayout, "auto"> {
    return config.layout === "auto"
      ? this.autoLayout.update(mode, this.containerWidth, height)
      : config.layout;
  }

  private itemsForMode(mode: Exclude<CardMode, "carousel">): MediaItem[] {
    if (mode === "playing") return this.localPlaying;
    return this.snapshot?.[mode].items ?? [];
  }

  private t(key: TranslationKey | Exclude<CardMode, "carousel"> | "carousel", language?: string) {
    return translate(language, key);
  }

  private async ensureSubscription(): Promise<void> {
    if (
      !this.isConnected ||
      !this.config ||
      !this.hassValue ||
      this.config.entry_id === SCAFFOLD_ENTRY_ID ||
      this.unsubscribe ||
      this.subscriptionPending
    ) {
      return;
    }
    const generation = ++this.subscriptionGeneration;
    this.subscriptionPending = true;
    this.loading = true;
    this.error = undefined;
    try {
      const unsubscribe = await subscribeSnapshot(
        this.hassValue,
        this.config.entry_id,
        (snapshot) => {
          if (generation !== this.subscriptionGeneration) return;
          this.snapshot = snapshot;
          this.localPlaying = snapshot.playing.items.map((item) => ({ ...item }));
          this.synchronizeFocusAndAmbient(true);
          this.reconcileProgressTimer();
          this.loading = false;
          this.error = undefined;
        },
      );
      if (generation !== this.subscriptionGeneration) {
        unsubscribe();
      } else {
        this.unsubscribe = unsubscribe;
        this.reconnectDelay = 1000;
      }
    } catch (error: unknown) {
      if (generation === this.subscriptionGeneration) {
        this.error = error instanceof Error ? error.message : "subscription_failed";
        this.loading = false;
        this.scheduleReconnect();
      }
    } finally {
      if (generation === this.subscriptionGeneration) this.subscriptionPending = false;
    }
  }

  private resetSubscription(): void {
    this.subscriptionGeneration += 1;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.clearReconnectTimer();
    this.stopProgressTimer();
    this.snapshot = undefined;
    this.localPlaying = [];
    this.focusedItemRef = undefined;
    this.ambientArtwork = undefined;
    this.pendingAmbientArtwork = undefined;
    this.loading = true;
    this.error = undefined;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== undefined || !this.isConnected) return;
    const generation = this.subscriptionGeneration;
    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      if (generation === this.subscriptionGeneration) void this.ensureSubscription();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== undefined) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  private reconcileProgressTimer(): void {
    this.progressTickAt = Date.now();
    const playingIsLive =
      this.snapshot?.availability.jellyfin.state !== "offline" &&
      this.snapshot?.playing.stale !== true;
    if (
      playingIsLive &&
      this.localPlaying.some((item) => item.state === "playing" && item.duration_seconds > 0)
    ) {
      this.progressTimer ??= window.setInterval(() => this.advancePlayingProgress(), 1000);
    } else {
      this.stopProgressTimer();
    }
  }

  private advancePlayingProgress(): void {
    const now = Date.now();
    const elapsed = Math.max(0, (now - this.progressTickAt) / 1000);
    this.progressTickAt = now;
    if (elapsed === 0) return;
    this.localPlaying = this.localPlaying.map((item) => {
      if (item.state !== "playing" || item.duration_seconds <= 0) return item;
      const position = Math.min(item.duration_seconds, item.position_seconds + elapsed);
      return {
        ...item,
        position_seconds: position,
        progress: Math.min(100, Math.max(0, (position / item.duration_seconds) * 100)),
      };
    });
  }

  private stopProgressTimer(): void {
    if (this.progressTimer !== undefined) window.clearInterval(this.progressTimer);
    this.progressTimer = undefined;
  }

  private readonly onMediaFocus = (event: Event): void => {
    if (!this.config) return;
    const mode = this.effectiveMode(this.config);
    const height =
      typeof this.config.height === "number" ? this.config.height : this.containerHeight;
    const layout = this.resolveLayout(this.config, mode, height);
    const officialPlayingHero = mode === "playing" && layout === "hero";
    if (layout !== "strip" && !officialPlayingHero) return;
    const detail = (event as CustomEvent<{ ref?: unknown }>).detail;
    if (typeof detail.ref !== "string" || detail.ref === this.focusedItemRef) return;
    const item = this.itemsForMode(mode).find((candidate) => candidate.ref === detail.ref);
    if (!item) return;
    this.focusedItemRef = item.ref;
    if (officialPlayingHero) return;
    const nextArtwork = this.artworkFor(item);
    if (!nextArtwork) {
      this.ambientArtwork = undefined;
      this.pendingAmbientArtwork = undefined;
      return;
    }
    if (this.sameArtwork(nextArtwork, this.ambientArtwork)) {
      this.pendingAmbientArtwork = undefined;
      return;
    }
    this.pendingAmbientArtwork = nextArtwork;
  };

  private readonly onAmbientPreloadReady = (event: Event): void => {
    const detail = (event as CustomEvent<{ imageRef?: unknown }>).detail;
    if (
      typeof detail.imageRef !== "string" ||
      detail.imageRef !== this.pendingAmbientArtwork?.imageRef
    ) {
      return;
    }
    this.ambientArtwork = this.pendingAmbientArtwork;
    this.pendingAmbientArtwork = undefined;
  };

  private synchronizeFocusAndAmbient(replaceArtwork: boolean): void {
    if (!this.config || !this.snapshot) return;
    const items = this.itemsForMode(this.effectiveMode(this.config)).slice(
      0,
      this.config.item_count,
    );
    const focused = items.find((item) => item.ref === this.focusedItemRef) ?? items[0];
    this.focusedItemRef = focused?.ref;
    const artwork = this.artworkFor(focused);
    if (replaceArtwork) {
      this.ambientArtwork = artwork;
      this.pendingAmbientArtwork = undefined;
    }
  }

  private artworkFor(item: MediaItem | undefined): AmbientArtwork | undefined {
    if (!item) return undefined;
    if ("backdrop_ref" in item && item.backdrop_ref) {
      return { imageRef: item.backdrop_ref, variant: "backdrop-medium" };
    }
    if ("still_ref" in item && item.still_ref) {
      return { imageRef: item.still_ref, variant: "poster-large" };
    }
    if (item.poster_ref) {
      return { imageRef: item.poster_ref, variant: "poster-large" };
    }
    return undefined;
  }

  private sameArtwork(
    first: AmbientArtwork | undefined,
    second: AmbientArtwork | undefined,
  ): boolean {
    return first?.imageRef === second?.imageRef && first?.variant === second?.variant;
  }

  private startResizeObserver(): void {
    if (this.resizeObserver || typeof ResizeObserver === "undefined") return;
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const size = entry.contentBoxSize[0];
      const width = size?.inlineSize ?? entry.contentRect.width;
      const height = size?.blockSize ?? entry.contentRect.height;
      if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = undefined;
        if (width > 0 && Math.abs(width - this.containerWidth) >= 0.5) {
          this.containerWidth = width;
        }
        if (height > 0 && Math.abs(height - this.containerHeight) >= 0.5) {
          this.containerHeight = height;
        }
      });
    });
    this.resizeObserver.observe(this);
  }

  static override styles = cardStyles;
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "octopus-media-card")) {
  window.customCards.push({
    type: "octopus-media-card",
    name: "Octopus Media Card",
    description: "Poster-focused Jellyfin, Radarr, and Sonarr card",
    preview: true,
  });
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-media-card": OctopusMediaCard;
  }
}
