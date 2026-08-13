import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import { getEntries } from "./api";
import {
  LAYOUTS,
  MODES,
  normalizeConfig,
  THEMES,
  VISUAL_CONCEPTS,
  type CardLayout,
  type CardMode,
  type CardTheme,
  type OctopusMediaCardConfig,
  type VisualConcept,
} from "./config";
import type { HomeAssistant, LovelaceCardConfig } from "./ha-types";
import { calculateStripGeometry } from "./layouts/strip-geometry";
import type { EntrySummary, PlayingItem, RecentItem } from "./models";
import "./components/media-strip";
import "./components/playing-hero";

const PREVIEW_ITEMS: RecentItem[] = Array.from({ length: 12 }, (_, index) => ({
  ref: `editor_fixture_${String(index + 1).padStart(2, "0")}`,
  type: index === 2 ? "episode" : "movie",
  title:
    index === 1
      ? "The Very Long Fictional Voyage Beyond Quiet Constellations"
      : ([
          "Violet Tides",
          "Silent Meridian",
          "Octopus Station",
          "Neon Harbor",
          "Glass Moons",
          "Midnight Signal",
        ][index % 6] ?? "Fixture Media"),
  subtitle: "Fictional preview",
  year: 2030 - (index % 4),
  season: index === 2 ? 2 : null,
  episode: index === 2 ? 4 : null,
  episode_count: index === 2 ? 1 : 0,
  added_at: "2030-04-05T10:00:00Z",
  rating: 7.2 + (index % 7) / 10,
  poster_ref: null,
  still_ref: null,
  backdrop_ref: null,
}));

const PREVIEW_PLAYING_ITEMS: PlayingItem[] = [
  {
    ref: "editor_playing_fixture_01",
    device_name: "Fictional display",
    device_alias: "Octopus lounge",
    user_name: "Demo viewer",
    state: "playing",
    type: "episode",
    title: "Harbor of Small Comets",
    genres: ["Drama", "Adventure"],
    rating: 8.7,
    video_resolution: "1080p",
    video_hdr: false,
    audio_channels: "5.1",
    subtitle: "T02E04 · A Map of Quiet Water",
    position_seconds: 1240,
    duration_seconds: 3120,
    progress: 39.74,
    poster_ref: null,
    still_ref: null,
    backdrop_ref: null,
    updated_at: "2030-04-05T12:00:00Z",
  },
  {
    ref: "editor_playing_fixture_02",
    device_name: "Fictional tablet",
    device_alias: null,
    user_name: "Sample viewer",
    state: "paused",
    type: "movie",
    title: "Lanterns Beyond Europa",
    genres: ["Science fiction"],
    rating: null,
    video_resolution: null,
    video_hdr: false,
    audio_channels: null,
    subtitle: "2029",
    position_seconds: 1800,
    duration_seconds: 5400,
    progress: 33.33,
    poster_ref: null,
    still_ref: null,
    backdrop_ref: null,
    updated_at: "2030-04-05T12:00:00Z",
  },
];

@customElement("octopus-media-editor")
export class OctopusMediaEditor extends LitElement {
  @state() private config?: OctopusMediaCardConfig;
  @state() private entries: EntrySummary[] = [];
  @state() private previewWidth: 390 | 800 = 390;
  private hassValue?: HomeAssistant;

  set hass(value: HomeAssistant) {
    this.hassValue = value;
    void this.loadEntries();
  }

  get hass(): HomeAssistant | undefined {
    return this.hassValue;
  }

  setConfig(config: LovelaceCardConfig): void {
    this.config = normalizeConfig(config);
  }

