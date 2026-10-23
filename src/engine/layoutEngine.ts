import { TimelineItem, LaneItem, StaggeredNode } from '../types/timeline';
import { yearToScreenX } from './coordinates';

/**
 * Packs periods into vertical lanes (rows) to prevent horizontal overlaps
 * Uses a greedy interval-packing algorithm.
 */
export function computePeriodLanes(
  periods: TimelineItem[],
  pixelsPerYear: number,
  panX: number,
  minBarWidthPx: number = 30
): LaneItem[] {
  // Sort periods by startYear ascending (earliest Hebrew year first)
  const sorted = [...periods].sort((a, b) => a.startYear - b.startYear);

  // Array storing the maximum Hebrew endYear currently booked in each lane
  const laneEndYears: number[] = [];
  const result: LaneItem[] = [];

  for (const item of sorted) {
    const startYear = item.startYear;
    const endYear = Math.max(startYear + 1, item.endYear ?? startYear + 1);

    // Find the first lane where the item fits without overlapping
    // In Hebrew years, items go from smaller startYear to larger endYear
    let assignedLane = -1;
    for (let l = 0; l < laneEndYears.length; l++) {
      if (startYear >= laneEndYears[l] + 2) { // 2 years buffer
        assignedLane = l;
        laneEndYears[l] = endYear;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = laneEndYears.length;
      laneEndYears.push(endYear);
    }

    const xStart = yearToScreenX(startYear, pixelsPerYear, panX);
    const xEnd = yearToScreenX(endYear, pixelsPerYear, panX);

    // In RTL, startYear is to the right (larger screen X), endYear to the left (smaller screen X)
    const leftX = Math.min(xStart, xEnd);
    const rightX = Math.max(xStart, xEnd);
    const width = Math.max(minBarWidthPx, rightX - leftX);

    result.push({
      item,
      lane: assignedLane,
      startX: rightX,
      endX: leftX,
      width,
    });
  }

  return result;
}

/**
 * Computes semantic LOD tier and filters items based on zoom scale
 */
export function filterItemsByLOD(
  items: TimelineItem[],
  pixelsPerYear: number
): TimelineItem[] {
  let maxImportanceAllowed: number;

  if (pixelsPerYear < 0.5) {
    maxImportanceAllowed = 1;
  } else if (pixelsPerYear < 2.0) {
    maxImportanceAllowed = 2;
  } else if (pixelsPerYear < 15.0) {
    maxImportanceAllowed = 3;
  } else {
    maxImportanceAllowed = 4;
  }

  // Periods are major horizontal timeline lanes that define the macro structure of history.
  // They should ALWAYS be visible at all zoom levels!
  return items.filter((item) => item.type === 'period' || item.importance <= maxImportanceAllowed);
}

/**
 * Computes staggered tiers and collision culling for point items (events & persons)
 */
export function computeStaggeredNodes(
  items: TimelineItem[],
  pixelsPerYear: number,
  panX: number,
  viewportWidth: number,
  fontScale: number = 1.0
): StaggeredNode[] {
  // Only events and persons
  const points = items.filter((item) => item.type === 'event' || item.type === 'person');

  // Sort by startYear ascending
  points.sort((a, b) => a.startYear - b.startYear);

  const result: StaggeredNode[] = [];
  const bufferPx = 250; // Horizontal screen buffer for viewport culling
  const collisionThresholdPx = Math.round(110 * Math.min(1.35, fontScale)); // Min px between full cards on same tier

  // Separate tier collision trackers for above and below
  const tierLastXAbove: number[] = [-99999, -99999, -99999, -99999];
  const tierLastXBelow: number[] = [-99999, -99999, -99999, -99999];

  for (const item of points) {
    const x = yearToScreenX(item.startYear, pixelsPerYear, panX);

    // Viewport culling (skip items far outside screen)
    if (x < -bufferPx || x > viewportWidth + bufferPx) {
      continue;
    }

    const direction: 'above' | 'below' =
      item.tradition === 'general' ? 'above' : 'below';

    const tierTracker = direction === 'above' ? tierLastXAbove : tierLastXBelow;

    // Try to find a tier (0, 1, 2, 3) where it doesn't collide with previous card
    let assignedTier = 0;
    let collapsed = false;

    for (let t = 0; t < 4; t++) {
      if (Math.abs(x - tierTracker[t]) >= collisionThresholdPx) {
        assignedTier = t;
        tierTracker[t] = x;
        break;
      }
      if (t === 3) {
        // All 4 tiers are occupied nearby -> collapse to micro node if lower importance
        if (item.importance >= 3) {
          collapsed = true;
          assignedTier = result.length % 3;
        } else {
          assignedTier = 0;
          tierTracker[0] = x;
        }
      }
    }

    result.push({
      item,
      x,
      tier: assignedTier,
      direction,
      collapsed,
    });
  }

  return result;
}
