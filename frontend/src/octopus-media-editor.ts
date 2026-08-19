import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import { getEntries, isConfigEntryNotFound, subscribeSnapshot } from "./api";
import { MODES, normalizeConfig, type CardMode, type OctopusMediaCardConfig } from "./config";
import type { HomeAssistant, LovelaceCardConfig, UnsubscribeFunc } from "./ha-types";
import { AutoLayoutController } from "./layouts/auto-layout";
import { renderLayout, renderUpcoming } from "./layouts/render-layout";
import { translate, type TranslationKey } from "./localization";
import type { DashboardSnapshot, EntrySummary } from "./models";
import "./components/empty-state";
import "./components/error-state";
import "./components/loading-state";

@customElement("octopus-media-editor")
export class OctopusMediaEditor extends LitElement {
  @state() private config?: OctopusMediaCardConfig;
  @state() private entries: EntrySummary[] = [];
  @state() private previewWidth = 600;
  @state() private previewSnapshot?: DashboardSnapshot;
  @state() private previewLoading = false;
  @state() private previewError?: string;
  @state() private configurationMissing = false;
  private hassValue?: HomeAssistant;
  private previewUnsubscribe?: UnsubscribeFunc;
  private previewEntryId?: string;
  private previewGeneration = 0;
  private resizeObserver?: ResizeObserver;
  private readonly autoLayout = new AutoLayoutController();

  set hass(value: HomeAssistant) {
    this.hassValue = value;
    void this.loadEntries();
    void this.ensurePreviewSubscription();
  }

  get hass(): HomeAssistant | undefined {
    return this.hassValue;
  }

  setConfig(config: LovelaceCardConfig): void {
    const previousEntryId = this.config?.entry_id;
    this.config = normalizeConfig(config);
    if (previousEntryId !== this.config.entry_id) this.resetPreviewSubscription();
    void this.ensurePreviewSubscription();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.ensurePreviewSubscription();
  }

