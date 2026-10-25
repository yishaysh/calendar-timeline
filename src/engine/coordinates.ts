import { RulerTick } from '../types/timeline';
import { hebrewToGregorian } from './calendarMath';
import { toHebrewYearString } from './gematria';

export const MIN_YEAR = 1;
export const MAX_YEAR = 6000;
export const TOTAL_YEARS = 6000;

export const DEFAULT_MIN_ZOOM = 0.2; // ~1200px for 6000 years
export const DEFAULT_MAX_ZOOM = 80;  // 80px per single year

/**
 * Converts a Hebrew year (1 - 6000) to horizontal screen pixel coordinate (X)
 * RTL orientation:
 * Year 6000 is on the Left (worldX = 0)
 * Year 1 is on the Right (worldX = 5999 * pixelsPerYear)
 */
export function yearToScreenX(
  year: number,
  pixelsPerYear: number,
  panX: number
): number {
  const worldX = (MAX_YEAR - year) * pixelsPerYear;
  return worldX - panX;
}

/**
 * Converts a screen pixel coordinate (X) to Hebrew year
 */
export function screenXToYear(
  screenX: number,
  pixelsPerYear: number,
  panX: number
): number {
  const worldX = screenX + panX;
  const year = MAX_YEAR - worldX / pixelsPerYear;
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(year)));
}

/**
 * Calculates new panX when zooming centered at a given screen X coordinate
 */
export function calculateZoomAtPoint(
  targetScreenX: number,
  oldZoom: number,
  newZoom: number,
  oldPanX: number
): number {
  // Determine exact floating year at mouse cursor
  const worldX = targetScreenX + oldPanX;
  const exactYear = MAX_YEAR - worldX / oldZoom;

  // With newZoom, we want that exactYear to stay at targetScreenX
  const newWorldX = (MAX_YEAR - exactYear) * newZoom;
  return newWorldX - targetScreenX;
}

/**
 * Determines ruler step interval based on current zoom scale
 */
export function getTickInterval(pixelsPerYear: number): { major: number; minor: number } {
  if (pixelsPerYear < 0.3) {
    return { major: 1000, minor: 500 };
  } else if (pixelsPerYear < 0.8) {
    return { major: 500, minor: 100 };
  } else if (pixelsPerYear < 2.0) {
    return { major: 200, minor: 50 };
  } else if (pixelsPerYear < 6.0) {
    return { major: 100, minor: 20 };
  } else {
    // השנתות הכי קטנות בציר הזמן הינן כל 10 שנים בלבד (ולא כל שנה או 5 שנים)
    return { major: 50, minor: 10 };
  }
}

/**
 * Generates visible ruler ticks within the current screen viewport
 */
export function getVisibleTicks(
  viewportWidth: number,
  pixelsPerYear: number,
  panX: number
): RulerTick[] {
  const { major, minor } = getTickInterval(pixelsPerYear);

  // Buffer in pixels so ticks don't pop abruptly
  const buffer = 150;
  const minVisibleYear = screenXToYear(viewportWidth + buffer, pixelsPerYear, panX);
  const maxVisibleYear = screenXToYear(-buffer, pixelsPerYear, panX);

  const startYear = Math.max(MIN_YEAR, Math.floor(minVisibleYear / minor) * minor);
  const endYear = Math.min(MAX_YEAR, Math.ceil(maxVisibleYear / minor) * minor);

  const ticks: RulerTick[] = [];

  for (let year = startYear; year <= endYear; year += minor) {
    if (year < MIN_YEAR || year > MAX_YEAR) continue;

    const isMajor = year % major === 0 || year === MIN_YEAR || year === MAX_YEAR;
    const x = yearToScreenX(year, pixelsPerYear, panX);
    const greg = hebrewToGregorian(year);
    const labelHebrew = `${toHebrewYearString(year)} (${year})`;
    const labelGregorian = isMajor ? greg.formatted : `${greg.year}${greg.era === 'BCE' ? ' לפנה"ס' : ''}`;

    ticks.push({
      hebrewYear: year,
      gregorian: greg,
      x,
      isMajor,
      labelHebrew,
      labelGregorian,
    });
  }

  return ticks;
}

/**
 * Calculates a gentle, gradual logarithmic font/UI scaling factor based on zoom (pixelsPerYear).
 * Starts at ~0.95-1.0 at broad overview (0.25 - 0.35 px/year)
 * and grows slowly and progressively up to ~1.65 at deep zoom (60 - 80 px/year).
 * "לאט לאט" - smooth logarithmic scale avoiding excessive jumps.
 */
export function getZoomFontScale(pixelsPerYear: number): number {
  const baseZoom = 0.35;
  const clampedZoom = Math.max(0.2, pixelsPerYear);
  const ratio = clampedZoom / baseZoom;
  // Logarithmic growth with slow rate (0.12)
  const scale = 1.0 + 0.12 * Math.log(ratio);
  // Clamped between 0.92 and 1.65
  return Math.min(1.65, Math.max(0.92, scale));
}
