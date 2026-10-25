/**
 * Hebrew Gematria and Year Formatter
 * Converts a Hebrew year (1 to 6000) into traditional Hebrew alphabetical notation.
 */

const HUNDREDS: Record<number, string> = {
  100: 'ק',
  200: 'ר',
  300: 'ש',
  400: 'ת',
  500: 'תק',
  600: 'תר',
  700: 'תש',
  800: 'תת',
  900: 'תתק',
};

const TENS: Record<number, string> = {
  10: 'י',
  20: 'כ',
  30: 'ל',
  40: 'מ',
  50: 'נ',
  60: 'ס',
  70: 'ע',
  80: 'פ',
  90: 'צ',
};

const UNITS: Record<number, string> = {
  1: 'א',
  2: 'ב',
  3: 'ג',
  4: 'ד',
  5: 'ה',
  6: 'ו',
  7: 'ז',
  8: 'ח',
  9: 'ט',
};

const THOUSAND_LETTERS: Record<number, string> = {
  1: 'א',
  2: 'ב',
  3: 'ג',
  4: 'ד',
  5: 'ה',
  6: 'ו',
};

/**
 * Formats a number below 1000 into Hebrew letters with Gershayim
 */
export function formatSubThousand(num: number): string {
  if (num <= 0) return '';
  if (num >= 1000) num = num % 1000;
  if (num === 0) return '';

  let letters = '';

  // 1. Hundreds
  const hundreds = Math.floor(num / 100) * 100;
  if (hundreds > 0 && HUNDREDS[hundreds]) {
    letters += HUNDREDS[hundreds];
  }

  // 2. Tens & Units
  const tensAndUnits = num % 100;
  if (tensAndUnits === 15) {
    letters += 'טו';
  } else if (tensAndUnits === 16) {
    letters += 'טז';
  } else {
    const tens = Math.floor(tensAndUnits / 10) * 10;
    const units = tensAndUnits % 10;
    if (tens > 0 && TENS[tens]) {
      letters += TENS[tens];
    }
    if (units > 0 && UNITS[units]) {
      letters += UNITS[units];
    }
  }

  if (letters.length === 0) return '';
  if (letters.length === 1) return letters + "'";
  return letters.slice(0, -1) + '"' + letters.slice(-1);
}

/**
 * Converts a year between 1 and 6000 into standard Hebrew year string
 * e.g., 1 -> א', 5000 -> ה' אלפים, 5786 -> ה'תשפ"ו, 3760 -> ג'תש"ס
 */
export function toHebrewYearString(year: number): string {
  if (year < 1 || year > 6000) {
    return String(year);
  }

  const thousands = Math.floor(year / 1000);
  const remainder = year % 1000;

  if (thousands === 0) {
    return formatSubThousand(remainder);
  }

  const thousandPrefix = (THOUSAND_LETTERS[thousands] || String(thousands)) + "'";

  if (remainder === 0) {
    return `${thousandPrefix} אלפים`;
  }

  // Combine thousands prefix with remainder (e.g. ה'תשפ"ו or ג'תש"ס)
  const remainderStr = formatSubThousand(remainder);
  return `${thousandPrefix}${remainderStr}`;
}

const LETTER_VALUES: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90,
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
};

const COMMON_NON_YEAR_WORDS = new Set([
  'תקופת', 'תקופה', 'התנאים', 'תנאים', 'אמוראים', 'האמוראים', 'סבוראים', 'הסבוראים',
  'גאונים', 'הגאונים', 'ראשונים', 'הראשונים', 'אחרונים', 'האחרונים', 'השנים', 'שנים',
  'שלום', 'ישראל', 'ספר', 'ראשית', 'אישים', 'היו', 'שהיו', 'נכונות', 'הנכונות',
  'בימי', 'ימי', 'זמן', 'בזמן', 'שנת', 'בשנת', 'תורה', 'משנה', 'גמרא', 'אירוע', 'אירועים',
  'יהודים', 'יהדות', 'עולם', 'כללי', 'הלכה', 'חזל', 'חכמים'
]);

/**
 * Parses a Hebrew year string (e.g. 'תש"ח', 'ה'תשפ"ו', 'רנ"ב', 'ג'תש"ס', '5708') into a number.
 * By default requires gershayim/quotes (" ' ״ ׳) or a thousands prefix unless allowUnquoted is true.
 */
export function parseHebrewYearString(input: string, allowUnquoted = false): number | null {
  if (!input) return null;
  const trimmed = input.trim();
  const hasGershayim = /["'״׳]/.test(trimmed);

  // If already digits (e.g. "5708" or "1948")
  const numMatch = trimmed.match(/^(\d{1,4})$/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n >= 1 && n <= 6000) return n;
  }

  // Without quotes or explicit allowance, plain Hebrew words must NEVER be parsed as years
  if (!hasGershayim && !allowUnquoted) {
    return null;
  }

  const clean = trimmed.replace(/["'״׳]/g, '').trim();
  if (COMMON_NON_YEAR_WORDS.has(clean)) {
    return null;
  }

  let thousands = 0;
  let remainderLetters = clean;

  const thousandMatch = trimmed.match(/^([א-ו])['׳]?\s*(אלפים)?/);
  if (thousandMatch) {
    thousands = (LETTER_VALUES[thousandMatch[1]] || 0) * 1000;
    remainderLetters = clean.slice(thousandMatch[1].length);
  }

  let sum = 0;
  for (const ch of remainderLetters) {
    if (LETTER_VALUES[ch]) {
      sum += LETTER_VALUES[ch];
    }
  }

  if (sum > 0) {
    if (thousands === 0 && sum < 1000) {
      thousands = 5000; // Traditional default for 5th-6th millennium
    }
    const total = thousands + sum;
    if (total >= 1 && total <= 6000) {
      return total;
    }
  } else if (thousands > 0) {
    return thousands;
  }

  return null;
}

