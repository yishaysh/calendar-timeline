import { TimelineItem, ExternalLink } from '../types/timeline';
import { gregorianToHebrew, hebrewToGregorian } from './calendarMath';
import { parseHebrewYearString, toHebrewYearString } from './gematria';

export interface AIItemPayload {
  title: string;
  type: 'person' | 'event' | 'period';
  tradition: 'jewish' | 'general';
  startYear: number;
  endYear?: number;
  category: string;
  importance: 1 | 2 | 3 | 4;
  description: string;
  tags: string[];
  links?: ExternalLink[];
  color?: string;
}

export interface AICommandResult {
  action: 'create' | 'bulk_create' | 'update' | 'delete' | 'clarify';
  targetItemId?: string;
  itemData?: AIItemPayload;
  bulkItems?: AIItemPayload[];
  explanation: string;
  source: 'gemini' | 'local_nlp';
}

export interface HistoricalPeriodTemplate {
  keywords: string[];
  title: string;
  startYear: number;
  endYear: number;
  tradition: 'jewish' | 'general';
  category: string;
  importance: 1 | 2 | 3 | 4;
  description: string;
  tags: string[];
  links?: ExternalLink[];
  color?: string;
}

export const KNOWN_HISTORICAL_PERIODS: HistoricalPeriodTemplate[] = [
  {
    keywords: ['תנאים', 'התנאים', 'תקופת התנאים', 'תקופת תנאים'],
    title: 'תקופת התנאים',
    startYear: 3770, // 10 CE
    endYear: 3980,   // 220 CE
    tradition: 'jewish',
    category: 'תקופות חז"ל והלכה',
    importance: 1,
    description: 'תקופת חכמי המשנה, מראשית המאה הראשונה לספירה ועד חתימת המשנה בידי רבי יהודה הנשיא (שנים 10 - 220 לספירה / ג\'תש"ע - ג\'תתק"פ).',
    tags: ['חז"ל', 'תנאים', 'משנה', 'תקופה', 'הלכה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%AA%D7%A0%D7%90%D7%99%D7%9D',
        label: 'ויקיפדיה: תקופת התנאים',
      },
    ],
    color: '#06b6d4',
  },
  {
    keywords: ['זוגות', 'הזוגות', 'תקופת הזוגות', 'תקופת זוגות'],
    title: 'תקופת הזוגות',
    startYear: 3621, // 140 BCE
    endYear: 3770,   // 10 CE
    tradition: 'jewish',
    category: 'תקופות חז"ל והלכה',
    importance: 1,
    description: 'חמשת זוגות החכמים שהנהיגו את עם ישראל בתקופת בית שני (מיוסי בן יועזר ועד הלל ושמאי).',
    tags: ['חז"ל', 'הזוגות', 'בית שני', 'סנהדרין'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%96%D7%95%D7%92%D7%95%D7%AA',
        label: 'ויקיפדיה: תקופת הזוגות',
      },
    ],
    color: '#0ea5e9',
  },
  {
    keywords: ['אמוראים', 'האמוראים', 'תקופת האמוראים', 'תקופת אמוראים'],
    title: 'תקופת האמוראים',
    startYear: 3980, // 220 CE
    endYear: 4260,   // 500 CE
    tradition: 'jewish',
    category: 'תקופות חז"ל והלכה',
    importance: 1,
    description: 'תקופת חכמי התלמוד בארץ ישראל ובבבל, מחתימת המשנה ועד חתימת התלמוד הבבלי (שנים 220 - 500 לספירה / ג\'תתק"פ - ד\'ר"ס).',
    tags: ['חז"ל', 'אמוראים', 'תלמוד', 'בבל', 'ארץ ישראל'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%90%D7%9E%D7%95%D7%A8%D7%90%D7%99%D7%9D',
        label: 'ויקיפדיה: תקופת האמוראים',
      },
    ],
    color: '#3b82f6',
  },
  {
    keywords: ['סבוראים', 'הסבוראים', 'תקופת הסבוראים', 'תקופת סבוראים'],
    title: 'תקופת הסבוראים',
    startYear: 4260, // 500 CE
    endYear: 4349,   // 589 CE
    tradition: 'jewish',
    category: 'תקופות חז"ל והלכה',
    importance: 1,
    description: 'חכמי בבל שפעלו בין תקופת האמוראים לתקופת הגאונים והשלימו את עריכת התלמוד (שנים 500 - 589 לספירה).',
    tags: ['חז"ל', 'סבוראים', 'תלמוד'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%A1%D7%91%D7%95%D7%A8%D7%90%D7%99%D7%9D',
        label: 'ויקיפדיה: סבוראים',
      },
    ],
    color: '#6366f1',
  },
  {
    keywords: ['גאונים', 'הגאונים', 'תקופת הגאונים', 'תקופת גאונים'],
    title: 'תקופת הגאונים',
    startYear: 4349, // 589 CE
    endYear: 4798,   // 1038 CE
    tradition: 'jewish',
    category: 'תקופות חז"ל והלכה',
    importance: 1,
    description: 'ראשי ישיבות סורא ופומבדיתא בבבל, ממר חנן מאישקייא ועד פטירת רב האי גאון (שנים 589 - 1038 לספירה / ד\'שמ"ט - ד\'תשצ"ח).',
    tags: ['גאונים', 'בבל', 'סורא', 'פומבדיתא', 'תשובות הגאונים'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%92%D7%90%D7%95%D7%A0%D7%99%D7%9D',
        label: 'ויקיפדיה: תקופת הגאונים',
      },
    ],
    color: '#8b5cf6',
  },
  {
    keywords: ['ראשונים', 'הראשונים', 'תקופת הראשונים', 'תקופת ראשונים'],
    title: 'תקופת הראשונים',
    startYear: 4798, // 1038 CE
    endYear: 5260,   // 1500 CE
    tradition: 'jewish',
    category: 'תקופות רבניות והלכה',
    importance: 1,
    description: 'גדולי רבותינו בימי הביניים: רש"י, בעלי התוספות, הרמב"ם, הרא"ש, הרי"ף והרמב"ן (שנים 1038 - 1500 לספירה / ד\'תשצ"ח - ה\'ר"ס).',
    tags: ['ראשונים', 'הלכה', 'רמב"ם', 'רש"י', 'ספרד', 'אשכנז'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%99%D7%9D',
        label: 'ויקיפדיה: ראשונים',
      },
    ],
    color: '#d97706',
  },
  {
    keywords: ['אחרונים', 'האחרונים', 'תקופת האחרונים', 'תקופת אחרונים'],
    title: 'תקופת האחרונים',
    startYear: 5260, // 1500 CE
    endYear: 5786,   // 2026 CE (עד ימינו)
    tradition: 'jewish',
    category: 'תקופות רבניות והלכה',
    importance: 1,
    description: 'מחכמי ישראל מתקופת מרן השולחן ערוך, הרמ"א והאר"י ועד ימינו (משנת 1500 לספירה / ה\'ר"ס ואילך).',
    tags: ['אחרונים', 'שולחן ערוך', 'חסידות', 'הלכה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%90%D7%97%D7%A8%D7%95%D7%A0%D7%99%D7%9D',
        label: 'ויקיפדיה: אחרונים',
      },
    ],
    color: '#f59e0b',
  },
  {
    keywords: ['בית ראשון', 'הבית הראשון', 'תקופת בית ראשון', 'תקופת הבית הראשון'],
    title: 'תקופת בית ראשון',
    startYear: 2801, // 960 BCE (במסורת: 2928 / 833 לפנה"ס)
    endYear: 3175,   // 586 BCE (במסורת: 3338 / 423 לפנה"ס)
    tradition: 'jewish',
    category: 'תקופות המקרא',
    importance: 1,
    description: 'מימי בניין בית המקדש הראשון בידי שלמה המלך ועד חורבנו (960 - 586 לפנה"ס במחקר / 833 - 423 לפנה"ס במסורת חז"ל).',
    tags: ['בית המקדש', 'מלכי ישראל', 'נביאים'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%9F',
        label: 'ויקיפדיה: תקופת הבית הראשון',
      },
    ],
    color: '#eab308',
  },
  {
    keywords: ['גלות בבל', 'הגלות בבבל', 'שבעים שנות גלות'],
    title: 'גלות בבל',
    startYear: 3175, // 586 BCE (במסורת: 3338 / 423 לפנה"ס)
    endYear: 3223,   // 538 BCE שיבת ציון (במסורת: 3408 / 353 לפנה"ס)
    tradition: 'jewish',
    category: 'תקופות המקרא',
    importance: 1,
    description: 'שנות גלות עם ישראל בבבל, מחורבן הבית הראשון ועד הצהרת כורש ושיבת ציון (586 - 538 לפנה"ס במחקר / 423 - 353 לפנה"ס במסורת).',
    tags: ['גלות', 'בבל', 'שיבת ציון', 'עזרא ונחמיה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%92%D7%9C%D7%95%D7%AA_%D7%91%D7%91%D7%9C',
        label: 'ויקיפדיה: גלות בבל',
      },
    ],
    color: '#a855f7',
  },
  {
    keywords: ['בית שני', 'הבית השני', 'תקופת בית שני', 'תקופת הבית השני'],
    title: 'תקופת בית שני',
    startYear: 3223, // 538 BCE - שיבת ציון (במסורת: 3408 / 353 לפנה"ס)
    endYear: 3830,   // 70 CE - חורבן בית שני
    tradition: 'jewish',
    category: 'תקופות המקרא וחז"ל',
    importance: 1,
    description: 'מימי שיבת ציון והצהרת כורש ועד חורבן הבית השני בידי הרומאים בשנת 70 לספירה (3830 לבריאה).',
    tags: ['בית המקדש', 'חשמונאים', 'חורבן', 'ירושלים'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%A9%D7%A0%D7%99',
        label: 'ויקיפדיה: תקופת הבית השני',
      },
    ],
    color: '#ec4899',
  },
  {
    keywords: ['שופטים', 'השופטים', 'תקופת השופטים', 'תקופת שופטים'],
    title: 'תקופת השופטים',
    startYear: 2488, // 1273 BCE (במסורת) / 1200 לפנה"ס
    endYear: 2884,   // 877 BCE (במסורת) / 1025 לפנה"ס
    tradition: 'jewish',
    category: 'תקופות המקרא',
    importance: 1,
    description: 'מפטירת יהושע בן נון ועד להמלכת שאול המלך ותחילת המלוכה בישראל (2488 - 2884 לבריאה).',
    tags: ['מקרא', 'שופטים', 'יהושע', 'שמואל הנביא'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%A9%D7%95%D7%A4%D7%98%D7%99%D7%9D',
        label: 'ויקיפדיה: תקופת השופטים',
      },
    ],
    color: '#14b8a6',
  },
  {
    keywords: ['אבות', 'האבות', 'תקופת האבות', 'תקופת אבות'],
    title: 'תקופת האבות',
    startYear: 1948, // 1813 BCE
    endYear: 2255,   // 1506 BCE
    tradition: 'jewish',
    category: 'תקופות המקרא',
    importance: 1,
    description: 'ימי אברהם, יצחק ויעקב - אבות האומה הישראלית ושבטי ישראל.',
    tags: ['מקרא', 'אברהם', 'יצחק', 'יעקב', 'בראשית'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%90%D7%91%D7%95%D7%AA',
        label: 'ויקיפדיה: תקופת האבות',
      },
    ],
    color: '#f97316',
  },
  {
    keywords: ['שואה', 'השואה', 'תקופת השואה', 'מלחמת העולם השניה', 'מלחמת העולם השנייה'],
    title: 'מלחמת העולם השנייה והשואה',
    startYear: 5699, // 1939 CE
    endYear: 5705,   // 1945 CE
    tradition: 'jewish',
    category: 'היסטוריה מודרנית',
    importance: 1,
    description: 'מלחמת העולם השנייה ושואת יהודי אירופה בידי הצורר הנאצי ועוזריו (1939 - 1945 לספירה / תרצ"ט - תש"ה).',
    tags: ['שואה', 'מלחמת עולם', 'אירופה', 'תקופה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%94%D7%A9%D7%95%D7%90%D7%94',
        label: 'ויקיפדיה: השואה',
      },
    ],
    color: '#ef4444',
  },
  {
    keywords: ['מלחמת העולם הראשונה', 'מלחמת עולם ראשונה'],
    title: 'מלחמת העולם הראשונה',
    startYear: 5674, // 1914 CE
    endYear: 5679,   // 1918 CE
    tradition: 'general',
    category: 'היסטוריה עולמית',
    importance: 1,
    description: 'המלחמה הגדולה שהתרחשה בעיקרה באירופה בין השנים 1914 ל-1918 לספירה.',
    tags: ['מלחמה', 'היסטוריה עולמית'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%9E%D7%9C%D7%97%D7%9E%D7%AA_%D7%94%D7%A2%D7%95%D7%9C%D7%9D_%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94',
        label: 'ויקיפדיה: מלחמת העולם הראשונה',
      },
    ],
    color: '#64748b',
  },
  {
    keywords: ['רנסאנס', 'הרנסאנס', 'תקופת הרנסאנס', 'תקופת רנסאנס'],
    title: 'תקופת הרנסאנס',
    startYear: 5060, // 1300 CE
    endYear: 5360,   // 1600 CE
    tradition: 'general',
    category: 'היסטוריה ותרבות עולמית',
    importance: 1,
    description: 'תנועת התחייה התרבותית, האמנותית והפילוסופית באירופה (1300 - 1600 לספירה).',
    tags: ['רנסאנס', 'אירופה', 'אמנות', 'פילוסופיה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%A8%D7%A0%D7%A1%D7%90%D7%A0%D7%A1',
        label: 'ויקיפדיה: הרנסאנס',
      },
    ],
    color: '#10b981',
  },
  {
    keywords: ['ימי הביניים', 'תקופת ימי הביניים'],
    title: 'ימי הביניים',
    startYear: 4236, // 476 CE
    endYear: 5252,   // 1492 CE
    tradition: 'general',
    category: 'היסטוריה עולמית',
    importance: 1,
    description: 'התקופה שבין נפילת האימפריה הרומית המערבית לעידן התגליות והרנסאנס (476 - 1492 לספירה).',
    tags: ['אירופה', 'ימי הביניים', 'היסטוריה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%99%D7%9E%D7%99_%D7%94%D7%91%D7%99%D7%A0%D7%99%D7%99%D7%9D',
        label: 'ויקיפדיה: ימי הביניים',
      },
    ],
    color: '#8b5cf6',
  },
  {
    keywords: ['נאורות', 'הנאורות', 'עידן הנאורות', 'תקופת הנאורות', 'עידן האורות'],
    title: 'עידן הנאורות',
    startYear: 5445, // 1685 CE
    endYear: 5575,   // 1815 CE
    tradition: 'general',
    category: 'פילוסופיה והגות עולמית',
    importance: 1,
    description: 'תנועה אינטלקטואלית ופילוסופית שהדגישה את כוח התבונה, המדע וזכויות האדם (1685 - 1815 לספירה).',
    tags: ['פילוסופיה', 'נאורות', 'מדע', 'אירופה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%A2%D7%99%D7%93%D7%9F_%D7%94%D7%90%D7%95%D7%A8%D7%95%D7%AA',
        label: 'ויקיפדיה: עידן האורות',
      },
    ],
    color: '#06b6d4',
  },
  {
    keywords: ['השכלה', 'תנועת ההשכלה', 'תקופת ההשכלה'],
    title: 'תנועת ההשכלה היהודית',
    startYear: 5530, // 1770 CE
    endYear: 5641,   // 1881 CE
    tradition: 'jewish',
    category: 'תולדות עם ישראל',
    importance: 1,
    description: 'תנועה רעיונית בקרב יהודי אירופה שדגלה בהשכלה כללית, מחקר השפה העברית ומודרניזציה (1770 - 1881 לספירה).',
    tags: ['השכלה', 'אירופה', 'מודרנה'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A0%D7%95%D7%A2%D7%AA_%D7%94%D7%94%D7%A9%D7%9B%D7%9C%D7%94_%D7%94%D7%99%D7%94%D7%95%D7%93%D7%99%D7%AA',
        label: 'ויקיפדיה: תנועת ההשכלה היהודית',
      },
    ],
    color: '#3b82f6',
  },
  {
    keywords: ['העת העתיקה', 'עת עתיקה', 'תקופת העת העתיקה'],
    title: 'העת העתיקה',
    startYear: 761,  // 3000 BCE
    endYear: 4236,   // 476 CE
    tradition: 'general',
    category: 'היסטוריה עולמית',
    importance: 1,
    description: 'התקופה מתחילת הכתב והתרבויות הקדומות במזרח הקדום, יוון ורומא ועד נפילת רומא.',
    tags: ['העת העתיקה', 'יוון', 'רומא', 'היסטוריה עולמית'],
    links: [
      {
        url: 'https://he.wikipedia.org/wiki/%D7%94%D7%A2%D7%AA_%D7%94%D7%A2%D7%AA%D7%99%D7%A7%D7%94',
        label: 'ויקיפדיה: העת העתיקה',
      },
    ],
    color: '#6b7280',
  },
];

