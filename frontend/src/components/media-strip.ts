import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HomeAssistant } from "../ha-types";
import { translate } from "../localization";
import type { MediaItem } from "../models";
import "./media-image";

@customElement("octopus-media-strip")
export class MediaStrip extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) items: MediaItem[] = [];
  @property({ type: String }) entryId = "";
  @property({ type: String }) focusedRef?: string;
  @property({ type: Number }) posterHeight = 160;
  @property({ type: Number }) posterWidth = 106.67;
  @property({ type: Number }) gap = 10;
  @property({ type: Boolean, reflect: true }) wide = false;
  @property({ type: Boolean }) showTitles = true;
  @property({ type: Boolean }) showDates = true;
  @property({ type: Boolean }) showRatings = true;
  @property({ type: Boolean }) showBadges = true;
  @property({ type: Boolean }) showArrows = true;
  @property({ type: Boolean }) autoScroll = false;
  @property({ type: Number }) autoScrollInterval = 6;
  @property({ type: String, attribute: "data-appearance" }) appearance: "dark" | "light" = "dark";
  @property({ type: String }) variant: "recent" | "upcoming" = "recent";
  @property({ type: Boolean }) partial = false;
  @property({ type: Boolean }) stale = false;

  @state() private canGoBack = false;
  @state() private canGoForward = false;

  private itemSignature = "";
  private resizeObserver?: ResizeObserver;
  private scrollFrame?: number;
  private autoScrollTimer?: number;
  private autoScrollPaused = false;

  private reducedMotion(): boolean {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = undefined;
    this.stopAutoScroll();
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    const track = this.track();
    if (track && typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateNavigation());
      this.resizeObserver.observe(track);
    }
    this.resetForItems();
    this.reconcileAutoScroll();
  }

  protected override updated(): void {
    const signature = this.items.map((item) => item.ref).join("|");
    if (signature !== this.itemSignature) this.resetForItems(signature);
    queueMicrotask(() => this.updateNavigation());
    this.reconcileAutoScroll();
  }

  protected override render() {
    const style = `--octopus-strip-poster-height:${String(this.posterHeight)}px;--octopus-strip-poster-width:${String(this.posterWidth)}px;--octopus-strip-gap:${String(this.gap)}px`;
    return html`
      <div
        class="track"
        style=${style}
        role="list"
        aria-label=${translate(
          this.hass?.language,
          this.variant === "upcoming" ? "upcoming" : "recent",
        )}
        @keydown=${this.onKeyDown}
        @scroll=${this.onScroll}
        @wheel=${this.onWheel}
        @pointerenter=${this.onPointerEnterTrack}
        @pointerleave=${this.onPointerLeaveTrack}
        @pointerdown=${this.onPointerDownTrack}
        @pointerup=${this.onPointerUpTrack}
        @focusin=${this.onFocusInTrack}
        @focusout=${this.onFocusOutTrack}
      >
        ${this.items.map(
          (item) => html`
            <button
              class="poster"
              type="button"
              role="listitem"
              aria-label=${this.accessibleLabel(item)}
              data-focused=${String(item.ref === this.focusedRef)}
              @pointerenter=${(event: PointerEvent) => this.onPointerEnter(event, item)}
              @click=${() => this.announceFocus(item)}
              @focus=${() => this.announceFocus(item)}
            >
              <span class="frame">
                <octopus-media-image
                  data-appearance=${this.appearance}
                  .hass=${this.hass}
                  .entryId=${this.entryId}
                  .imageRef=${item.poster_ref ?? undefined}
                  .variant=${this.posterWidth < 125 ? "poster-small" : "poster-medium"}
                  .alt=${item.title}
                ></octopus-media-image>
                ${
                  this.variant === "recent" && this.showBadges
                    ? html`<span class="badge">${this.badge(item)}</span>`
                    : nothing
                }
                ${
                  this.showTitles
                    ? html`
                        <span class="copy-gradient">
                          <span class="title">${item.title}</span>
                          ${
                            this.metadata(item)
                              ? html`<span class="metadata">${this.metadata(item)}</span>`
                              : nothing
                          }
                          ${
                            this.upcomingEpisodeSubtitle(item)
                              ? html`<span class="episode-subtitle"
                                  >${this.upcomingEpisodeSubtitle(item)}</span
                                >`
                              : nothing
                          }
                        </span>
                      `
                    : nothing
                }
              </span>
            </button>
          `,
        )}
      </div>
      ${
        this.showArrows
          ? html`
              <button
                class="arrow previous"
                type="button"
                aria-label="Voltar pôsteres"
                ?hidden=${!this.canGoBack}
                @click=${() => this.scrollByPage(-1)}
              >
                ‹
              </button>
              <button
                class="arrow next"
                type="button"
                aria-label="Avançar pôsteres"
                ?hidden=${!this.canGoForward}
                @click=${() => this.scrollByPage(1)}
              >
                ›
              </button>
            `
          : nothing
      }
      ${this.stale ? html`<span class="state stale" role="status">${translate(this.hass?.language, "stale")}</span>` : nothing}
      ${this.partial ? html`<span class="state partial" role="status">${translate(this.hass?.language, "partialShort")}</span>` : nothing}
    `;
  }

  private track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".track");
  }

  private resetForItems(signature = this.items.map((item) => item.ref).join("|")): void {
    this.itemSignature = signature;
    const track = this.track();
    if (track) track.scrollLeft = 0;
    this.updateNavigation();
    const first = this.items[0];
    if (first) this.announceFocus(first);
  }

  private readonly onPointerEnter = (event: PointerEvent, item: MediaItem): void => {
    if (event.pointerType === "mouse") this.announceFocus(item);
  };

  private readonly onScroll = (): void => {
    this.updateNavigation();
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = undefined;
      const track = this.track();
      if (!track) return;
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      const posters = [...this.renderRoot.querySelectorAll<HTMLElement>(".poster")];
      const closest = posters.reduce<{ distance: number; index: number } | undefined>(
        (candidate, poster, index) => {
          const rect = poster.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - center);
          return !candidate || distance < candidate.distance ? { distance, index } : candidate;
        },
        undefined,
      );
      const item = closest ? this.items[closest.index] : undefined;
      if (item) this.announceFocus(item);
    });
  };

  private readonly onWheel = (event: WheelEvent): void => {
    this.pauseAutoScroll();
    const track = this.track();
    if (!track || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || event.deltaY === 0) return;
    if (track.scrollWidth <= track.clientWidth) return;
    event.preventDefault();
    track.scrollLeft += event.deltaY;
  };

  private readonly onPointerEnterTrack = (): void => this.pauseAutoScroll();
  private readonly onPointerLeaveTrack = (): void => this.resumeAutoScroll();
  private readonly onPointerDownTrack = (): void => this.pauseAutoScroll();
  private readonly onPointerUpTrack = (): void => this.resumeAutoScroll();
  private readonly onFocusInTrack = (): void => this.pauseAutoScroll();
  private readonly onFocusOutTrack = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.track()?.contains(next)) this.resumeAutoScroll();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    this.scrollByPage(event.key === "ArrowLeft" ? -1 : 1);
  };

  private updateNavigation(): void {
    const track = this.track();
    if (!track) return;
    this.canGoBack = track.scrollLeft > 2;
    this.canGoForward = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
  }

  private scrollByPage(direction: -1 | 1): void {
    const track = this.track();
    if (!track) return;
    track.scrollBy({
      behavior: this.reducedMotion() ? "auto" : "smooth",
      left: direction * track.clientWidth * 0.82,
    });
  }

  private reconcileAutoScroll(): void {
    this.stopAutoScroll();
    if (!this.autoScroll || this.items.length < 2 || this.reducedMotion()) {
      return;
    }
    const track = this.track();
    if (!track || track.scrollWidth <= track.clientWidth + 2 || this.autoScrollPaused) return;
    this.autoScrollTimer = window.setInterval(
      () => this.advanceAutoScroll(),
      Math.max(2, this.autoScrollInterval) * 1000,
    );
  }

  private stopAutoScroll(): void {
    if (this.autoScrollTimer !== undefined) window.clearInterval(this.autoScrollTimer);
    this.autoScrollTimer = undefined;
  }

  private pauseAutoScroll(): void {
    this.autoScrollPaused = true;
    this.stopAutoScroll();
  }

  private resumeAutoScroll(): void {
    if (!this.autoScrollPaused) return;
    this.autoScrollPaused = false;
    this.reconcileAutoScroll();
  }

  private advanceAutoScroll(): void {
    const track = this.track();
    if (!track || track.scrollWidth <= track.clientWidth + 2) {
      this.stopAutoScroll();
      return;
    }
    const first = this.renderRoot.querySelector<HTMLElement>(".poster");
    if (!first) return;
    const step = first.offsetWidth + this.gap;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step - 2;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
  }

  private announceFocus(item: MediaItem): void {
    if (item.ref === this.focusedRef) return;
    this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: true,
        composed: true,
        detail: { ref: item.ref },
      }),
    );
  }

  private accessibleLabel(item: MediaItem): string {
    const metadata = this.metadata(item);
    return metadata ? `${item.title}, ${metadata}` : item.title;
  }

  private badge(item: MediaItem): string {
    if (this.variant === "upcoming") return item.type === "episode" ? "EPISÓDIO" : "FILME";
    if (item.type === "episode" && "season" in item && item.season !== null) {
      const season = `T${String(item.season).padStart(2, "0")}`;
      return item.episode === null ? season : `${season}E${String(item.episode).padStart(2, "0")}`;
    }
    return translate(this.hass?.language, item.type);
  }

  private metadata(item: MediaItem): string {
    if (this.variant === "upcoming" && "release_at" in item) {
      const date = this.upcomingDate(item);
      if (item.type === "episode") {
        const code =
          item.season_number !== null && item.season_number !== undefined
            ? `T${String(item.season_number).padStart(2, "0")}${item.episode_number === null || item.episode_number === undefined ? "" : `E${String(item.episode_number).padStart(2, "0")}`}`
            : "";
        return [code, date].filter(Boolean).join(" · ");
      }
      return [date, this.releaseType(item.release_type)].filter(Boolean).join(" · ");
    }
    const parts: string[] = [];
    if (this.showDates) {
      if ("season" in item && item.season !== null) {
        const season = `T${String(item.season).padStart(2, "0")}`;
        parts.push(
          item.episode === null ? season : `${season}E${String(item.episode).padStart(2, "0")}`,
        );
      } else if ("year" in item && item.year !== null) {
        parts.push(String(item.year));
      } else if ("release_at" in item) {
        parts.push(this.formatDate(item.release_at));
      } else if (item.subtitle) {
        parts.push(item.subtitle);
      }
    }
    if (this.showRatings && "rating" in item && item.rating !== null) {
      parts.push(`★ ${item.rating.toFixed(1)}`);
    }
    return parts.join(" · ");
  }

  private upcomingEpisodeSubtitle(item: MediaItem): string | undefined {
    if (this.variant !== "upcoming" || item.type !== "episode" || !this.wide) return undefined;
    return item.subtitle ?? undefined;
  }

  private upcomingDate(item: Extract<MediaItem, { release_at: string }>): string {
    if (item.relative_day === "today") return "HOJE";
    if (item.relative_day === "tomorrow") return "AMANHÃ";
    const value =
      item.all_day && /^\d{4}-\d{2}-\d{2}$/.test(item.release_at)
        ? new Date(`${item.release_at}T12:00:00Z`)
        : new Date(item.release_at);
    if (Number.isNaN(value.getTime())) return "";
    const date = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC",
    })
      .format(value)
      .replace(".", "")
      .replace(/\s+DE\s+/i, " ")
      .toUpperCase();
    if (item.all_day) return date;
    const time = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: this.hass?.config.time_zone ?? "UTC",
    }).format(value);
    return `${date} · ${time}`;
  }

  private releaseType(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    return { digital: "Digital", physical: "Físico", cinema: "Cinema", theatrical: "Cinema" }[
      value.toLowerCase()
    ];
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC",
    }).format(date);
  }

  static override styles = css`
    :host {
      display: block;
      height: 100%;
      min-width: 0;
      position: relative;
    }
    .track {
      align-items: center;
      display: flex;
      gap: var(--octopus-strip-gap, 10px);
      height: 100%;
      justify-content: flex-start;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-inline: contain;
      scroll-behavior: smooth;
      scrollbar-width: none;
      touch-action: pan-x pan-y;
    }
    .track::-webkit-scrollbar {
      display: none;
    }
    .poster {
      appearance: none;
      background: transparent;
      border: 0;
      box-sizing: border-box;
      color: inherit;
      cursor: pointer;
      flex: 0 0 var(--octopus-strip-poster-width);
      height: var(--octopus-strip-poster-height);
      margin: 0;
      padding: 0;
      position: relative;
      scroll-snap-align: start;
      text-align: left;
      transform: translateY(0) scale(1);
      transition:
        transform 150ms ease,
        filter 150ms ease;
      width: var(--octopus-strip-poster-width);
    }
    .poster:first-child {
      transform-origin: left center;
    }
    .frame {
      aspect-ratio: 2 / 3;
      border: 1px solid rgb(225 236 247 / 16%);
      border-radius: 9px;
      box-shadow: 0 7px 15px rgb(0 0 0 / 36%);
      box-sizing: border-box;
      display: block;
      height: 100%;
      overflow: hidden;
      position: relative;
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
      width: 100%;
    }
    octopus-media-image {
      height: 100%;
      width: 100%;
    }
    .copy-gradient {
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgb(2 4 8 / 3%) 34%,
        rgb(2 4 8 / 16%) 54%,
        rgb(2 4 8 / 58%) 76%,
        rgb(2 4 8 / 94%) 100%
      );
      bottom: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 42%;
      justify-content: flex-end;
      left: 0;
      padding: 20px 6px 6px;
      position: absolute;
      right: 0;
    }
    :host([variant="upcoming"]) .copy-gradient {
      height: 56%;
      padding: 24px 7px 7px;
    }
    .title {
      color: rgb(242 244 248 / 88%);
      display: -webkit-box;
      font-size: 10.5px;
      font-weight: 600;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      letter-spacing: -0.01em;
      line-height: 1.06;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    :host([data-appearance="light"]) .title,
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title {
      color: rgb(255 255 255 / 94%);
    }
    :host([data-appearance="light"]) .metadata,
    :host([data-appearance="light"]) .episode-subtitle {
      color: var(--octopus-media-muted, #5d7179);
    }
    :host([data-appearance="light"]) .frame {
      border-color: rgb(28 99 107 / 20%);
      box-shadow: 0 8px 18px rgb(32 87 94 / 18%);
    }
    :host([data-appearance="light"]) .copy-gradient {
      background: linear-gradient(
        180deg,
        rgb(2 8 12 / 0%) 0%,
        rgb(2 8 12 / 12%) 34%,
        rgb(2 8 12 / 46%) 58%,
        rgb(2 8 12 / 82%) 100%
      );
    }
    :host([data-appearance="light"]) .title,
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title,
    :host([data-appearance="light"]) .metadata,
    :host([data-appearance="light"]) .episode-subtitle {
      color: rgb(255 255 255 / 94%);
    }
    :host([data-appearance="light"]) .badge {
      background: rgb(250 255 255 / 78%);
      border-color: rgb(30 139 145 / 22%);
      color: #27434b;
    }
    :host([data-appearance="light"]) .arrow {
      background: rgb(255 255 255 / 78%);
      border-color: rgb(30 139 145 / 22%);
      box-shadow: 0 5px 14px rgb(32 87 94 / 16%);
      color: #24515a;
    }
    @media (prefers-color-scheme: light) {
      :host([data-appearance="auto"]) .title,
      :host([data-appearance="auto"]) .poster:hover .title,
      :host([data-appearance="auto"]) .poster:focus-visible .title,
      :host([data-appearance="auto"]) .poster[data-focused="true"] .title {
        color: var(--octopus-media-title, #172832);
      }
      :host([data-appearance="auto"]) .metadata,
      :host([data-appearance="auto"]) .episode-subtitle {
        color: var(--octopus-media-muted, #5d7179);
      }
    }
    :host([variant="upcoming"]) .title {
      font-size: 11px;
      line-height: 1.1;
    }
    .metadata {
      color: rgb(203 213 226 / 66%);
      font-size: 8.5px;
      line-height: 1.04;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([variant="upcoming"]) .metadata {
      color: rgb(210 220 232 / 78%);
      font-size: 9px;
    }
    :host([wide]) .metadata {
      color: rgb(111 220 231 / 82%);
    }
    .episode-subtitle {
      color: rgb(203 213 226 / 58%);
      display: none;
      font-size: 8px;
      line-height: 1.04;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([wide]) .episode-subtitle {
      display: block;
    }
    .badge {
      backdrop-filter: blur(7px);
      background: rgb(3 7 12 / 70%);
      border: 1px solid rgb(230 239 247 / 16%);
      border-radius: 999px;
      color: rgb(242 244 248 / 84%);
      font-size: 7.75px;
      left: 5px;
      line-height: 14px;
      max-width: calc(100% - 10px);
      overflow: hidden;
      padding: 0 4px;
      position: absolute;
      text-overflow: ellipsis;
      top: 5px;
      white-space: nowrap;
    }
    .poster:hover,
    .poster:focus-visible,
    .poster[data-focused="true"] {
      filter: brightness(1.04);
      transform: translateY(-3px) scale(1.02);
      z-index: 2;
    }
    .poster:hover .frame,
    .poster:focus-visible .frame,
    .poster[data-focused="true"] .frame {
      border-color: color-mix(
        in srgb,
        var(--octopus-media-accent, #aa75f2) 72%,
        rgb(97 211 226 / 45%)
      );
      box-shadow:
        0 15px 29px rgb(0 0 0 / 52%),
        0 0 0 1px rgb(97 211 226 / 12%),
        0 0 17px color-mix(in srgb, var(--octopus-media-accent, #aa75f2) 28%, transparent);
    }
    :host([data-appearance="light"]) .poster:hover {
      filter: none;
    }
    :host([data-appearance="light"]) .poster:hover .frame {
      border-color: rgb(38 125 135 / 24%);
      box-shadow: 0 11px 23px rgb(32 87 94 / 20%);
    }
    :host([data-appearance="light"]) .poster:focus-visible,
    :host([data-appearance="light"]) .poster[data-focused="true"] {
      filter: none;
    }
    :host([data-appearance="light"]) .poster:focus-visible .frame,
    :host([data-appearance="light"]) .poster[data-focused="true"] .frame {
      border-color: rgb(27 157 166 / 72%);
      box-shadow:
        0 10px 22px rgb(32 87 94 / 18%),
        0 0 0 2px rgb(27 157 166 / 58%);
    }
    .poster:hover .title,
    .poster:focus-visible .title,
    .poster[data-focused="true"] .title {
      color: #fff;
    }
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title {
      color: var(--octopus-media-title, #172832);
    }
    .arrow {
      align-items: center;
      backdrop-filter: blur(8px);
      background: rgb(4 7 13 / 62%);
      border: 1px solid rgb(222 231 242 / 16%);
      border-radius: 999px;
      color: rgb(244 247 251 / 76%);
      cursor: pointer;
      display: flex;
      font-size: 14px;
      height: 22px;
      justify-content: center;
      opacity: 0.4;
      padding: 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      z-index: 4;
    }
    .arrow:hover,
    .arrow:focus-visible {
      opacity: 0.94;
    }
    .arrow[hidden] {
      display: none;
    }
    .previous {
      left: -6px;
    }
    .next {
      right: -6px;
    }
    .state {
      bottom: -1px;
      font-size: 8px;
      position: absolute;
      right: 4px;
    }
    .stale {
      color: #f4c96d;
    }
    .partial {
      color: #d7b6ff;
    }
    :host([wide]) .previous {
      left: -30px;
    }
    :host([wide]) .next {
      right: -30px;
    }
    @media (pointer: coarse) {
      .arrow {
        display: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        scroll-behavior: auto;
      }
      .poster,
      .frame {
        transition: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-media-strip": MediaStrip;
  }
}