  protected override render() {
    if (!this.config) return html``;
    const modes = this.compatibleModes();
    return html`
      <div class="form">
        <label>
          Integration
          <select .value=${this.config.entry_id} @change=${this.onEntryChange}>
            ${this.entries.map(
              (entry) => html`<option value=${entry.entry_id}>${entry.title}</option>`,
            )}
          </select>
        </label>
        <label>
          Mode
          <select .value=${this.config.mode} @change=${this.onModeChange}>
            ${modes.map((mode) => html`<option value=${mode}>${mode}</option>`)}
          </select>
        </label>
        <label>
          Layout
          <select .value=${this.config.layout} @change=${this.onLayoutChange}>
            ${LAYOUTS.map((layout) => html`<option value=${layout}>${layout}</option>`)}
          </select>
        </label>
        <label>
          Title
          <input .value=${this.config.title ?? ""} @input=${this.onTitleInput} />
        </label>
        <label>
          Visual concept
          <select .value=${this.config.visual_concept} @change=${this.onConceptChange}>
            ${VISUAL_CONCEPTS.map((concept) => html`<option value=${concept}>${concept}</option>`)}
          </select>
        </label>
        <label>
          Title position
          <select .value=${this.config.title_position} @change=${this.onTitlePositionChange}>
            <option value="overlay">overlay</option>
            <option value="below">below</option>
          </select>
        </label>
        <label>
          Height
          <input
            .value=${String(this.config.height)}
            inputmode="numeric"
            @change=${this.onHeightChange}
          />
        </label>
        <label>
          Theme
          <select .value=${this.config.theme} @change=${this.onThemeChange}>
            ${THEMES.map((theme) => html`<option value=${theme}>${theme}</option>`)}
          </select>
        </label>
        <label>
          Accent color
          <input
            type="color"
            .value=${this.config.accent_color ?? "#8b5cf6"}
            @input=${this.onAccentInput}
          />
        </label>
        <label>
          Item count
          <input
            type="number"
            min="1"
            max="50"
            .value=${String(this.config.item_count)}
            @change=${this.onItemCountChange}
          />
        </label>
        <fieldset>
          <legend>${this.isPlayingHeroPreview() ? "Playing hero" : "Strip content"}</legend>
          ${this.booleanControl("Titles", "show_titles", this.config.show_titles)}
          ${this.booleanControl("Badges", "show_badges", this.config.show_badges)}
          ${
            this.isPlayingHeroPreview()
              ? html`
                  ${this.booleanControl("Device", "show_device", this.config.show_device)}
                  ${this.booleanControl("User", "show_user", this.config.show_user)}
                  ${this.booleanControl("Progress", "show_progress", this.config.show_progress)}
                  ${this.booleanControl("Time", "show_time", this.config.show_time)}
                  ${this.booleanControl("Autoplay", "autoplay", this.config.autoplay)}
                  ${this.booleanControl(
                    "Indicators",
                    "show_indicators",
                    this.config.show_indicators,
                  )}
                `
              : ""
          }
          ${this.booleanControl("Arrows", "show_arrows", this.config.show_arrows)}
        </fieldset>
        ${
          this.isPlayingHeroPreview()
            ? html`<label>
                Cycle interval (seconds)
                <input
                  type="number"
                  min="5"
                  max="3600"
                  .value=${String(this.config.cycle_interval)}
                  @change=${this.onCycleIntervalChange}
                />
              </label>`
            : ""
        }
        <section
          class="preview-panel"
          aria-label=${
            this.isPlayingHeroPreview() ? "Playing hero preview" : "Official strip preview"
          }
        >
          <div class="preview-toolbar">
            <strong
              >${
                this.isPlayingHeroPreview() ? "Playing hero preview" : "Official strip preview"
              }</strong
            >
            <div class="preview-widths" role="group" aria-label="Preview width">
              ${([390, 800] as const).map(
                (width) => html`
                  <button
                    type="button"
                    data-selected=${String(width === this.previewWidth)}
                    @click=${() => {
                      this.previewWidth = width;
                    }}
                  >
                    ${width}px
                  </button>
                `,
              )}
            </div>
          </div>
          ${this.renderPreview()}
          <p>Prévia determinística: títulos e imagens são inteiramente fictícios.</p>
        </section>
      </div>
    `;
  }

