import { describe, expect, it } from "vitest";

import type { HomeAssistant, UnsubscribeFunc } from "../src/ha-types";
import type { DashboardSnapshot } from "../src/models";
import { playingOne, recentThreeMovies, snapshotEvent, upcomingVisualDesktop } from "./fixtures";
import "../src/octopus-media-editor";

function editorHass(
  snapshot: DashboardSnapshot,
  entries = [
    {
      entry_id: "fixture_entry_001",
      title: "Fixture Media",
      capabilities: { recent: true, upcoming: true, playing: true },
    },
  ],
): HomeAssistant {
  return {
    config: { time_zone: "Etc/UTC" },
    language: "en",
    connection: {
      sendMessagePromise<T>(message: Record<string, unknown>): Promise<T> {
        if (message.type === "octopus_media/get_entries") {
          return Promise.resolve({
            entries,
          } as T);
        }
        return Promise.resolve({} as T);
      },
      subscribeMessage<T>(callback: (message: T) => void): Promise<UnsubscribeFunc> {
        callback(snapshotEvent(snapshot) as T);
        return Promise.resolve(() => undefined);
      },
    },
  };
}

describe("visual editor", () => {
  it("represents a stale entry separately and allows selecting the replacement ID", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "old",
    });
    editor.hass = editorHass(recentThreeMovies, [
      {
        entry_id: "new",
        title: "Octopus Media",
        capabilities: { recent: true, upcoming: true, playing: true },
      },
    ]);
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;

    expect(editor.shadowRoot?.textContent).toContain("Octopus configuration not found");
    const select = editor.shadowRoot?.querySelector("select") as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    if (!select) throw new Error("The editor did not render the integration selector");
    expect(select.value).toBe("old");
    expect([...select.options].map((option) => [option.value, option.textContent.trim()])).toEqual([
      ["old", "Previous configuration (unavailable)"],
      ["new", "Octopus Media"],
    ]);

    let emittedEntryId: string | undefined;
    editor.addEventListener("config-changed", (event) => {
      emittedEntryId = (event as CustomEvent<{ config: { entry_id: string } }>).detail.config
        .entry_id;
    });
    select.value = "new";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await editor.updateComplete;
    expect(emittedEntryId).toBe("new");
    expect(select.value).toBe("new");
    expect(editor.shadowRoot?.textContent).not.toContain("Octopus configuration not found");
    editor.remove();
  });

  it("keeps duplicate entry titles distinct by entry_id", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({ type: "custom:octopus-media-card", entry_id: "new_b" });
    editor.hass = editorHass(recentThreeMovies, [
      {
        entry_id: "new_a",
        title: "Octopus Media",
        capabilities: { recent: true, upcoming: true, playing: true },
      },
      {
        entry_id: "new_b",
        title: "Octopus Media",
        capabilities: { recent: true, upcoming: true, playing: true },
      },
    ]);
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;

    const select = editor.shadowRoot?.querySelector("select") as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    if (!select) throw new Error("The editor did not render the integration selector");
    expect(select.value).toBe("new_b");
    expect([...select.options].map((option) => option.value)).toEqual(["new_a", "new_b"]);
    editor.remove();
  });

  it("renders the real recent snapshot and only the supported controls", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({ type: "custom:octopus-media-card", entry_id: "select_entry" });
    editor.hass = editorHass(recentThreeMovies);
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;

    const strip = editor.shadowRoot?.querySelector("octopus-media-strip") as
      (HTMLElement & { items?: { title: string }[] }) | null;
    expect(strip).not.toBeNull();
    expect(strip?.items?.map((item) => item.title)).toContain("The Clockwork Island");
    const entrySelect = editor.shadowRoot?.querySelector("select") as HTMLSelectElement | null;
    expect(entrySelect?.value).toBe("fixture_entry_001");
    const modeSelect = editor.shadowRoot?.querySelectorAll("select")[1];
    expect([...(modeSelect?.options ?? [])].map((option) => option.value)).toEqual([
      "recent",
      "upcoming",
      "playing",
    ]);
    expect(editor.shadowRoot?.querySelector(".badge")).toBeNull();
    expect(editor.shadowRoot?.textContent).toContain("Preview");
    expect(editor.shadowRoot?.textContent).not.toContain("Official strip preview");
    expect(editor.shadowRoot?.textContent).not.toContain("390px");
    expect(editor.shadowRoot?.textContent).not.toContain("800px");
    expect(editor.shadowRoot?.textContent).not.toContain("Visual concept");
    expect(editor.shadowRoot?.textContent).not.toContain("Accent color");
    expect(editor.shadowRoot?.textContent).not.toContain("Title position");
    expect(editor.shadowRoot?.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it("renders the real playing snapshot without strip-only controls", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "playing",
    });
    editor.hass = editorHass(playingOne);
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;

    const hero = editor.shadowRoot?.querySelector("octopus-playing-hero") as
      (HTMLElement & { items?: { title: string }[] }) | null;
    expect(hero).not.toBeNull();
    expect(hero?.items?.map((item) => item.title)).toContain("The Clockwork Island");
    expect(editor.shadowRoot?.textContent).toContain("Preview");
    expect(editor.shadowRoot?.querySelector('input[type="checkbox"]')).toBeNull();
    expect(editor.shadowRoot?.querySelector('input[type="number"]')).toBeNull();
    expect(editor.shadowRoot?.textContent).not.toContain("Official strip preview");
  });

  it("renders real upcoming data through the same editor preview", async () => {
    const editor = document.createElement("octopus-media-editor");
    editor.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "upcoming",
    });
    editor.hass = editorHass(upcomingVisualDesktop);
    document.body.append(editor);
    await editor.updateComplete;
    await editor.updateComplete;

    const strip = editor.shadowRoot?.querySelector("octopus-media-strip") as
      (HTMLElement & { items?: { title: string }[] }) | null;
    expect(strip).not.toBeNull();
    expect(strip?.items?.map((item) => item.title)).toContain("Dune: Part Three");
    expect(strip?.items?.map((item) => item.title)).toContain("The Quiet Harbor");
  });
});