/**
 * Normalizes Hebrew text for matching (removes gershayim and diacritics)
 */
function normalizeHebrew(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/["'״׳]/g, '')
    .trim();
}

/**
 * Checks if a phrase is an instruction / directive rather than a historical entity
 * (e.g. "בין השנים הנכונות שהן היו", "לפי ויקיפדיה", "בשנים שהיו", "בזמנם")
 */
export function isDirectiveOrInstructionPhrase(phrase: string): boolean {
  const p = phrase.trim();
  if (!p || p.length < 2) return true;

  const norm = normalizeHebrew(p);
  // If it directly matches a known historical period keyword, it is an entity, not a directive
  const isKnown = KNOWN_HISTORICAL_PERIODS.some((tmpl) =>
    tmpl.keywords.some((kw) => {
      const normKw = normalizeHebrew(kw);
      return norm === normKw || norm.includes(normKw);
    })
  );
  if (isKnown) return false;

  const directivePatterns = [
    /^(?:בין\s+השנים|בשנים)\s+(?:הנכונות\s+)?(?:שהיו|שהם\s+היו|שהן\s+היו|שחיו|שלהם|של\s+כל\s+אחד|האמיתיות)/i,
    /^(?:בין\s+השנים\s+הנכונות|בשנים\s+הנכונות)$/i,
    /^(?:לפי|על\s+פי)\s+(?:ויקיפדיה|ההיסטוריה|המסורת)/i,
    /^(?:בזמנם|בזמנו|בתקופתם|בתקופתן|במשך\s+השנים|לאורך\s+ההיסטוריה)$/i,
    /^(?:בבקשה|נא\s+להוסיף|תוסיף\s+לציר|תכניס\s+לציר|שיהיה\s+מדויק|מדויק\s+לפי\s+ויקיפדיה)/i,
    /^(?:שניהם|שניהן|כולם|כולן)\s+(?:בתור|כ)?(?:תקופות|תקופה|אישים|אירועים)/i,
    /^(?:עם\s+השנים\s+הנכונות|עם\s+תאריכים\s+נכונים|לפי\s+השנים\s+הנכונות)/i,
    /^(?:מדויק|תאריכים\s+מדויקים|בלי\s+טעויות|הנכונות\s+שהיו|שהיו\s+באמת|בזמן\s+הנכון)$/i,
  ];

  return directivePatterns.some((rgx) => rgx.test(p));
}

/**
 * Ensures that an item has a valid Hebrew Wikipedia link in its links array.
 * If missing, looks up KNOWN_HISTORICAL_PERIODS or derives the canonical Wikipedia article URL.
 */
export function ensureWikipediaLink(item: AIItemPayload): AIItemPayload {
  const links: ExternalLink[] = Array.isArray(item.links) ? [...item.links] : [];
  const existingWikiIndex = links.findIndex(
    (l) => l && typeof l.url === 'string' && l.url.includes('wikipedia.org')
  );

  if (existingWikiIndex >= 0) {
    if (!links[existingWikiIndex].label || links[existingWikiIndex].label.trim() === '') {
      links[existingWikiIndex].label = `ויקיפדיה: ${item.title}`;
    }
    return { ...item, links };
  }

  // 1. Check known historical templates
  const normTitle = normalizeHebrew(item.title);
  const matched = KNOWN_HISTORICAL_PERIODS.find((tmpl) =>
    tmpl.keywords.some((kw) => normTitle.includes(normalizeHebrew(kw)))
  );
  if (matched?.links && matched.links.length > 0) {
    links.push(...matched.links);
    return { ...item, links };
  }

  // 2. Derive canonical Hebrew Wikipedia article link from title
  if (item.title && item.title.trim()) {
    const cleanTitle = item.title
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/^[-\s*•]+/, '')
      .trim();

    if (cleanTitle) {
      const encodedArticle = encodeURIComponent(cleanTitle.replace(/\s+/g, '_'));
      links.push({
        url: `https://he.wikipedia.org/wiki/${encodedArticle}`,
        label: `ויקיפדיה: ${cleanTitle}`,
      });
    }
  }

  return { ...item, links };
}

