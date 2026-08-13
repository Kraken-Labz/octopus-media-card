import { describe, expect, it } from "vitest";

import type { HomeAssistant } from "../src/ha-types";
import "../src/octopus-media-editor";

describe("visual editor", () => {
  it("loads fictitious entries and renders its minimal fields", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({ type: "custom:octopus-media-card", entry_id: "fixture_entry_001" });
    editor.hass = {
      config: { time_zone: "Etc/UTC" },
      language: "en",
      connection: {
        sendMessagePromise<T>(): Promise<T> {
          return Promise.resolve({
            entries: [
              {
                entry_id: "fixture_entry_001",
                title: "Fixture Media",
                capabilities: { recent: true, upcoming: false, playing: true },
              },
            ],
          } as T);
        },
        subscribeMessage(): Promise<() => void> {
          return Promise.resolve(() => undefined);
        },
      },
    } satisfies HomeAssistant;
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;
    expect(editor.shadowRoot?.querySelectorAll("label").length).toBeGreaterThanOrEqual(13);
    expect(editor.shadowRoot?.textContent).toContain("Fixture Media");
    expect(editor.shadowRoot?.querySelector("octopus-media-strip")).not.toBeNull();
    expect(editor.shadowRoot?.textContent).toContain("Official strip preview");
  });

  it("shows the playing hero preview and read-only display controls", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "playing",
      layout: "hero",
      height: 240,
    });
    document.body.append(editor);
    await editor.updateComplete;
    expect(editor.shadowRoot?.querySelector("octopus-playing-hero")).not.toBeNull();
    expect(editor.shadowRoot?.textContent).toContain("Playing hero preview");
    for (const field of [
      "show_device",
      "show_user",
      "show_progress",
      "show_time",
      "show_badges",
      "autoplay",
      "show_arrows",
      "show_indicators",
    ]) {
      expect(editor.shadowRoot?.querySelector(`[data-field="${field}"]`)).not.toBeNull();
    }
    expect(editor.shadowRoot?.textContent.toLowerCase()).not.toMatch(/\b(play|pause|stop|seek)\b/);
  });
});