  private renderPreview() {
    if (!this.config) return html``;
    const height =
      typeof this.config.height === "number"
        ? Math.min(280, Math.max(180, this.config.height))
        : this.previewWidth === 390
          ? 210
          : 240;
    if (this.isPlayingHeroPreview()) {
      return this.renderPlayingHeroPreview(height);
    }
    const items = PREVIEW_ITEMS.slice(0, this.config.item_count);
    const geometry = calculateStripGeometry(
      this.previewWidth,
      height,
      this.config.posters_visible,
      items.length,
    );
    const style = [
      `--preview-width:${String(this.previewWidth)}px`,
      `--preview-height:${String(height)}px`,
      `--octopus-media-accent:${this.config.accent_color ?? "#8b5cf6"}`,
    ].join(";");
    return html`
      <article class="preview-card" data-wide=${String(this.previewWidth >= 560)} style=${style}>
        <header>
          <span
            ><ha-icon icon="mdi:octopus"></ha-icon>${this.config.title ?? "Recém-adicionados"}</span
          >
          <small>${items.length}</small>
        </header>
        <octopus-media-strip
          .hass=${undefined}
          .items=${items}
          .entryId=${"editor-fixture"}
          .focusedRef=${items[0]?.ref}
          .posterHeight=${geometry.posterHeight}
          .posterWidth=${geometry.posterWidth}
          .gap=${geometry.gap}
          .wide=${this.previewWidth >= 560}
          .showTitles=${this.config.show_titles}
          .showDates=${this.config.show_dates}
          .showRatings=${this.config.show_ratings}
          .showBadges=${this.config.show_badges}
          .showArrows=${this.config.show_arrows}
        ></octopus-media-strip>
      </article>
    `;
  }

  private renderPlayingHeroPreview(height: number) {
    if (!this.config) return html``;
    const style = [
      `--preview-width:${String(this.previewWidth)}px`,
      `--preview-height:${String(height)}px`,
      `--octopus-media-accent:${this.config.accent_color ?? "#8b5cf6"}`,
    ].join(";");
    return html`
      <article class="preview-card playing-preview" style=${style}>
        <header>
          <span><ha-icon icon="mdi:octopus"></ha-icon>${this.config.title ?? "Tocando agora"}</span>
          <small>${PREVIEW_PLAYING_ITEMS.length}</small>
        </header>
        <octopus-playing-hero
          .config=${this.config}
          .hass=${undefined}
          .entryId=${"editor-fixture"}
          .items=${PREVIEW_PLAYING_ITEMS}
          .focusedRef=${PREVIEW_PLAYING_ITEMS[0]?.ref}
          .language=${this.hassValue?.language}
          .heroState=${"ready"}
        ></octopus-playing-hero>
      </article>
    `;
  }

  private isPlayingHeroPreview(): boolean {
    return (
      this.config?.mode === "playing" &&
      (this.config.layout === "hero" || this.config.layout === "auto")
    );
  }

  private booleanControl(
    label: string,
    field:
      | "show_titles"
      | "show_badges"
      | "show_arrows"
      | "show_device"
      | "show_user"
      | "show_progress"
      | "show_time"
      | "autoplay"
      | "show_indicators",
    checked: boolean,
  ) {
    return html`
      <label class="check">
        <input
          type="checkbox"
          data-field=${field}
          .checked=${checked}
          @change=${this.onBooleanChange}
        />
        ${label}
      </label>
    `;
  }

  private async loadEntries(): Promise<void> {
    if (!this.hassValue) return;
    try {
      this.entries = await getEntries(this.hassValue);
      if (this.entries.length === 1 && this.config?.entry_id === "select_entry") {
        this.updateConfig({ entry_id: this.entries[0]?.entry_id ?? "select_entry" });
      }
    } catch {
      this.entries = [];
    }
  }

  private compatibleModes(): CardMode[] {
    const entry = this.entries.find((candidate) => candidate.entry_id === this.config?.entry_id);
    if (!entry) return [...MODES];
    const modes = MODES.filter((mode) => mode === "carousel" || entry.capabilities[mode]);
    const hasAny = modes.some((mode) => mode !== "carousel");
    return modes.filter((mode) => mode !== "carousel" || hasAny);
  }

