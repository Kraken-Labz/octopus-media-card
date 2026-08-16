export interface StripGeometry {
  gap: number;
  peekFraction: number;
  peekWidth: number;
  posterHeight: number;
  posterWidth: number;
  usefulWidth: number;
  visibleFullItems: number;
}

const NARROW_HORIZONTAL_CHROME = 18;
const WIDE_HORIZONTAL_CHROME = 70;
const FOCUS_CLEARANCE_AND_HEADER = 30;
const TARGET_PEEK_FRACTION = 0.22;

export function calculateStripGeometry(
  containerWidth: number,
  containerHeight: number,
  postersVisible: "auto" | number = "auto",
  itemCount = Number.POSITIVE_INFINITY,
  densityItemCount = itemCount,
): StripGeometry {
  const narrow = containerWidth < 560;
  const horizontalChrome = narrow ? NARROW_HORIZONTAL_CHROME : WIDE_HORIZONTAL_CHROME;
  const usefulWidth = Math.max(1, containerWidth - horizontalChrome);
  const defaultFullItems = narrow ? 3 : 5;
  const requestedFullItems = postersVisible === "auto" ? defaultFullItems : postersVisible;
  let targetFullItems = Math.max(1, Math.min(requestedFullItems, Math.max(1, densityItemCount)));
  const gap = narrow ? 10 : 12;
  const availablePosterHeight = Math.max(1, containerHeight - FOCUS_CLEARANCE_AND_HEADER);
  const heightForTarget = (fullItems: number): number => {
    const hasNextItem = densityItemCount > fullItems;
    const peekFraction = hasNextItem ? TARGET_PEEK_FRACTION : 0;
    const gaps = hasNextItem ? fullItems : Math.max(0, fullItems - 1);
    return Math.max(1, ((usefulWidth - gaps * gap) / (fullItems + peekFraction)) * 1.5);
  };
  let heightForTargetDensity = heightForTarget(targetFullItems);
  const defaultTarget = Math.min(defaultFullItems, Math.max(1, densityItemCount));
  if (
    targetFullItems < defaultTarget &&
    heightForTargetDensity > availablePosterHeight &&
    densityItemCount > targetFullItems
  ) {
    targetFullItems = defaultTarget;
    heightForTargetDensity = heightForTarget(targetFullItems);
  }
  const posterHeight = Math.min(availablePosterHeight, heightForTargetDensity);
  const posterWidth = posterHeight * (2 / 3);
  const visibleFullItems = Math.max(
    1,
    Math.min(itemCount, Math.floor((usefulWidth + gap) / (posterWidth + gap))),
  );
  const hasNextItem = itemCount > visibleFullItems;
  const occupiedByFullItems =
    visibleFullItems * posterWidth + Math.max(0, visibleFullItems - 1) * gap;
  const peekWidth = hasNextItem ? Math.max(0, usefulWidth - occupiedByFullItems - gap) : 0;

  return {
    gap,
    peekFraction: peekWidth / posterWidth,
    peekWidth,
    posterHeight,
    posterWidth,
    usefulWidth,
    visibleFullItems,
  };
}

/**
 * Keeps strip card density stable between media sources while the real item
 * count still controls overflow, navigation, and the absence of a fake peek.
 */
export function calculateCanonicalStripGeometry(
  containerWidth: number,
  containerHeight: number,
  postersVisible: "auto" | number = "auto",
  itemCount = Number.POSITIVE_INFINITY,
): StripGeometry {
  return calculateStripGeometry(
    containerWidth,
    containerHeight,
    postersVisible,
    itemCount,
    Number.POSITIVE_INFINITY,
  );
}