  override disconnectedCallback(): void {
    this.resetPreviewSubscription();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    if (typeof ResizeObserver === "undefined") return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      if (width > 0 && Math.abs(width - this.previewWidth) >= 1) {
        this.previewWidth = Math.max(320, Math.round(width));
      }
    });
    this.resizeObserver.observe(this);
  }

  protected override render() {
    if (!this.config) return html``;
    const modes = this.compatibleModes();
    return html`
      <div class="form">
        <label>
          ${this.t("integration")}
          <select @change=${this.onEntryChange}>
            ${
              this.config.entry_id === "select_entry"
                ? html`<option value="select_entry" selected>
                    ${this.t("selectIntegration")}
                  </option>`
                : nothing
            }
            ${
              this.selectedEntryMissing
                ? html`<option value=${this.config.entry_id} selected>
                    ${this.t("previousConfigurationUnavailable")}
                  </option>`
                : nothing
            }
            ${this.entries.map(
              (entry) =>
                html`<option
                  value=${entry.entry_id}
                  ?selected=${entry.entry_id === this.config?.entry_id}
                >
                  ${entry.title}
                </option>`,
            )}
          </select>
        </label>
        ${
          this.configurationMissing || this.selectedEntryMissing
            ? html`<p class="configuration-warning" role="alert">
                <strong>${this.t("configurationNotFound")}</strong>
                <span>${this.t("configurationNotFoundSecondary")}</span>
              </p>`
            : nothing
        }
        <label>
          ${this.t("contentMode")}
          <select .value=${this.config.mode} @change=${this.onModeChange}>
            ${modes.map((mode) => html`<option value=${mode}>${this.t(mode)}</option>`)}
          </select>
        </label>
        <label>
          ${this.t("appearance")}
          <select .value=${this.config.appearance} @change=${this.onAppearanceChange}>
            <option value="auto">${this.t("appearanceAuto")}</option>
            <option value="dark">${this.t("appearanceDark")}</option>
            <option value="light">${this.t("appearanceLight")}</option>
          </select>
        </label>
        ${
          this.isStripMode()
            ? html`
                <label>
                  ${this.t("itemCount")}
                  <input
                    type="number"
                    min="1"
                    max="50"
                    .value=${String(this.config.item_count)}
                    @change=${this.onItemCountChange}
                  />
                </label>
                <label class="check standalone">
                  <input
                    type="checkbox"
                    .checked=${this.config.auto_scroll}
                    @change=${this.onAutoScrollChange}
                  />
                  ${this.t("autoScroll")}
                </label>
                ${
                  this.config.auto_scroll
                    ? html`<label>
                        ${this.t("autoScrollInterval")}
                        <input
                          type="number"
                          min="2"
                          max="3600"
                          .value=${String(this.config.auto_scroll_interval)}
                          @change=${this.onAutoScrollIntervalChange}
                        />
                      </label>`
                    : nothing
                }
              `
            : nothing
        }
        <section class="preview-panel" aria-label=${this.t("previewCard")}>
          <strong>${this.t("preview")}</strong>
          ${this.renderPreview()}
        </section>
      </div>
    `;
  }

  private renderPreview() {
    if (!this.config || this.config.entry_id === "select_entry") {
      return html`<octopus-empty-state
        .message=${this.t("selectIntegration")}
      ></octopus-empty-state>`;
    }
    if (this.configurationMissing || this.selectedEntryMissing) {
      return html`<octopus-empty-state
        .message=${this.t("configurationNotFound")}
        .secondary=${this.t("configurationNotFoundSecondary")}
      ></octopus-empty-state>`;
    }
    if (this.previewLoading) {
      return html`<octopus-loading-state .message=${this.t("loading")}></octopus-loading-state>`;
    }
    if (this.previewError) {
      return html`<octopus-error-state .message=${this.previewError}></octopus-error-state>`;
    }
    if (!this.previewSnapshot) {
      return html`<octopus-empty-state
        .message=${this.t("previewUnavailable")}
      ></octopus-empty-state>`;
    }

    const mode = this.effectiveMode();
    const section = this.previewSnapshot[mode];
    const items = section.items.slice(0, this.config.item_count);
    const height = mode === "playing" ? 240 : 210;
    const resolvedLayout =
      this.config.layout === "auto"
        ? this.autoLayout.update(mode, this.previewWidth, height)
        : this.config.layout;
    const offline = this.previewSnapshot.availability.jellyfin.state === "offline";
    const strip = mode !== "playing";
    const state =
      items.length > 0
        ? nothing
        : mode === "playing" && (offline || section.stale)
          ? html`<octopus-error-state .message=${this.t("unavailable")}></octopus-error-state>`
          : mode === "upcoming" &&
              this.previewSnapshot.availability.radarr.state === "not_configured" &&
              this.previewSnapshot.availability.sonarr.state === "not_configured"
            ? html`<octopus-empty-state
                .message=${this.t("upcomingNotConfigured")}
              ></octopus-empty-state>`
            : html`<octopus-empty-state
                .message=${this.t(mode === "playing" ? "noPlaying" : "empty")}
              ></octopus-empty-state>`;

    return html`
      <article
        class="preview-card real-preview"
        data-appearance=${this.previewAppearance()}
        data-mode=${mode}
        data-wide=${String(this.previewWidth >= 560)}
      >
        ${
          strip
            ? html`
                <header>
                  <span>${this.t(mode === "recent" ? "recentEyebrow" : "upcomingEyebrow")}</span>
                  <small>${items.length}</small>
                </header>
              `
            : nothing
        }
        ${
          state !== nothing
            ? state
            : mode === "upcoming"
              ? renderUpcoming({
                  config: this.config,
                  entryId: this.config.entry_id,
                  focusedItemRef: items[0]?.ref,
                  hass: this.hassValue,
                  height,
                  items,
                  language: this.hassValue?.language,
                  mode,
                  partial: section.partial,
                  stale: section.stale,
                  width: this.previewWidth,
                })
              : renderLayout(resolvedLayout, {
                  config: this.config,
                  entryId: this.config.entry_id,
                  focusedItemRef: items[0]?.ref,
                  hass: this.hassValue,
                  height,
                  heroState: mode === "playing" ? "ready" : undefined,
                  items,
                  language: this.hassValue?.language,
                  mode,
                  partial: section.partial,
                  serviceOffline: offline,
                  stale: section.stale,
                  width: this.previewWidth,
                })
        }
      </article>
    `;
  }

  private effectiveMode(): CardMode {
    return this.config?.mode ?? "recent";
  }

  private isStripMode(): boolean {
    return this.effectiveMode() !== "playing";
  }

  private previewAppearance(): "dark" | "light" {
    if (this.config?.appearance === "light") return "light";
    if (this.config?.appearance === "dark") return "dark";
    return this.hassValue?.themes?.darkMode === false ? "light" : "dark";
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
    return MODES.filter((mode) => entry.capabilities[mode]);
  }

  private get selectedEntryMissing(): boolean {
    return Boolean(
      this.config &&
      this.config.entry_id !== "select_entry" &&
      !this.entries.some((entry) => entry.entry_id === this.config?.entry_id),
    );
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
    void this.ensurePreviewSubscription();
  }

  private onEntryChange(event: Event): void {
    const entryId = (event.target as HTMLSelectElement).value;
    if (entryId !== this.config?.entry_id) this.resetPreviewSubscription();
    this.updateConfig({ entry_id: entryId });
  }

  private onModeChange(event: Event): void {
    this.updateConfig({ mode: (event.target as HTMLSelectElement).value as CardMode });
  }

  private onAppearanceChange(event: Event): void {
    this.updateConfig({
      appearance: (event.target as HTMLSelectElement).value as OctopusMediaCardConfig["appearance"],
    });
  }

  private onItemCountChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateConfig({ item_count: Math.min(50, Math.max(1, Math.round(value))) });
  }

  private onAutoScrollIntervalChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.updateConfig({ auto_scroll_interval: Math.min(3600, Math.max(2, Math.round(value))) });
  }

  private onAutoScrollChange(event: Event): void {
    this.updateConfig({ auto_scroll: (event.target as HTMLInputElement).checked });
  }

  private t(key: TranslationKey): string {
    return translate(this.hassValue?.language, key);
  }

  private async ensurePreviewSubscription(): Promise<void> {
    const entryId = this.config?.entry_id;
    if (!this.isConnected || !this.hassValue || !entryId || entryId === "select_entry") return;
    if (this.previewUnsubscribe && this.previewEntryId === entryId) return;

    this.resetPreviewSubscription();
    const generation = ++this.previewGeneration;
    this.previewEntryId = entryId;
    this.previewLoading = true;
    this.previewError = undefined;
    this.configurationMissing = false;
    try {
      const unsubscribe = await subscribeSnapshot(this.hassValue, entryId, (snapshot) => {
        if (generation !== this.previewGeneration) return;
        this.previewSnapshot = snapshot;
        this.previewLoading = false;
        this.previewError = undefined;
      });
      if (generation !== this.previewGeneration) {
        unsubscribe();
      } else {
        this.previewUnsubscribe = unsubscribe;
      }
    } catch (error: unknown) {
      if (generation !== this.previewGeneration) return;
      this.previewLoading = false;
      this.configurationMissing = isConfigEntryNotFound(error);
      this.previewError = error instanceof Error ? error.message : this.t("previewUnavailable");
    }
  }

  private resetPreviewSubscription(): void {
    this.previewGeneration += 1;
    this.previewUnsubscribe?.();
    this.previewUnsubscribe = undefined;
    this.previewEntryId = undefined;
    this.previewSnapshot = undefined;
    this.previewLoading = false;
    this.previewError = undefined;
    this.configurationMissing = false;
  }

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
    .configuration-warning {
      background: color-mix(in srgb, var(--warning-color, #d98b22) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--warning-color, #d98b22) 45%, transparent);
      border-radius: 8px;
      display: grid;
      gap: 3px;
      padding: 10px;
    }
    .preview-panel {
      display: grid;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
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
      height: 240px;
      max-width: 100%;
      overflow: hidden;
      padding: 0 9px;
      width: 100%;
    }
    .preview-card[data-appearance="light"] {
      --octopus-text: #172832;
      background:
        radial-gradient(circle at 13% 35%, rgb(41 190 195 / 18%), transparent 34%),
        radial-gradient(circle at 72% 24%, rgb(157 112 220 / 14%), transparent 37%),
        linear-gradient(105deg, #e8f3f3, #f4f1f7 48%, #eee7f4);
      color: #172832;
    }
    .real-preview[data-mode="recent"],
    .real-preview[data-mode="upcoming"] {
      height: 210px;
    }
    .real-preview[data-mode="playing"] {
      grid-template-rows: minmax(0, 1fr);
    }
    .real-preview > octopus-media-strip,
    .real-preview > octopus-playing-hero,
    .real-preview > octopus-empty-state,
    .real-preview > octopus-error-state,
    .real-preview > octopus-loading-state {
      display: block;
      height: 100%;
      min-height: 0;
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