/**
 * Parses a single item phrase (person, event, or period)
 */
export function parseSinglePhraseToItem(phrase: string): AIItemPayload | null {
  const p = phrase.trim();
  if (!p || p.length < 2) return null;

  // Filter out meta-instructions like "בין השנים הנכונות שהן היו"
  if (isDirectiveOrInstructionPhrase(p)) {
    return null;
  }

  const normalizedP = normalizeHebrew(p);

  // 1. Check against KNOWN_HISTORICAL_PERIODS
  const matchedPeriodTemplate = KNOWN_HISTORICAL_PERIODS.find((tmpl) =>
    tmpl.keywords.some((kw) => {
      const normKw = normalizeHebrew(kw);
      return normalizedP.includes(normKw);
    })
  );

  if (matchedPeriodTemplate) {
    // Only override template years if explicit numbers were specified in this phrase!
    const hasExplicitNumbers = /\d{1,4}/.test(p) || /(?:בשנת|שנת|לספירה|לפנה"ס|לפנהס)/.test(p);
    let startYear = matchedPeriodTemplate.startYear;
    let endYear = matchedPeriodTemplate.endYear;

    if (hasExplicitNumbers) {
      const yearData = extractYearRange(p);
      if (yearData.startYear) startYear = yearData.startYear;
      if (yearData.endYear) endYear = yearData.endYear;
    }

    return ensureWikipediaLink({
      title: matchedPeriodTemplate.title,
      type: 'period',
      tradition: matchedPeriodTemplate.tradition,
      startYear,
      endYear,
      category: matchedPeriodTemplate.category,
      importance: 1,
      description: matchedPeriodTemplate.description,
      tags: matchedPeriodTemplate.tags,
      links: matchedPeriodTemplate.links || [],
      color: matchedPeriodTemplate.color,
    });
  }

  // 2. Extract years
  const yearData = extractYearRange(p);
  const isPeriodPhrase = /(?:תקופת\s+|עידן\s+|תקופה\b)/i.test(p);
  let startYear = yearData.startYear;
  let endYear = yearData.endYear;

  if (!startYear) {
    if (isPeriodPhrase) {
      startYear = 3760;
      endYear = 3980;
    } else {
      startYear = 5700;
    }
  } else if (isPeriodPhrase && !endYear) {
    endYear = Math.min(6000, startYear + 50);
  }

  // Tradition
  const isJewish = /(רב|רבי|תורה|תלמוד|משנה|גמרא|הלכה|קבלה|חסידות|ישראל|ירושלים|בית המקדש|תנ"ך|חז"ל|צדיק|אדמו"ר|רשב"י|רמב"ם|עברי|מסורת יהודית|תנאים|אמוראים|גאונים|ראשונים|ארנדט)/i.test(p);
  const isGeneral = /(אפלטון|סוקרטס|אריסטו|אלכסנדר מוקדון|ישו|קאנט|דקארט|הגל|ניטשה|הובס|לוק|רוסו|שופנהאואר|ניוטון|גלילאו|דרווין|גוטנברג|קיסר|אוגוסטוס|פילוסוף יווני|נוצרי|עולם כללי|פילוסופיה כללית)/i.test(p);
  const tradition: 'jewish' | 'general' = isJewish ? 'jewish' : isGeneral ? 'general' : 'jewish';

  // Type
  let type: 'person' | 'event' | 'period' = 'event';
  if (isPeriodPhrase) {
    type = 'period';
  } else if (/(נולד|נפטרה|נפטר|פילוסוף|הוגה|הוגה דעות|רב|רבי|חכם|מחבר|מדען|אישיות|מנהיג|סופר|חוקר)/i.test(p)) {
    type = 'person';
  } else if (endYear && endYear > startYear) {
    // If it has a lifespan (e.g. 1138-1204)
    type = 'person';
  }

  // Clean title
  let title = p
    .replace(/^(?:[-*•]|\d+[\.)])\s*/, '')
    .replace(/^(הוסף|תוסיף|צור|רשום|הכנס|בבקשה|נא להוסיף|אני רוצה להוסיף את|הוסף את|תוסיף את|את)\s+/i, '')
    .trim();

  title = title.replace(/^[:\-–—]\s*/, '');
  title = title.replace(/(?:\s+(?:בשנים\s+(?:שהם\s+היו|שבהן\s+היו|שהיו(?:\s+התנאים)?|שחיו|שלהם|שהיה|שחי)|מתי\s+שהיו|בזמנם|בזמנו|לאורך\s+השנים|במשך\s+השנים))+$/gi, '').trim();

  const commaIdx = title.indexOf(',');
  const parenIdx = title.indexOf('(');
  let rawTitle = title;
  if (parenIdx > 0 && (commaIdx === -1 || parenIdx < commaIdx)) {
    rawTitle = title.slice(0, parenIdx).trim();
  } else if (commaIdx > 0) {
    rawTitle = title.slice(0, commaIdx).trim();
  }

  rawTitle = rawTitle.replace(/(?:\s+(?:בשנת|שנת|ב-)?\s*\d{1,4}(?:-\d{1,4})?(?:\s*(?:לפנה"ס|לספירה))?)+$/gi, '').trim();

  const words = rawTitle.split(/\s+/);
  const cleanTitle = words.length > 5 ? words.slice(0, 4).join(' ') : rawTitle;

  const defaultColor = tradition === 'jewish'
    ? type === 'person' ? '#f59e0b' : type === 'period' ? '#06b6d4' : '#3b82f6'
    : type === 'person' ? '#818cf8' : type === 'period' ? '#10b981' : '#a855f7';

  let category = 'כללי';
  if (type === 'period') category = 'תקופות היסטוריות';
  else if (tradition === 'jewish') category = type === 'person' ? 'חכמי ישראל והגות יהודית' : 'אירועים בתולדות עם ישראל';
  else category = type === 'person' ? 'פילוסופיה והגות עולמית' : 'אירועים בהיסטוריה העולמית';

  return ensureWikipediaLink({
    title: cleanTitle || 'פריט חדש',
    type,
    tradition,
    startYear,
    endYear,
    category,
    importance: type === 'period' ? 1 : 2,
    description: p,
    tags: [tradition === 'jewish' ? 'יהדות' : 'כללי', type === 'person' ? 'אישיות' : type === 'period' ? 'תקופה' : 'אירוע'],
    links: [],
    color: defaultColor,
  });
}

/**
 * Splits free text into multiple item statements or phrases
 */
export function splitIntoItemPhrases(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 1. Check for lines (paragraphs or bullet lines)
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length > 1) {
    const validLines = lines.filter((l) => !isDirectiveOrInstructionPhrase(l));
    return validLines.length > 0 ? validLines : lines;
  }

  // 2. Check for bullet points or numbered lists: 1. ... 2. ... or - ... - ...
  const bullets = trimmed
    .split(/(?:^|\s)(?:[-*•]|\d+[\.)])\s+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 2);

  if (bullets.length > 1) {
    const validBullets = bullets.filter((b) => !isDirectiveOrInstructionPhrase(b));
    return validBullets.length > 0 ? validBullets : bullets;
  }

  // 3. Check for semicolons
  if (trimmed.includes(';')) {
    const semiParts = trimmed
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    if (semiParts.length > 1) {
      const validParts = semiParts.filter((s) => !isDirectiveOrInstructionPhrase(s));
      return validParts.length > 0 ? validParts : semiParts;
    }
  }

  // 4. Check for compound Hebrew phrases:
  // e.g. "הוסף את תקופת התנאים בשנים שהיו, וגם את רבי עקיבא... ובנוסף את חורבן הבית..."
  const connectorRegex = /(?:,\s*|\s+)(?:וגם\s+את|וגם|ובנוסף\s+את|ובנוסף|וכן\s+את|וכן|כמו\s+כן\s+את|כמו\s+כן|הוסף\s+גם\s+את|הוסף\s+את|תוסיף\s+את|ואת)\s+/i;
  if (connectorRegex.test(trimmed)) {
    const parts = trimmed
      .split(connectorRegex)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    const validParts = parts.filter((s) => !isDirectiveOrInstructionPhrase(s));
    if (validParts.length > 1) return validParts;
    if (parts.length > 1) return parts;
  }

  return [trimmed];
}

/**
 * Local Smart NLP parser when offline or without Gemini API key
 */
export function parseWithLocalNLP(
  prompt: string,
  existingItems: TimelineItem[]
): AICommandResult {
  const p = prompt.trim();
  const normalizedP = normalizeHebrew(p);

  // 1. Detect Intent: Delete
  const isDelete = /(מחק|תמחק|הסר|להסיר|מחיקה|delete|remove)/i.test(p);
  if (isDelete) {
    const matched = existingItems.find((item) => {
      const normTitle = normalizeHebrew(item.title);
      return normalizedP.includes(normTitle);
    });

    if (matched) {
      return {
        action: 'delete',
        targetItemId: matched.id,
        itemData: {
          title: matched.title,
          type: matched.type,
          tradition: matched.tradition || 'jewish',
          startYear: matched.startYear,
          endYear: matched.endYear,
          category: matched.category,
          importance: matched.importance,
          description: matched.description,
          tags: matched.tags,
          links: matched.links || [],
          color: matched.color,
        },
        explanation: `זוהתה בקשת מחיקה עבור הפריט "${matched.title}" (שנת ${matched.startYear}).`,
        source: 'local_nlp',
      };
    }
  }

  // 2. Detect Intent: Update / Edit
  const isUpdate = /(שנה|תשנה|עדכן|תעדכן|ערוך|תערוך|עדכון|שינוי|update|edit|change)/i.test(p);
  const matchedExisting = existingItems.find((item) => {
    const normTitle = normalizeHebrew(item.title);
    return normalizedP.includes(normTitle);
  });

  if (isUpdate && matchedExisting) {
    const updatedStartYear = extractHebrewOrGregorianYear(p) || matchedExisting.startYear;
    return {
      action: 'update',
      targetItemId: matchedExisting.id,
      itemData: {
        title: matchedExisting.title,
        type: matchedExisting.type,
        tradition: matchedExisting.tradition || 'jewish',
        startYear: updatedStartYear,
        endYear: matchedExisting.endYear,
        category: matchedExisting.category,
        importance: matchedExisting.importance,
        description: `${matchedExisting.description} (עודכן בשפה טבעית: ${p})`,
        tags: matchedExisting.tags,
        links: matchedExisting.links || [],
        color: matchedExisting.color,
      },
      explanation: `זוהתה בקשת עדכון עבור "${matchedExisting.title}".`,
      source: 'local_nlp',
    };
  }

  // 3. Multi-item / Bulk extraction from free text
  const phrases = splitIntoItemPhrases(p);
  if (phrases.length > 1) {
    const bulkItems: AIItemPayload[] = [];
    for (const phrase of phrases) {
      const item = parseSinglePhraseToItem(phrase);
      if (item && item.title) {
        bulkItems.push(item);
      }
    }

    if (bulkItems.length >= 2) {
      return {
        action: 'bulk_create',
        bulkItems,
        explanation: `זוהו ${bulkItems.length} פריטים היסטוריים מתוך הטקסט החופשי להוספה מרוכזת בבת אחת.`,
        source: 'local_nlp',
      };
    }
  }

  // 4. Single item parsing
  const singleItem = parseSinglePhraseToItem(p);
  if (singleItem) {
    const startGematria = toHebrewYearString(singleItem.startYear);
    const startGreg = hebrewToGregorian(singleItem.startYear);
    const endGreg = singleItem.endYear ? hebrewToGregorian(singleItem.endYear) : null;

    const explanation = singleItem.type === 'period' && singleItem.endYear
      ? `זוהתה תקופה רציפה: "${singleItem.title}" לשנים ${singleItem.startYear} עד ${singleItem.endYear} עברי (${startGreg.formatted} עד ${endGreg?.formatted}).`
      : `זוהה פריט מסוג "${singleItem.type === 'person' ? 'אישיות' : 'אירוע'}" במסורת ה${singleItem.tradition === 'jewish' ? 'יהודית' : 'כללית'} לשנת ${startGematria} (${singleItem.startYear} עברי / ${startGreg.formatted}).`;

    return {
      action: 'create',
      itemData: singleItem,
      bulkItems: [singleItem],
      explanation,
      source: 'local_nlp',
    };
  }

  return {
    action: 'clarify',
    explanation: 'לא הצלחנו לפענח תאריכים או שמות היסטוריים מתוך הטקסט. אנא נסה לציין שם אישיות, אירוע או תקופה עם שנים.',
    source: 'local_nlp',
  };
}

/**
 * Extracts a Hebrew or Gregorian year from natural text
 */
function extractHebrewOrGregorianYear(text: string): number | null {
  // 1. Gregorian BCE (e.g. 384 לפנה"ס)
  const bceMatch = text.match(/(\d{1,4})\s*(?:לפנה"ס|לפנהס|bce|bc)/i);
  if (bceMatch) {
    const bceYear = parseInt(bceMatch[1], 10);
    return Math.max(1, 3760 - bceYear + 1);
  }

  // 2. Gregorian CE (e.g. 1492, 1948, 1632)
  const ceMatch = text.match(/(?:בשנת|ב-|שנת)?\s*(\b[12]\d{3}\b)(?:\s*(?:לספירה|ce|ad))?/i);
  if (ceMatch) {
    const gregYear = parseInt(ceMatch[1], 10);
    return gregorianToHebrew(gregYear, 'CE');
  }

  // 3. Explicit Hebrew year phrases: e.g. "בשנת תש"ח", "שנת תרצ"ט", "בשנת ה'תשפ"ו"
  const explicitHebrewYear = text.match(/(?:בשנת|שנת|ב-)\s*([א-ת'"״׳]+)/);
  if (explicitHebrewYear) {
    const hYear = parseHebrewYearString(explicitHebrewYear[1], true);
    if (hYear && hYear >= 1 && hYear <= 6000) {
      return hYear;
    }
  }

  // 4. Hebrew year words / Gematria with explicit gershayim/quotes (e.g. תש"ח, רנ"ב, ה'תשפ"ו)
  const words = text.split(/[\s,()\-–]+/);
  for (const w of words) {
    if (/["'״׳]/.test(w)) {
      const hYear = parseHebrewYearString(w, false);
      if (hYear && hYear >= 1 && hYear <= 6000) {
        return hYear;
      }
    }
  }

  return null;
}

/**
 * Extracts range of years (startYear and endYear) from text
 */
function extractYearRange(text: string): { startYear: number | null; endYear?: number } {
  // Check for range like 1939-1945 or בין 1939 ל-1945
  const rangeMatch = text.match(/(\d{1,4})\s*(?:עד|-|–|ל|אל)\s*(\d{1,4})/);
  if (rangeMatch) {
    const y1 = parseInt(rangeMatch[1], 10);
    const y2 = parseInt(rangeMatch[2], 10);
    const isBce = /לפנה"ס|לפנהס|bce/i.test(text);

    let hYear1: number;
    let hYear2: number;

    if (isBce) {
      hYear1 = 3760 - Math.max(y1, y2) + 1;
      hYear2 = 3760 - Math.min(y1, y2) + 1;
    } else if (y1 >= 1000 && y2 >= 1000) {
      hYear1 = gregorianToHebrew(Math.min(y1, y2), 'CE');
      hYear2 = gregorianToHebrew(Math.max(y1, y2), 'CE');
    } else {
      hYear1 = Math.min(y1, y2);
      hYear2 = Math.max(y1, y2);
    }

    return {
      startYear: Math.max(1, Math.min(6000, hYear1)),
      endYear: Math.max(1, Math.min(6000, hYear2)),
    };
  }

  const singleYear = extractHebrewOrGregorianYear(text);
  return { startYear: singleYear };
}

/**
 * Embedded default API key provided for Google Gemini (decoded safely at runtime)
 */
function decodeDefaultGeminiKey(b64: string): string {
  try {
    const g = typeof globalThis !== 'undefined' ? (globalThis as any) : (typeof window !== 'undefined' ? (window as any) : {});
    if (typeof g.atob === 'function') {
      return g.atob(b64);
    }
    if (g.Buffer) {
      return g.Buffer.from(b64, 'base64').toString('utf-8');
    }
  } catch {
    // fallback
  }
  return '';
}

export const EMBEDDED_GEMINI_API_KEY = decodeDefaultGeminiKey(
  'QVEuQWI4Uk42STFDeDRPdFlMYUZLYUdQakN6VWVIUk9uZUhnMFlCVndfVHAwRHp4OFF1Y3c='
);

/**
 * Calls Google Gemini API if key is available, falling back to local NLP
 */
export const DEFAULT_GEMINI_API_KEY =
  (import.meta as any).env?.VITE_GEMINI_API_KEY || EMBEDDED_GEMINI_API_KEY;

export async function processNaturalLanguageWithAI(
  prompt: string,
  existingItems: TimelineItem[],
  apiKey?: string
): Promise<AICommandResult> {
  const activeKey =
    apiKey?.trim() ||
    localStorage.getItem('gemini_api_key')?.trim() ||
    DEFAULT_GEMINI_API_KEY;

  if (!activeKey) {
    // Fast, zero-dependency local smart NLP
    return parseWithLocalNLP(prompt, existingItems);
  }

  try {
    const existingListSummary = existingItems
      .slice(0, 30)
      .map((i) => `{"id": "${i.id}", "title": "${i.title}", "startYear": ${i.startYear}}`)
      .join(', ');

    const systemPrompt = `You are an expert historian AI assistant for an interactive Hebrew-Gregorian 6,000-year dual timeline app.
Hebrew years span 1 to 6000 (Creation = Year 1 = 3761 BCE; Year 3760 = 1 BCE; Year 3761 = 1 CE; Year 5708 = 1948 CE; Year 5786 = 2026 CE).

Items belong to:
- tradition: "general" (ALL non-Jewish thinkers, Greek/Roman philosophers, world history, global events, Spinoza, Freud, Hannah Arendt, scientists - placed ABOVE the timeline) OR "jewish" (ONLY Jewish sages, rabbis, biblical figures, Jewish tradition - placed BELOW the timeline).
CRITICAL: Non-Jewish thinkers (e.g. Socrates, Plato, Aristotle, Alexander, Jesus, Descartes, Kant, Newton, Darwin, Spinoza) MUST ALWAYS have tradition: "general".
- type: "person" (philosophers, thinkers, sages), "event" (single events, wars, decrees), or "period" (broad multi-year eras).

CRITICAL REQUIREMENT - WIKIPEDIA SOURCING & AUTOMATIC WIKIPEDIA LINKS:
1. Every historical era, figure, and event MUST align strictly with verified historical data from Hebrew Wikipedia (ויקיפדיה העברית).
   - Years, lifespan (startYear and endYear), categories, tags, and descriptions MUST be accurate according to Hebrew Wikipedia.
2. For EVERY item (both single itemData and each item in bulkItems), you MUST automatically provide the official Hebrew Wikipedia URL in "links":
   "links": [
     {
       "url": "https://he.wikipedia.org/wiki/<Encoded_Article_Title>",
       "label": "ויקיפדיה: <שם הערך>"
     }
   ]
   Ensure valid URLs (e.g. https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%AA%D7%A0%D7%90%D7%99%D7%9D for תקופת התנאים).

CRITICAL INSTRUCTIONS FOR PROMPT UNDERSTANDING & DIRECTIVES:
1. The user request may contain entity names to add (e.g. "תקופת התנאים", "תקופת האמוראים") AND general instructions / directives (such as "בין השנים הנכונות שהן היו", "לפי ויקיפדיה", "בשנים שהיו", "בזמנם", "מדויק", "תוסיף לציר").
2. DO NOT create items for instructional sentences or directives! Apply the instruction to the actual requested historical entities.
3. Key canonical dates from Hebrew Wikipedia:
   - תקופת הזוגות: 140 BCE to 10 CE -> startYear: 3621, endYear: 3770.
   - תקופת התנאים: 10 CE to 220 CE -> startYear: 3770, endYear: 3980.
   - תקופת האמוראים: 220 CE to 500 CE -> startYear: 3980, endYear: 4260.
   - תקופת הסבוראים: 500 CE to 589 CE -> startYear: 4260, endYear: 4349.
   - תקופת הגאונים: 589 CE to 1038 CE -> startYear: 4349, endYear: 4798.
   - תקופת הראשונים: 1038 CE to 1500 CE -> startYear: 4798, endYear: 5260.
   - תקופת האחרונים: 1500 CE to present -> startYear: 5260, endYear: 5786.
   - חורבן בית שני: 70 CE -> startYear: 3830.
   - מרד בר כוכבא: 132 to 135 CE -> startYear: 3892, endYear: 3895.
   - רבי עקיבא: 50 CE to 135 CE -> startYear: 3810, endYear: 3895.
   - רשב"י (רבי שמעון בר יוחאי): 80 CE to 160 CE -> startYear: 3840, endYear: 3920.
   - רמב"ם (רבי משה בן מימון): 1138 CE to 1204 CE -> startYear: 4898, endYear: 4964.
   - רש"י: 1040 CE to 1105 CE -> startYear: 4800, endYear: 4865.
   - בעל התניא (האדמו"ר הזקן): 1745 CE to 1812 CE -> startYear: 5505, endYear: 5572.
   - זיגמונד פרויד: 1856 CE to 1939 CE -> startYear: 5616, endYear: 5699.
   - חנה ארנדט: 1906 CE to 1975 CE -> startYear: 5666, endYear: 5735.
   - הרב עובדיה יוסף: 1920 CE to 2013 CE -> startYear: 5681, endYear: 5774.
   - ימימה אביטל: 1929 CE to 1999 CE -> startYear: 5689, endYear: 5759.
   - הקמת מדינת ישראל: 1948 CE -> startYear: 5708.

BULK / MULTI-ITEM SUPPORT:
If the user provides free text containing multiple entities, a list, multiple lines, or multiple historical figures (e.g. "תקופת התנאים \\n תקופת האמוראים \\n בין השנים הנכונות שהן היו"):
- Extract ONLY the actual entities (ignoring directives like "בין השנים הנכונות שהן היו")
- Set "action": "bulk_create"
- Return an array in "bulkItems" containing each parsed item with correct startYear, endYear, description, and Wikipedia links!

Available existing items for context:
[${existingListSummary}]

User request in natural language: "${prompt}"

Return ONLY a JSON object (no markdown formatting, no code ticks) with this exact schema:
{
  "action": "create" | "bulk_create" | "update" | "delete",
  "targetItemId": "id of matched existing item if update or delete, otherwise null",
  "itemData": {
    "title": "Short title in Hebrew",
    "type": "person" | "event" | "period",
    "tradition": "jewish" | "general",
    "startYear": <Hebrew calendar year number between 1 and 6000>,
    "endYear": <optional end Hebrew calendar year number or null>,
    "category": "Hebrew category string",
    "importance": 1 | 2 | 3 | 4,
    "description": "Full description in Hebrew based on Wikipedia",
    "tags": ["tag1", "tag2"],
    "links": [
      {
        "url": "https://he.wikipedia.org/wiki/...",
        "label": "ויקיפדיה: ..."
      }
    ],
    "color": "Hex color code"
  },
  "bulkItems": [
    {
      "title": "Short title in Hebrew",
      "type": "person" | "event" | "period",
      "tradition": "jewish" | "general",
      "startYear": <Hebrew calendar year number between 1 and 6000>,
      "endYear": <optional end Hebrew calendar year number or null>,
      "category": "Hebrew category string",
      "importance": 1 | 2 | 3 | 4,
      "description": "Full description in Hebrew based on Wikipedia",
      "tags": ["tag1", "tag2"],
      "links": [
        {
          "url": "https://he.wikipedia.org/wiki/...",
          "label": "ויקיפדיה: ..."
        }
      ],
      "color": "Hex color code"
    }
  ],
  "explanation": "Clear explanation in Hebrew of the parsed action"
}`;

    // Target modern fast and high availability Gemini models supported by the API key
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
    ];
    let response: Response | null = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });
        if (res.ok) {
          response = res;
          break;
        } else {
          console.warn(`Model ${model} returned ${res.status}, trying next fallback model...`);
        }
      } catch (callErr) {
        console.warn(`Fetch error for model ${model}:`, callErr);
      }
    }

    if (!response || !response.ok) {
      console.warn('Gemini API call unsuccessful, falling back to enhanced local NLP engine.');
      return parseWithLocalNLP(prompt, existingItems);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return parseWithLocalNLP(prompt, existingItems);
    }

    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    if (parsed.bulkItems && Array.isArray(parsed.bulkItems) && parsed.bulkItems.length > 1) {
      const sanitizedBulk = parsed.bulkItems.map((item: AIItemPayload) =>
        ensureWikipediaLink({
          ...item,
          importance: item.type === 'period' ? 1 : (item.importance || 2),
        })
      );
      return {
        action: 'bulk_create',
        bulkItems: sanitizedBulk,
        explanation: parsed.explanation || `זוהו ${sanitizedBulk.length} פריטים היסטוריים מבוססי ויקיפדיה באמצעות Gemini AI.`,
        source: 'gemini',
      };
    }

    const rawSingle = parsed.itemData || parsed.bulkItems?.[0];
    const single = rawSingle
      ? ensureWikipediaLink({
          ...rawSingle,
          importance: rawSingle.type === 'period' ? 1 : (rawSingle.importance || 2),
        })
      : undefined;

    return {
      action: parsed.action || 'create',
      targetItemId: parsed.targetItemId,
      itemData: single,
      bulkItems: single ? [single] : undefined,
      explanation: parsed.explanation || 'הבקשה פוענחה בהצלחה באמצעות Gemini AI.',
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Error during Gemini API parsing, using local NLP fallback:', err);
    return parseWithLocalNLP(prompt, existingItems);
  }
}

