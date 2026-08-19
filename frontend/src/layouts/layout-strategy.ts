import type { TemplateResult } from "lit";

import type { CardMode, OctopusMediaCardConfig } from "../config";
import type { HomeAssistant } from "../ha-types";
import type { MediaItem } from "../models";
import type { PlayingHeroState } from "../components/playing-hero";

export interface LayoutContext {
  config: OctopusMediaCardConfig;
  entryId: string;
  focusedItemRef?: string;
  hass?: HomeAssistant;
  height: number;
  heroState?: PlayingHeroState;
  items: MediaItem[];
  language?: string;
  mode: CardMode;
  partial?: boolean;
  serviceOffline?: boolean;
  stale?: boolean;
  width: number;
}

export type LayoutRenderer = (context: LayoutContext) => TemplateResult;
