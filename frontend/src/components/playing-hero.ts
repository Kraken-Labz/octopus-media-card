import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import type { OctopusMediaCardConfig } from "../config";
import type { HomeAssistant } from "../ha-types";
import { translate } from "../localization";
import type { PlayingItem } from "../models";
import "./media-image";

export type PlayingHeroState = "ready" | "empty" | "unavailable";

interface HeroArtwork {
  ref?: string;
  variant: "poster-large" | "backdrop-medium";
}

export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainder = wholeSeconds % 60;
  return hours > 0
    ? `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${String(minutes)}:${String(remainder).padStart(2, "0")}`;
}

export function formatEditorialRuntime(seconds: number): string | undefined {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${String(minutes)} min`;
  return minutes > 0 ? `${String(hours)}h${String(minutes).padStart(2, "0")}` : `${String(hours)}h`;
}

export function playingEditorialParts(item: PlayingItem, language?: string): string[] {
  const parts: string[] = [];
  const year = item.type === "movie" && /^\d{4}$/.test(item.subtitle ?? "") ? item.subtitle : null;
  if (year) parts.push(year);
  const runtime = formatEditorialRuntime(item.duration_seconds);
  if (runtime) parts.push(runtime);
  parts.push(...item.genres.filter((genre) => genre.trim()).slice(0, 2));
  if (item.rating !== null && Number.isFinite(item.rating)) {
    const rating = new Intl.NumberFormat(language ?? "en", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(item.rating);
    parts.push(`★ ${rating}`);
  }
  return parts;
}

export function playingTechnicalChips(item: PlayingItem): string[] {
  return [
    item.video_resolution?.trim(),
    item.video_hdr ? "HDR" : undefined,
    item.audio_channels?.trim(),
  ]
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);
}

export function playingBackgroundArtwork(item: PlayingItem): HeroArtwork {
  if (item.type === "episode" && item.still_ref) {
    return { ref: item.still_ref, variant: "poster-large" };
  }
  if (item.backdrop_ref) {
    return { ref: item.backdrop_ref, variant: "backdrop-medium" };
  }
  if (item.still_ref) {
    return { ref: item.still_ref, variant: "poster-large" };
  }
  return { variant: "backdrop-medium" };
}

@customElement("octopus-playing-hero")
export class PlayingHero extends LitElement {
  @property({ attribute: false }) config?: OctopusMediaCardConfig;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) items: PlayingItem[] = [];
  @property({ type: String }) entryId = "";
  @property({ type: String }) focusedRef?: string;
  @property({ type: String }) language?: string;
  @property({ type: String }) heroState: PlayingHeroState = "ready";
  @property({ type: Boolean }) stale = false;
  @property({ type: Boolean }) partial = false;
  @property({ type: Boolean }) serviceOffline = false;

  @state() private activeIndex = 0;
  @query(".session-track") private track?: HTMLElement;

  private cycleTimer?: number;
  private scrollFrame?: number;

  override disconnectedCallback(): void {
    this.stopCycleTimer();
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("items") || changed.has("focusedRef")) {
      const requested = this.items.findIndex((item) => item.ref === this.focusedRef);
      const nextIndex =
        requested >= 0 ? requested : Math.min(this.activeIndex, this.items.length - 1);
      if (nextIndex !== this.activeIndex && nextIndex >= 0) this.activeIndex = nextIndex;
    }
    if (
      changed.has("items") ||
      changed.has("config") ||
      changed.has("heroState") ||
      changed.has("activeIndex")
    ) {
      this.reconcileCycleTimer();
    }
  }

  protected override render() {
    if (this.heroState !== "ready" || this.items.length === 0) {
      return this.renderState();
    }
    const multiple = this.items.length > 1;
    return html`
      <section
        class=${`playing-hero ${multiple ? "multiple" : ""}`}
        aria-label=${this.config?.title ?? translate(this.language, "playing")}
      >
        <div class="session-track" @scroll=${this.onScroll}>
          ${this.items.map((item, index) => this.renderSession(item, index))}
        </div>
        ${multiple ? this.renderNavigation() : nothing}
      </section>
    `;
  }

  private renderState() {
    const unavailable = this.heroState === "unavailable";
    return html`
      <section
        class=${`playing-state ${unavailable ? "unavailable" : "empty"}`}
        role=${unavailable ? "status" : "region"}
        aria-label=${
          unavailable
            ? translate(this.language, "jellyfinUnavailable")
            : translate(this.language, "noPlaying")
        }
      >
        <span class="state-glow" aria-hidden="true"></span>
        <ha-icon
          icon=${unavailable ? "mdi:server-off" : "mdi:octopus"}
          aria-hidden="true"
        ></ha-icon>
        <div>
          <strong
            >${
              unavailable
                ? translate(this.language, "jellyfinUnavailable")
                : translate(this.language, "noPlaying")
            }</strong
          >
          <p>
            ${
              unavailable
                ? translate(this.language, "unavailableSecondary")
                : translate(this.language, "noPlayingSecondary")
            }
          </p>
        </div>
      </section>
    `;
  }

  private renderSession(item: PlayingItem, index: number) {
    const active = index === this.activeIndex;
    const artwork = playingBackgroundArtwork(item);
    const hasDuration = item.duration_seconds > 0;
    const progress = hasDuration ? Math.min(100, Math.max(0, item.progress)) : 0;
    const progressRounded = Math.round(progress);
    const remainingSeconds = hasDuration
      ? Math.max(0, item.duration_seconds - item.position_seconds)
      : 0;
    const editorialParts = playingEditorialParts(item, this.language);
    const technicalChips = playingTechnicalChips(item);
    const hasEnrichedMetadata = editorialParts.length > 0 || technicalChips.length > 0;
    const stateLabel = translate(
      this.language,
      item.state === "paused" ? "pausedStatus" : "playingStatus",
    );
    const device = item.device_alias ?? item.device_name;
    const aria = [
      stateLabel,
      item.title,
      item.subtitle,
      this.config?.show_device ? device : undefined,
      this.config?.show_user ? item.user_name : undefined,
      hasDuration
        ? `${formatPlaybackTime(item.position_seconds)} / ${formatPlaybackTime(item.duration_seconds)}`
        : undefined,
    ]
      .filter(Boolean)
      .join(", ");

    return html`
      <article
        class=${`session ${item.state}${this.stale || this.serviceOffline ? " stale" : ""}`}
        data-active=${String(active)}
        data-has-duration=${String(hasDuration)}
        data-session-index=${String(index)}
        tabindex=${active ? "0" : "-1"}
        aria-label=${aria}
        @focus=${() => {
          this.activate(index, false);
        }}
        @click=${() => {
          this.activate(index, false);
        }}
        @keydown=${(event: KeyboardEvent) => {
          this.onSessionKeydown(event, index);
        }}
      >
        ${
          artwork.ref
            ? html`<octopus-media-image
                class="backdrop"
                aria-hidden="true"
                .hass=${this.hass}
                .entryId=${this.entryId}
                .imageRef=${artwork.ref}
                .variant=${artwork.variant}
                .alt=${""}
                .backdrop=${true}
              ></octopus-media-image>`
            : nothing
        }
        <span class="color-wash" aria-hidden="true"></span>
        <span class="vignette" aria-hidden="true"></span>
        <div class="session-content">
          <div class="poster-shell">
            <octopus-media-image
              class="poster-art"
              .hass=${this.hass}
              .entryId=${this.entryId}
              .imageRef=${item.poster_ref ?? undefined}
              .variant=${"poster-medium"}
              .alt=${item.title}
            ></octopus-media-image>
          </div>
          <div class="copy">
            <span class="playback-eyebrow">${translate(this.language, "playingEyebrow")}</span>
            <div class="copy-topline">
              ${
                this.config?.show_badges
                  ? html`<span class=${`state-badge ${item.state}`}>
                      <ha-icon
                        icon=${item.state === "paused" ? "mdi:pause" : "mdi:play"}
                        aria-hidden="true"
                      ></ha-icon>
                      ${stateLabel}
                    </span>`
                  : nothing
              }
              <span class="media-kind">${translate(this.language, item.type)}</span>
            </div>
            <div class="title-block">
              ${
                this.config?.show_titles
                  ? html`<h3>${item.title}</h3>
                      ${
                        item.subtitle
                          ? html`<p class=${`editorial-meta ${item.type}`}>${item.subtitle}</p>`
                          : nothing
                      }`
                  : nothing
              }
            </div>
            ${
              hasEnrichedMetadata
                ? html`<div class="enriched-metadata">
                    ${
                      editorialParts.length > 0
                        ? html`<p class="editorial-line">
                            ${editorialParts.map((part) => html`<span>${part}</span>`)}
                          </p>`
                        : nothing
                    }
                    ${
                      technicalChips.length > 0
                        ? html`<div class="technical-chips">
                            ${technicalChips.map((chip) => html`<span>${chip}</span>`)}
                          </div>`
                        : nothing
                    }
                  </div>`
                : nothing
            }
            <div class="session-context">
              <div class="session-meta">
                ${
                  this.config?.show_device
                    ? html`<span
                        ><ha-icon icon="mdi:television-play" aria-hidden="true"></ha-icon
                        >${device}</span
                      >`
                    : nothing
                }
                ${
                  this.config?.show_user
                    ? html`<span
                        ><ha-icon icon="mdi:account" aria-hidden="true"></ha-icon
                        >${item.user_name}</span
                      >`
                    : nothing
                }
              </div>
              ${
                this.stale || this.partial || this.serviceOffline
                  ? html`<div class="data-flags" role="status">
                      ${
                        this.stale || this.serviceOffline
                          ? html`<span>${translate(this.language, "staleShort")}</span>`
                          : nothing
                      }
                      ${
                        this.partial
                          ? html`<span>${translate(this.language, "partialShort")}</span>`
                          : nothing
                      }
                    </div>`
                  : nothing
              }
            </div>
            ${
              this.config?.show_progress && hasDuration
                ? html`<div class="progress-block">
                    <div
                      class="progress-track"
                      role="progressbar"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow=${String(progressRounded)}
                      aria-label=${translate(this.language, "playbackProgress")}
                    >
                      <span style=${`width:${String(progress)}%`}></span>
                    </div>
                    ${
                      this.config.show_time
                        ? html`
                            <div class="times">
                              <span class="position"
                                >${formatPlaybackTime(item.position_seconds)}</span
                              >
                              <span class="duration"
                                >${formatPlaybackTime(item.duration_seconds)}</span
                              >
                            </div>
                            <div class="progress-summary">
                              <strong class="percentage"
                                >${progressRounded}%
                                ${translate(this.language, "watchedSuffix")}</strong
                              >
                              <span class="remaining"
                                >${translate(this.language, "remainingPrefix")}
                                ${formatPlaybackTime(remainingSeconds)}</span
                              >
                            </div>
                          `
                        : nothing
                    }
                  </div>`
                : nothing
            }
          </div>
        </div>
      </article>
    `;
  }

  private renderNavigation() {
    const config = this.config;
    return html`
      ${
        config?.show_arrows
          ? html`<div class="session-arrows" aria-label=${translate(this.language, "sessions")}>
              <button
                type="button"
                aria-label=${translate(this.language, "previousSession")}
                ?disabled=${this.activeIndex === 0}
                @click=${() => {
                  this.activate(this.activeIndex - 1, true);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label=${translate(this.language, "nextSession")}
                ?disabled=${this.activeIndex >= this.items.length - 1}
                @click=${() => {
                  this.activate(this.activeIndex + 1, true);
                }}
              >
                ›
              </button>
            </div>`
          : nothing
      }
      ${
        config?.show_indicators
          ? html`<div
              class="session-indicators"
              role="group"
              aria-label=${translate(this.language, "sessions")}
            >
              ${this.items.map(
                (item, index) =>
                  html`<button
                    type="button"
                    data-active=${String(index === this.activeIndex)}
                    aria-label=${`${translate(this.language, "session")} ${String(index + 1)}: ${item.title}`}
                    @click=${() => {
                      this.activate(index, true);
                    }}
                  ></button>`,
              )}
            </div>`
          : nothing
      }
    `;
  }

  private onSessionKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    this.activate(index + delta, true);
  }

  private activate(index: number, focus: boolean): void {
    const bounded = Math.min(this.items.length - 1, Math.max(0, index));
    const item = this.items[bounded];
    if (!item) return;
    this.activeIndex = bounded;
    this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: true,
        composed: true,
        detail: { index: bounded, ref: item.ref },
      }),
    );
    const session = this.renderRoot.querySelector<HTMLElement>(
      `[data-session-index="${String(bounded)}"]`,
    );
    if (typeof session?.scrollIntoView === "function") {
      session.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
    if (focus) session?.focus({ preventScroll: true });
  }

  private readonly onScroll = (): void => {
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = undefined;
      const track = this.track;
      const sessions = [...this.renderRoot.querySelectorAll<HTMLElement>(".session")];
      if (!track || sessions.length < 2) return;
      const left = track.getBoundingClientRect().left;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      sessions.forEach((session, index) => {
        const candidate = Math.abs(session.getBoundingClientRect().left - left);
        if (candidate < distance) {
          closest = index;
          distance = candidate;
        }
      });
      if (closest !== this.activeIndex) this.activate(closest, false);
    });
  };

  private reconcileCycleTimer(): void {
    const shouldCycle =
      this.heroState === "ready" &&
      Boolean(this.config?.autoplay) &&
      this.items.length > 1 &&
      this.isConnected;
    if (!shouldCycle) {
      this.stopCycleTimer();
      return;
    }
    const interval = Math.max(5, this.config?.cycle_interval ?? 10) * 1000;
    this.stopCycleTimer();
    this.cycleTimer = window.setInterval(() => {
      const next = (this.activeIndex + 1) % this.items.length;
      this.activate(next, false);
    }, interval);
  }

  private stopCycleTimer(): void {
    if (this.cycleTimer !== undefined) window.clearInterval(this.cycleTimer);
    this.cycleTimer = undefined;
  }

  static override styles = css`
    :host {
      container-type: inline-size;
      display: block;
      height: 100%;
      min-height: 0;
      min-width: 0;
    }
    .playing-hero,
    .playing-state {
      border: 0;
      border-radius: 13px;
      box-sizing: border-box;
      height: 100%;
      isolation: isolate;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
      position: relative;
    }
    .playing-state {
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 24%), transparent 36%) padding-box,
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 30%), transparent 42%) padding-box,
        linear-gradient(108deg, #032831, #0a101e 50%, #271035) padding-box;
      border: 1px solid rgb(174 202 221 / 30%);
    }
    .playing-hero {
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 24%), transparent 36%) padding-box,
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 30%), transparent 42%) padding-box,
        linear-gradient(108deg, #032831, #0a101e 50%, #271035) padding-box;
      padding: 0;
      transition: filter 160ms ease;
    }
    .session-track {
      display: flex;
      height: 100%;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      touch-action: pan-x pan-y;
    }
    .session-track::-webkit-scrollbar {
      display: none;
    }
    .session {
      background: linear-gradient(112deg, rgb(2 15 21 / 62%), rgb(14 10 26 / 54%));
      box-sizing: border-box;
      flex: 0 0 100%;
      height: 100%;
      isolation: isolate;
      min-width: 0;
      outline: none;
      overflow: hidden;
      position: relative;
      scroll-snap-align: start;
    }
    @media (hover: hover) and (pointer: fine) {
      .playing-hero:has(.session:hover) {
        filter: brightness(1.018);
      }
    }
    .playing-hero:has(.session:focus-visible) {
      filter: brightness(1.018);
    }
    .session.paused .backdrop {
      opacity: 0.6;
      filter: blur(19px) saturate(0.58) brightness(0.46);
    }
    .backdrop,
    .color-wash,
    .vignette {
      inset: -18px;
      pointer-events: none;
      position: absolute;
    }
    .backdrop {
      filter: blur(17px) saturate(0.78) brightness(0.58);
      opacity: 0.84;
      transform: scale(1.075);
      z-index: -3;
    }
    .color-wash {
      background:
        linear-gradient(
          90deg,
          rgb(0 38 47 / 86%),
          rgb(4 15 25 / 68%) 34%,
          rgb(11 10 24 / 38%) 64%,
          rgb(52 15 72 / 54%)
        ),
        radial-gradient(circle at 22% 54%, rgb(36 198 199 / 22%), transparent 34%),
        radial-gradient(circle at 84% 38%, rgb(142 74 212 / 17%), transparent 40%);
      z-index: -2;
    }
    .vignette {
      box-shadow:
        inset 0 0 58px 12px rgb(0 0 0 / 56%),
        inset 0 -46px 52px rgb(0 0 0 / 42%);
      z-index: -1;
    }
    .session-content {
      align-items: center;
      box-sizing: border-box;
      display: grid;
      gap: 13px;
      grid-template-columns: minmax(100px, 31.5%) minmax(0, 1fr);
      height: 100%;
      min-width: 0;
      padding: 10px 12px;
    }
    .poster-shell {
      aspect-ratio: 2 / 3;
      border: 1px solid rgb(203 220 235 / 18%);
      border-radius: 10px;
      box-shadow: 0 12px 26px rgb(0 0 0 / 42%);
      justify-self: start;
      max-height: 100%;
      max-width: 120px;
      overflow: hidden;
      width: 100%;
    }
    .poster-art {
      height: 100%;
      width: 100%;
    }
    .copy {
      align-content: stretch;
      display: grid;
      gap: 0;
      grid-template-rows: auto auto auto minmax(6px, 1fr) auto auto;
      height: min(100%, 160px);
      min-width: 0;
      overflow: hidden;
    }
    .playback-eyebrow {
      align-self: start;
      color: rgb(128 222 218 / 74%);
      font-size: 7.8px;
      font-weight: 650;
      grid-row: 1;
      letter-spacing: 0.14em;
      line-height: 1;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .copy-topline,
    .session-meta,
    .data-flags,
    .times {
      align-items: center;
      display: flex;
      min-width: 0;
    }
    .copy-topline {
      gap: 7px;
      grid-row: 2;
    }
    .state-badge,
    .media-kind,
    .data-flags span {
      align-items: center;
      backdrop-filter: blur(8px);
      border: 1px solid rgb(117 225 216 / 18%);
      border-radius: 999px;
      display: inline-flex;
      font-size: 9px;
      font-weight: 650;
      gap: 3px;
      letter-spacing: 0.02em;
      line-height: 1;
      padding: 3.5px 7px;
      white-space: nowrap;
    }
    .state-badge.playing {
      background: rgb(13 126 119 / 48%);
      border-color: rgb(89 232 219 / 30%);
      box-shadow: 0 0 13px rgb(36 205 198 / 12%);
      color: #8ff2df;
    }
    .state-badge.paused {
      background: rgb(116 74 147 / 54%);
      border-color: rgb(216 166 255 / 32%);
      box-shadow: 0 0 13px rgb(162 103 224 / 12%);
      color: #ebd2ff;
    }
    .state-badge ha-icon {
      --mdc-icon-size: 9px;
      display: inline-flex;
      flex: 0 0 9px;
      height: 9px;
      overflow: visible;
      width: 9px;
    }
    .media-kind {
      background: rgb(3 9 16 / 38%);
      border-color: rgb(210 222 235 / 12%);
      color: rgb(218 227 239 / 68%);
      font-weight: 520;
    }
    h3 {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: #f5f4f8;
      display: -webkit-box;
      font-size: clamp(14px, 4.35cqi, 16px);
      font-weight: 620;
      letter-spacing: -0.01em;
      line-height: 1.06;
      margin: 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    .title-block {
      display: grid;
      gap: 3px;
      grid-row: 3;
      margin-top: 6px;
      min-width: 0;
    }
    .editorial-meta {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: rgb(232 230 240 / 78%);
      display: -webkit-box;
      font-size: 9.5px;
      font-weight: 540;
      line-height: 1.18;
      margin: 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    .editorial-meta.episode {
      color: rgb(196 225 231 / 86%);
    }
    .enriched-metadata {
      display: none;
      min-width: 0;
    }
    .enriched-metadata p {
      margin: 0;
    }
    .editorial-line {
      color: rgb(203 219 227 / 76%);
      font-size: 9.5px;
      font-weight: 540;
      line-height: 1.2;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .editorial-line span + span::before {
      color: rgb(159 183 196 / 48%);
      content: " · ";
    }
    .technical-chips {
      align-items: center;
      display: flex;
      flex-wrap: nowrap;
      gap: 5px;
      min-width: 0;
      overflow: hidden;
    }
    .technical-chips span {
      background: rgb(4 13 22 / 32%);
      border: 1px solid rgb(151 206 219 / 12%);
      border-radius: 999px;
      color: rgb(197 218 228 / 68%);
      flex: 0 0 auto;
      font-size: 8px;
      font-weight: 560;
      letter-spacing: 0.035em;
      line-height: 1;
      padding: 3px 6px;
      white-space: nowrap;
    }
    .session-meta {
      color: rgb(223 230 240 / 82%);
      flex-wrap: wrap;
      font-size: 9.5px;
      gap: 5px 10px;
      line-height: 1.15;
    }
    .session-meta span {
      align-items: center;
      background: rgb(2 11 19 / 24%);
      border: 1px solid rgb(159 213 220 / 10%);
      border-radius: 999px;
      display: inline-flex;
      gap: 6px;
      max-width: 100%;
      overflow: visible;
      padding: 3.5px 6px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session-meta ha-icon {
      --mdc-icon-size: 13px;
      display: inline-flex;
      flex: 0 0 auto;
      flex-shrink: 0;
      color: rgb(109 224 218 / 76%);
      height: 13px;
      line-height: 1;
      overflow: visible;
      width: 13px;
    }
    .session-context {
      align-self: end;
      display: grid;
      gap: 4px;
      grid-row: 5;
      min-width: 0;
    }
    .data-flags {
      gap: 4px;
    }
    .data-flags span {
      background: rgb(101 65 16 / 42%);
      border-color: rgb(244 201 109 / 22%);
      color: #f4d287;
      font-size: 7.8px;
      padding: 2px 5px;
    }
    .progress-block {
      display: grid;
      gap: 4px;
      grid-row: 6;
      margin-top: 8px;
      min-width: 0;
    }
    .progress-track {
      background: rgb(214 226 242 / 18%);
      border: 1px solid rgb(211 229 244 / 8%);
      border-radius: 999px;
      box-sizing: border-box;
      height: 6px;
      overflow: visible;
      position: relative;
    }
    .progress-track > span {
      background: linear-gradient(90deg, #7f5be3, #39d0ce);
      border-radius: inherit;
      box-shadow:
        0 0 9px rgb(57 208 206 / 45%),
        inset 0 0 3px rgb(255 255 255 / 24%);
      display: block;
      height: 100%;
      max-width: 100%;
      position: relative;
      transition: width 800ms linear;
    }
    .progress-track > span::after {
      background: #8ffcf0;
      border-radius: 50%;
      box-shadow: 0 0 7px #42d8d2;
      content: "";
      height: 7px;
      position: absolute;
      right: -2px;
      top: -1.5px;
      width: 7px;
    }
    .times {
      color: rgb(226 233 244 / 82%);
      font-size: 8.8px;
      font-variant-numeric: tabular-nums;
      font-weight: 560;
      justify-content: space-between;
      line-height: 1;
    }
    .progress-summary {
      align-items: center;
      color: rgb(210 219 232 / 68%);
      display: flex;
      font-size: 8.8px;
      justify-content: space-between;
      line-height: 1.1;
      min-width: 0;
    }
    .percentage {
      color: #a9f2e8;
      font-size: inherit;
      font-weight: 620;
    }
    .remaining {
      font-variant-numeric: tabular-nums;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session.paused .progress-track > span,
    .session.stale .progress-track > span {
      transition: none;
    }
    .session-arrows {
      bottom: 9px;
      display: flex;
      gap: 4px;
      position: absolute;
      right: 9px;
      z-index: 6;
    }
    .session-arrows button {
      align-items: center;
      background: rgb(3 8 15 / 42%);
      border: 1px solid rgb(217 225 239 / 14%);
      border-radius: 50%;
      color: rgb(237 241 248 / 78%);
      display: inline-flex;
      font: inherit;
      height: 23px;
      justify-content: center;
      padding: 0;
      width: 23px;
    }
    .session-arrows button:disabled {
      opacity: 0.22;
    }
    .session-arrows button:not(:disabled):hover,
    .session-arrows button:not(:disabled):focus-visible {
      border-color: rgb(71 213 211 / 48%);
      color: white;
      outline: none;
    }
    .session-indicators {
      display: flex;
      gap: 4px;
      left: 50%;
      position: absolute;
      bottom: 7px;
      transform: translateX(-50%);
      z-index: 6;
    }
    .session-indicators button {
      background: rgb(229 233 244 / 28%);
      border: 0;
      border-radius: 999px;
      height: 3px;
      padding: 0;
      transition: width 140ms ease;
      width: 8px;
    }
    .session-indicators button[data-active="true"] {
      background: linear-gradient(90deg, #a272f0, #48d4d0);
      width: 17px;
    }
    .playing-state {
      align-items: center;
      display: grid;
      gap: 14px;
      grid-template-columns: auto minmax(0, 1fr);
      padding: 20px 24px;
    }
    .playing-state::before {
      background:
        radial-gradient(circle at 24% 48%, rgb(30 190 191 / 14%), transparent 32%),
        radial-gradient(circle at 86% 40%, rgb(139 74 211 / 20%), transparent 42%);
      content: "";
      inset: 0;
      pointer-events: none;
      position: absolute;
    }
    .playing-state .state-glow {
      background: radial-gradient(circle, rgb(128 72 210 / 28%), transparent 70%);
      border-radius: 50%;
      height: 120px;
      left: -24px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 150px;
    }
    .playing-state > ha-icon {
      color: #ab73f2;
      filter: drop-shadow(0 0 13px rgb(146 85 226 / 38%));
      height: 42px;
      position: relative;
      width: 42px;
    }
    .playing-state.unavailable > ha-icon {
      color: #d9a85f;
    }
    .playing-state div {
      display: grid;
      gap: 5px;
      min-width: 0;
      position: relative;
    }
    .playing-state strong {
      color: #f1edf7;
      font-size: 15px;
      font-weight: 620;
      line-height: 1.1;
    }
    .playing-state p {
      color: rgb(211 215 228 / 64%);
      font-size: 9.5px;
      line-height: 1.3;
      margin: 0;
    }
    :host([data-appearance="light"]) .playing-hero,
    :host([data-appearance="light"]) .playing-state {
      color: #172832;
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 16%), transparent 36%),
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 12%), transparent 42%),
        linear-gradient(108deg, #e8f3f3, #f4f1f7 50%, #eee7f4);
      border-color: rgb(43 104 111 / 20%);
    }
    :host([data-appearance="light"]) h3,
    :host([data-appearance="light"]) .playing-state strong {
      color: #172832;
    }
    :host([data-appearance="light"]) .editorial-meta,
    :host([data-appearance="light"]) .session-meta,
    :host([data-appearance="light"]) .session-meta span,
    :host([data-appearance="light"]) .playing-state p {
      color: #5d7179;
    }
    @media (prefers-color-scheme: light) {
      :host([data-appearance="auto"]) .playing-hero,
      :host([data-appearance="auto"]) .playing-state {
        color: #172832;
        background:
          radial-gradient(circle at 11% 32%, rgb(21 163 177 / 16%), transparent 36%),
          radial-gradient(circle at 88% 40%, rgb(121 58 191 / 12%), transparent 42%),
          linear-gradient(108deg, #e8f3f3, #f4f1f7 50%, #eee7f4);
        border-color: rgb(43 104 111 / 20%);
      }
      :host([data-appearance="auto"]) h3,
      :host([data-appearance="auto"]) .playing-state strong {
        color: #172832;
      }
      :host([data-appearance="auto"]) .editorial-meta,
      :host([data-appearance="auto"]) .session-meta,
      :host([data-appearance="auto"]) .session-meta span,
      :host([data-appearance="auto"]) .playing-state p {
        color: #5d7179;
      }
    }
    @container (min-width: 560px) {
      .session-content {
        gap: 24px;
        grid-template-columns: 138px minmax(0, 1fr);
        padding: 10px 28px 10px 14px;
      }
      .poster-shell {
        height: 100%;
        max-height: none;
        max-width: 138px;
        width: auto;
      }
      .copy {
        align-content: stretch;
        gap: 0;
        grid-template-rows: auto auto auto auto minmax(8px, 1fr) auto auto;
        height: 100%;
        padding: 2px 0;
      }
      .playback-eyebrow {
        font-size: 8.2px;
        margin-bottom: 6px;
      }
      .copy-topline {
        align-self: start;
      }
      h3 {
        font-size: clamp(18px, 2.5cqi, 20px);
      }
      .title-block {
        align-content: start;
        margin-top: 6px;
      }
      .editorial-meta {
        font-size: 11px;
      }
      .editorial-meta.movie {
        display: none;
      }
      .enriched-metadata {
        align-self: start;
        display: grid;
        grid-row: 4;
        margin-top: 5px;
      }
      .enriched-metadata .technical-chips {
        display: none;
      }
      .editorial-line span:nth-child(n + 4) {
        display: none;
      }
      .session-context {
        grid-row: 6;
      }
      .session-meta {
        align-self: end;
        font-size: 10.25px;
        gap: 8px 16px;
      }
      .session-meta span {
        gap: 7px;
        padding: 4px 9px;
      }
      .session-meta ha-icon {
        --mdc-icon-size: 14px;
        height: 14px;
        width: 14px;
      }
      .progress-block {
        gap: 5px;
        grid-row: 7;
        margin-top: 9px;
      }
      .times,
      .progress-summary {
        font-size: 9.5px;
      }
      .progress-track {
        height: 6px;
      }
      .playing-hero.multiple .session {
        flex-basis: calc(100% - 112px);
      }
    }
    @container (min-width: 640px) {
      .editorial-line span:nth-child(4) {
        display: inline;
      }
    }
    @container (min-width: 700px) {
      .enriched-metadata {
        gap: 6px;
      }
      .enriched-metadata .technical-chips {
        display: flex;
      }
      .editorial-line {
        font-size: 10px;
      }
      .editorial-line span:nth-child(n) {
        display: inline;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .session-track {
        scroll-behavior: auto;
      }
      .playing-hero,
      .progress-track > span,
      .session-indicators button {
        transition: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-playing-hero": PlayingHero;
  }
}