  private updateConfig(change: Partial<OctopusMediaCardConfig>): void {
    if (!this.config) return;
    this.config = { ...this.config, ...change };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: this.config },
      }),
    );
  }

  private onEntryChange(event: Event): void {
    this.updateConfig({ entry_id: (event.target as HTMLSelectElement).value });
  }

  private onModeChange(event: Event): void {
    this.updateConfig({ mode: (event.target as HTMLSelectElement).value as CardMode });
  }

  private onLayoutChange(event: Event): void {
    this.updateConfig({ layout: (event.target as HTMLSelectElement).value as CardLayout });
  }

  private onTitleInput(event: Event): void {
    this.updateConfig({ title: (event.target as HTMLInputElement).value });
  }

  private onConceptChange(event: Event): void {
    this.updateConfig({
      visual_concept: (event.target as HTMLSelectElement).value as VisualConcept,
    });
  }

  private onTitlePositionChange(event: Event): void {
    this.updateConfig({
      title_position: (event.target as HTMLSelectElement).value as "overlay" | "below",
    });
  }

  private onHeightChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.updateConfig({ height: value === "auto" ? "auto" : Number(value) });
  }

  private onThemeChange(event: Event): void {
    this.updateConfig({ theme: (event.target as HTMLSelectElement).value as CardTheme });
  }

  private onAccentInput(event: Event): void {
    this.updateConfig({ accent_color: (event.target as HTMLInputElement).value });
  }

  private onItemCountChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateConfig({ item_count: Math.min(50, Math.max(1, Math.round(value))) });
  }

  private onCycleIntervalChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateConfig({ cycle_interval: Math.min(3600, Math.max(5, Math.round(value))) });
  }

  private readonly onBooleanChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const field = input.dataset.field as
      | "show_titles"
      | "show_badges"
      | "show_arrows"
      | "show_device"
      | "show_user"
      | "show_progress"
      | "show_time"
      | "autoplay"
      | "show_indicators"
      | undefined;
    if (!field) return;
    this.updateConfig({ [field]: input.checked });
  };

  static override styles = css`
    .form {
      display: grid;
      gap: 12px;
      padding: 8px 0;
    }
    label {
      display: grid;
      font: inherit;
      gap: 5px;
    }
    fieldset {
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      display: flex;
      gap: 16px;
      margin: 0;
      padding: 10px;
    }
    .check {
      align-items: center;
      display: flex;
      gap: 6px;
    }
    .check input {
      min-height: 0;
    }
    input,
    select {
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      color: var(--primary-text-color, #111);
      font: inherit;
      min-height: 44px;
      padding: 8px;
    }
    p {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
      margin: 0;
    }
    .preview-panel {
      display: grid;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }
    .preview-toolbar {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
    .preview-widths {
      display: flex;
      gap: 6px;
    }
    button {
      background: var(--secondary-background-color, #eef0f3);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 7px;
      color: var(--primary-text-color, #111);
      cursor: pointer;
      padding: 6px 9px;
    }
    button[data-selected="true"] {
      border-color: var(--octopus-media-accent, #8b5cf6);
      box-shadow: 0 0 0 1px var(--octopus-media-accent, #8b5cf6);
    }
    .preview-card {
      --octopus-text: #f3f6fb;
      background:
        radial-gradient(circle at 13% 35%, rgb(24 174 191 / 34%), transparent 34%),
        radial-gradient(circle at 72% 24%, rgb(139 82 214 / 32%), transparent 37%),
        linear-gradient(105deg, #032d36, #121329 48%, #321447);
      border-radius: 14px;
      box-sizing: border-box;
      color: #f3f6fb;
      display: grid;
      grid-template-rows: 22px minmax(0, 1fr);
      height: var(--preview-height);
      max-width: 100%;
      overflow: hidden;
      padding: 0 9px;
      width: var(--preview-width);
    }
    .preview-card[data-wide="true"] {
      padding-inline: 35px;
    }
    .preview-card header {
      align-items: center;
      display: flex;
      font-size: 12.5px;
      justify-content: space-between;
    }
    .preview-card header span {
      align-items: center;
      display: flex;
      gap: 5px;
    }
    .preview-card ha-icon {
      color: var(--octopus-media-accent, #aa75f2);
      height: 14px;
      width: 14px;
    }
    .preview-card small {
      opacity: 0.7;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "octopus-media-editor": OctopusMediaEditor;
  }
}
