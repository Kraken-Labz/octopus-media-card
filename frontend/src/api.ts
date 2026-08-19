import type { HomeAssistant, UnsubscribeFunc } from "./ha-types";
import type { DashboardSnapshot, EntrySummary, SnapshotEvent } from "./models";

export async function getEntries(hass: HomeAssistant): Promise<EntrySummary[]> {
  const response = await hass.connection.sendMessagePromise<{ entries: EntrySummary[] }>({
    type: "octopus_media/get_entries",
  });
  return response.entries;
}

export function subscribeSnapshot(
  hass: HomeAssistant,
  entryId: string,
  callback: (snapshot: DashboardSnapshot) => void,
): Promise<UnsubscribeFunc> {
  return hass.connection.subscribeMessage<SnapshotEvent>((event) => callback(event.snapshot), {
    type: "octopus_media/subscribe_snapshot",
    entry_id: entryId,
  });
}

export function isConfigEntryNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  if (code === "not_found") return true;
  const message =
    error instanceof Error
      ? error.message
      : "message" in error && typeof error.message === "string"
        ? error.message
        : "";
  return message.includes("Config entry is not loaded");
}
