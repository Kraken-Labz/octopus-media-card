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
