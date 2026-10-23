import { GregorianDateInfo } from '../types/timeline';
import { toHebrewYearString } from './gematria';

/**
 * Converts a Hebrew Year (1 - 6000) to Gregorian Year (BCE/CE)
 * Following the specification formula:
 * rawGregorian = hebrewYear - 3760
 * if rawGregorian <= 0 => Math.abs(rawGregorian) + 1 BCE
 * if rawGregorian > 0  => rawGregorian CE
 */
export function hebrewToGregorian(hebrewYear: number): GregorianDateInfo {
  const rawGregorian = hebrewYear - 3760;

  if (rawGregorian <= 0) {
    const year = Math.abs(rawGregorian) + 1;
    return {
      year,
      era: 'BCE',
      formatted: `${year.toLocaleString('he-IL')} לפנה"ס`,
    };
  }

  return {
    year: rawGregorian,
    era: 'CE',
    formatted: `${rawGregorian.toLocaleString('he-IL')} לספירה`,
  };
}

/**
 * Converts a Gregorian Year + Era into Hebrew Year (1 - 6000)
 */
export function gregorianToHebrew(year: number, era: 'BCE' | 'CE'): number {
  if (era === 'CE') {
    return Math.max(1, Math.min(6000, year + 3760));
  } else {
    // 1 BCE -> 3760 AM, 3760 BCE -> 1 AM
    const hebrew = 3761 - year;
    return Math.max(1, Math.min(6000, hebrew));
  }
}

/**
 * Formats a single year with full dual-calendar representation (Gregorian first)
 * e.g. "2026 לספירה | ה'תשפ\"ו (5786)"
 */
export function formatDualDateSingle(hebrewYear: number): string {
  const gematria = toHebrewYearString(hebrewYear);
  const greg = hebrewToGregorian(hebrewYear);
  return `${greg.formatted} | ${gematria} (${hebrewYear})`;
}

/**
 * Formats a range or single date (Gregorian first)
 */
export function formatDualDateRange(startYear: number, endYear?: number): string {
  if (!endYear || startYear === endYear) {
    return formatDualDateSingle(startYear);
  }

  const startGematria = toHebrewYearString(startYear);
  const endGematria = toHebrewYearString(endYear);
  const startGreg = hebrewToGregorian(startYear);
  const endGreg = hebrewToGregorian(endYear);

  // If both are in the same era
  if (startGreg.era === endGreg.era) {
    const eraStr = startGreg.era === 'BCE' ? 'לפנה"ס' : 'לספירה';
    return `${startGreg.year.toLocaleString('he-IL')} - ${endGreg.year.toLocaleString('he-IL')} ${eraStr} | ${startGematria} - ${endGematria} (${startYear} - ${endYear})`;
  }

  return `${startGreg.formatted} - ${endGreg.formatted} | ${startGematria} - ${endGematria} (${startYear} - ${endYear})`;
}
