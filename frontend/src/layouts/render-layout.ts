import type { CardLayout } from "../config";
import { renderCompactLayout } from "./compact-layout";
import { renderGridLayout } from "./grid-layout";
import { renderHeroLayout } from "./hero-layout";
import type { LayoutContext } from "./layout-strategy";
import { renderListLayout } from "./list-layout";
import { renderPortraitLayout } from "./portrait-layout";
import { renderStripLayout } from "./strip-layout";

export function renderLayout(layout: Exclude<CardLayout, "auto">, context: LayoutContext) {
  switch (layout) {
    case "grid":
      return renderGridLayout(context);
    case "hero":
      return renderHeroLayout(context);
    case "compact":
      return renderCompactLayout(context);
    case "portrait":
      return renderPortraitLayout(context);
    case "list":
      return renderListLayout(context);
    case "strip":
      return renderStripLayout(context);
  }
}

export function renderUpcoming(context: LayoutContext) {
  return renderStripLayout(context);
}
