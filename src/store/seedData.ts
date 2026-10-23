import { TimelineItem } from '../types/timeline';

/**
 * Initial Seed Data for the 6,000-Year Timeline
 * Based on:
 * 1. "חברותא שטייגען - תיכון החממה" (10 Key Figures & Stations with local images)
 * 2. Pedagogical Timeline Whiteboard (תנ"ך, תקופות, שנים עגולות של 50 שנה)
 * 3. Two-Hemisphere separation:
 *    - tradition: 'jewish'  -> מתחת לציר הזמן
 *    - tradition: 'general' -> מעל לציר הזמן
 */
export const SEED_TIMELINE_ITEMS: TimelineItem[] = [
  // ==========================================
  // פרק א': עולם התנ"ך והעת העתיקה (לוח הכיתה)
  // ==========================================
  {
    id: 'chavruta-creation',
    title: 'בריאת העולם ואדם הראשון',
    type: 'event',
    category: 'תנ"ך',
    importance: 1,
    startYear: 1, // 3760 לפנה"ס
    description: `בריאת העולם, השמיים, הארץ וכל אשר בם, וסיומה בבריאת אדם וחוה ביום השישי. ראשית ציר הזמן האנושי על פי המסורת היהודית.`,
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    tags: ['בראשית', 'בריאת העולם', 'אדם הראשון', 'תורה שבכתב'],
    links: [],
    color: '#eab308',
    tradition: 'jewish',
    createdAt: 1,
  },
  {
    id: 'chavruta-noah',
    title: 'נח והמבול',
    type: 'event',
    category: 'תנ"ך',
    importance: 2,
    startYear: 1650, // מעוגל ל-50 (מדויק: 1656 / 2100 לפנה"ס)
    description: `המבול ותיבת נח. רקע היסטורי ותרבותי במזרח הקדום (עלילות גילגמש, קודי חוקים קדומים כמו חוקי חמורבי). התחלה מחודשת של האנושות עם ברית הקשת.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    tags: ['המבול', 'נח', 'חוקי חמורבי', 'עלילות גילגמש', 'בראשית'],
    links: [],
    color: '#0ea5e9',
    tradition: 'jewish',
    createdAt: 2,
  },
  {
    id: 'chavruta-abraham',
    title: 'אברהם אבינו (תקופת האבות)',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 1950, // מעוגל ל-50 שנה (מדויק: 1948 לבריאה / 1813 לפנה"ס)
    endYear: 2125,   // מעוגל ל-50
    description: `אבי האומה העברית, מפיץ האמונה המונותאיסטית בעולם ועמוד החסד. ברית בין הבתרים וההבטחה לארץ ישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    tags: ['אברהם', 'אבות', 'מונותאיזם', 'ברית בין הבתרים'],
    links: [],
    color: '#f59e0b',
    tradition: 'jewish',
    createdAt: 3,
  },
  {
    id: 'chavruta-torah',
    title: 'מתן תורה, משה ויציאת מצרים',
    type: 'event',
    category: 'תנ"ך',
    importance: 1,
    startYear: 2450, // מעוגל ל-50 (מדויק: 2448 לבריאה / כ-1300 לפנה"ס)
    description: `גאולת ישראל משעבוד מצרים בהנהגת משה רבנו, מתן תורה ועשרת הדיברות בהר סיני, והנחלת חמשת חומשי תורה (בראשית, שמות, ויקרא, במדבר, דברים). חטא המרגלים ו-40 שנות נדודים במדבר.`,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    tags: ['תורה שבכתב', 'משה רבנו', 'יציאת מצרים', 'מעמד הר סיני', 'חומש'],
    links: [],
    color: '#8b5cf6',
    tradition: 'jewish',
    createdAt: 4,
  },
  {
    id: 'chavruta-judges',
    title: 'תקופת יהושע והשופטים',
    type: 'period',
    category: 'תנ"ך',
    importance: 2,
    startYear: 2500, // מעוגל ל-50 (כ-1250 לפנה"ס)
    endYear: 2850,   // מעוגל ל-50 (כ-900 לפנה"ס)
    description: `כניסת בני ישראל לארץ בהנהגת יהושע ותקופת השופטים (דבורה, גדעון, שמשון, שמואל הנביא). מעבר מחברה שבטית להקמת מוסד המלוכה בישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    tags: ['שופטים', 'יהושע', 'שמואל הנביא', 'נביאים'],
    links: [],
    color: '#3b82f6',
    tradition: 'jewish',
    createdAt: 5,
  },
  {
    id: 'chavruta-temple1',
    title: 'ממלכת ישראל ותקופת בית ראשון',
    type: 'period',
    category: 'מקדש',
    importance: 1,
    startYear: 2800, // מעוגל ל-50 (~1000 לפנה"ס - תואם ציון -1,000 בלוח הכיתה)
    endYear: 3350,   // מעוגל ל-50 (~600 לפנה"ס - תואם ציון -600 בלוח הכיתה)
    description: `מלכות שאול, דוד ושלמה (שמואל ומלכים), ובניית בית המקדש הראשון בירושלים על הר המוריה. מרכז הרוח והריבונות של עם ישראל לאורך למעלה מ-400 שנה.`,
    imageUrl: 'https://images.unsplash.com/photo-1548625361-12f8a846152e?auto=format&fit=crop&w=800&q=80',
    tags: ['בית ראשון', 'דוד המלך', 'שלמה המלך', 'ירושלים', 'מלכים'],
    links: [],
    color: '#f59e0b',
    tradition: 'jewish',
    createdAt: 6,
  },
  {
    id: 'chavruta-destruction1',
    title: 'חורבן בית ראשון וגלות בבל',
    type: 'event',
    category: 'היסטוריה',
    importance: 1,
    startYear: 3350, // מעוגל ל-50 (תואם 600- לפנה"ס בלוח הכיתה / 586-423 לפנה"ס)
    description: `החרבת בית המקדש הראשון בידי נבוכדנצר מלך בבל והגליית עם ישראל לבבל. תקופת "על נהרות בבל" וגעגועי ציון.`,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    tags: ['חורבן בית ראשון', 'גלות בבל', 'נבוכדנצר'],
    links: [],
    color: '#ef4444',
    tradition: 'jewish',
    createdAt: 7,
  },
  {
    id: 'chavruta-cyrus',
    title: 'הצהרת כורש, עזרא הסופר ותקופת בית שני',
    type: 'period',
    category: 'מקדש',
    importance: 1,
    startYear: 3400, // מעוגל ל-50 (תואם 450- לפנה"ס בלוח הכיתה)
    endYear: 3850,   // מעוגל ל-50 (חורבן בית שני - 70 לספירה)
    description: `הצהרת כורש, שיבת ציון, עליית עזרא ונחמיה, חידוש בית המקדש השני וכינון כנסת הגדולה. תקופה של פריחה הלכתית והתגבשות מסורת חז"ל.`,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['בית שני', 'כורש', 'שיבת ציון', 'עזרא הסופר', 'אנשי כנסת הגדולה'],
    links: [],
    color: '#ec4899',
    tradition: 'jewish',
    createdAt: 8,
  },

  // ==========================================
  // 10 התחנות של חברותא שטייגען (תיכון החממה)
  // ==========================================
  {
    id: 'chavruta-plato',
    title: 'אפלטון',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 3350, // מעוגל ל-50 שנה (עגול: 500- לפנה"ס / לוח כיתה: 450- לפנה"ס / מדויק: 428–348 לפנה"ס)
    endYear: 3410,
    description: `פילוסופיה יוונית קלאסית, משל המערה ותורת האידיאות. תלמידו של סוקרטס ומורו של אריסטו באתונה הקלאסית. עמודי התווך של החשיבה המערבית.`,
    imageUrl: '/images/image_4.png',
    tags: ['אפלטון', 'פילוסופיה יוונית', 'משל המערה', 'תורת האידיאות', 'סוקרטס', 'יוון הקלאסית'],
    links: [
      { label: 'אפלטון - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%90%D7%A4%D7%9C%D7%98%D7%95%D7%9F' }
    ],
    color: '#6366f1',
    tradition: 'general', // מעל הציר!
    createdAt: 9,
  },
  {
    id: 'chavruta-alexander',
    title: 'אלכסנדר מוקדון ותרגום השבעים',
    type: 'person',
    category: 'היסטוריה כללית',
    importance: 2,
    startYear: 3450, // מעוגל ל-50 (תואם 300- לפנה"ס בלוח הכיתה / 330 לפנה"ס)
    endYear: 3500,
    description: `כיבוש המזרח בידי אלכסנדר מוקדון, המפגש עם שמעון הצדיק בירושלים, תחילת התקופה ההלניסטית ותרגום התורה ליוונית (תרגום השבעים).`,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    tags: ['אלכסנדר מוקדון', 'תרגום השבעים', 'הלניזם', 'יוון'],
    links: [],
    color: '#8b5cf6',
    tradition: 'general', // מעל הציר!
    createdAt: 10,
  },
  {
    id: 'chavruta-chanukah',
    title: 'מרד החשמונאים ונס חנוכה',
    type: 'event',
    category: 'היסטוריה',
    importance: 1,
    startYear: 3600, // מעוגל ל-50 (165 לפנה"ס -> 150- לפנה"ס)
    description: `התקוממות מתתיהו ובניו כנגד גזירות אנטיוכוס, טיהור המקדש, נס פך השמן וחידוש הריבונות היהודית בארץ ישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80',
    tags: ['חנוכה', 'חשמונאים', 'יהודה המכבי', 'מקדש'],
    links: [],
    color: '#f59e0b',
    tradition: 'jewish',
    createdAt: 11,
  },
  {
    id: 'chavruta-jesus',
    title: 'ישו (ראשית הנצרות)',
    type: 'person',
    category: 'אישים',
    importance: 2,
    startYear: 3760, // מעוגל ל-50 שנה (שנה עגולה: 0/1 לספירה / כ-4 לפנה"ס עד 30 לספירה)
    endYear: 3790,
    description: `תחילת הספירה הנוצרית, הדרשה על ההר, וראשית צמיחתה של הדת הנוצרית מתוך יהדות שלהי ימי בית שני.`,
    imageUrl: '/images/image.png',
    tags: ['ישו', 'ראשית הנצרות', 'המאה ה-1 לספירה', 'הדרשה על ההר'],
    links: [],
    color: '#a855f7',
    tradition: 'general', // מעל הציר!
    createdAt: 12,
  },
  {
    id: 'chavruta-destruction2',
    title: 'חורבן בית המקדש השני',
    type: 'event',
    category: 'היסטוריה',
    importance: 1,
    startYear: 3830, // 70 לספירה (תואם 70 בלוח הכיתה)
    description: `שריפת בית המקדש השני והחרבת ירושלים בידי הרומאים בפיקודו של טיטוס. תחילת הגלות הארוכה ועליית מרכז יבנה של רבן יוחנן בן זכאי.`,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    tags: ['חורבן בית שני', 'רומא', 'טיטוס', 'תשעה באב', 'יבנה'],
    links: [],
    color: '#ef4444',
    tradition: 'jewish',
    createdAt: 13,
  },
  {
    id: 'chavruta-rashbi',
    title: 'רבי שמעון בר יוחאי (רשב״י)',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 3900, // מעוגל ל-50 שנה (שנה עגולה: 150 לספירה / המאה ה-2 לספירה)
    endYear: 3950,
    description: `תנא מגדולי תלמידי רבי עקיבא, ששהה במערה בפקיעין שלוש עשרה שנה. מיוחסת לו תורת הסוד והקבלה וחיבור ספר הזוהר. נקבר בהר מירון.`,
    imageUrl: '/images/rashbi.png',
    tags: ['רשב"י', 'תנאים', 'תורת הסוד', 'קבלה', 'ספר הזוהר', 'פקיעין', 'מירון'],
    links: [
      { label: 'שמעון בר יוחאי - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A9%D7%9E%D7%A2%D7%95%D7%9F_%D7%91%D7%A8_%D7%99%D7%95%D7%97%D7%90%D7%99' }
    ],
    color: '#f59e0b',
    tradition: 'jewish',
    createdAt: 14,
  },
  {
    id: 'chavruta-talmud',
    title: 'דף גמרא (בבא מציעא - חתימת התלמוד)',
    type: 'event',
    category: 'תרבות',
    importance: 1,
    startYear: 4250, // מעוגל ל-50 שנה (שנה עגולה: 500 לספירה / המאה ה-6 לספירה)
    description: `חתימת התלמוד הבבלי בידי רבינא ורב אשי. סוגיית "שנים אוחזין בטלית", צורת הדף, פולמוס דיאלקטי, מחלוקות בית שמאי ובית הלל, והעמדת התורה שבעל פה על בסיסה הנצחי.`,
    imageUrl: '/images/image_9.png',
    tags: ['גמרא', 'בבא מציעא', 'שנים אוחזין', 'תלמוד בבלי', 'תורה שבעל פה', 'רבינא ורב אשי'],
    links: [],
    color: '#06b6d4',
    tradition: 'jewish',
    createdAt: 15,
  },
  {
    id: 'chavruta-rambam',
    title: 'הרמב״ם (רבי משה בן מימון)',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 4950, // מעוגל ל-50 שנה (שנה עגולה: 1200 לספירה / 1138–1204 לספירה)
    endYear: 5000,
    description: `ענק ההלכה והמחשבה היהודית, פילוסוף ורופא דגול. מחבר משנה תורה (היד החזקה), מורה הנבוכים, ופירוש המשנה. "ממשה עד משה לא קם כמשה".`,
    imageUrl: '/images/image_6.png',
    tags: ['הרמב"ם', 'משנה תורה', 'מורה נבוכים', 'פילוסופיה יהודית', 'הלכה', 'רפואה'],
    links: [
      { label: 'הרמב"ם - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A8%D7%9E%D7%91%22%D7%9D' }
    ],
    color: '#eab308',
    tradition: 'jewish',
    createdAt: 16,
  },
  {
    id: 'chavruta-admor-hazaken',
    title: 'האדמו״ר הזקן (בעל התניא)',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5550, // מעוגל ל-50 שנה (שנה עגולה: 1800 לספירה / 1745–1812 לספירה)
    endYear: 5600,
    description: `רבי שניאור זלמן מלאדי, מייסד חסידות חב״ד ומחבר ספר התניא ושולחן ערוך הרב. פיתח את תורת החסידות העיונית המשלבת בין חכמה, בינה ודעת לבין דבקות בעבודת ה'.`,
    imageUrl: '/images/image_5.png',
    tags: ['חב"ד', 'בעל התניא', 'האדמו"ר הזקן', 'חסידות', 'תורת הנפש'],
    links: [],
    color: '#3b82f6',
    tradition: 'jewish',
    createdAt: 17,
  },
  {
    id: 'chavruta-freud',
    title: 'זיגמונד פרויד',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5650, // מעוגל ל-50 שנה (שנה עגולה: 1900 לספירה / 1856–1939 לספירה)
    endYear: 5700,
    description: `רופא נוירולוג יהודי אוסטרי, אבי הפסיכואנליזה, מחבר "פירוש החלומות". פיתח את תורת הנפש המודרנית, מושגי המודע, התת-מודע, האיד, האגו והסופר-אגו.`,
    imageUrl: '/images/image_3.png',
    tags: ['פסיכואנליזה', 'פרויד', 'תת מודע', 'תורת הנפש', 'פירוש החלומות'],
    links: [
      { label: 'זיגמונד פרויד - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%96%D7%99%D7%92%D7%9E%D7%95%D7%A0%D7%93_%D7%A4%D7%A8%D7%95%D7%99%D7%93' }
    ],
    color: '#64748b',
    tradition: 'general', // מעל הציר!
    createdAt: 18,
  },
  {
    id: 'chavruta-arendt',
    title: 'חנה ארנדט',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5700, // מעוגל ל-50 שנה (שנה עגולה: 1950 לספירה / 1906–1975 לספירה)
    endYear: 5750,
    description: `פילוסופית וחוקרת מדע המדינה יהודייה-גרמנית. טבעה את המושג "הבנאליות של הרוע" בדיווחיה ממשפט אייכמן בירושלים, וחקרה לעומק את שורשי הטוטליטריזם והחירות.`,
    imageUrl: '/images/image_11.png',
    tags: ['חנה ארנדט', 'פילוסופיה פוליטית', 'הבנאליות של הרוע', 'משפט אייכמן', 'טוטליטריזם'],
    links: [
      { label: 'חנה ארנדט - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%97%D7%A0%D7%94_%D7%90%D7%A8%D7%A0%D7%93%D7%98' }
    ],
    color: '#0ea5e9',
    tradition: 'general', // מעל הציר!
    createdAt: 19,
  },
  {
    id: 'chavruta-israel',
    title: 'הקמת מדינת ישראל',
    type: 'event',
    category: 'היסטוריה',
    importance: 1,
    startYear: 5708, // 1948 לספירה (מעוגל ל-1950 / 5700)
    description: `הכרזת העצמאות של מדינת ישראל בה' באייר תש"ח על ידי דוד בן גוריון במוזיאון תל אביב, חידוש הריבונות היהודית בארץ ישראל לאחר אלפיים שנות גלות.`,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['מדינת ישראל', 'עצמאות', 'תש"ח', '1948', 'ציונות'],
    links: [
      { label: 'מגילת העצמאות - אתר הכנסת', url: 'https://main.knesset.gov.il/about/pages/declaration.aspx' }
    ],
    color: '#2563eb',
    tradition: 'jewish',
    createdAt: 20,
  },
  {
    id: 'chavruta-yemima',
    title: 'ימימה אביטל',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5750, // מעוגל ל-50 שנה (שנה עגולה: 1990/2000 לספירה / 1929–1999 לספירה)
    endYear: 5760,
    description: `מורה רוחנית ומפתחת תורת "החשיבה ההכרתית" (לימוד ימימה). לימדה אלפי תלמידים עבודה פנימית על המידות, תיקון הלב, הפרדה בין עיקר לטפל והתקרבות לכוחות הנפש החיוביים.`,
    imageUrl: '/images/image_10.png',
    tags: ['ימימה אביטל', 'חשיבה הכרתית', 'לימוד ימימה', 'תורת הנפש', 'עבודה על המידות'],
    links: [
      { label: 'ימימה אביטל - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%99%D7%9E%D7%99%D7%9E%D7%94_%D7%90%D7%91%D7%99%D7%98%D7%9C' }
    ],
    color: '#ec4899',
    tradition: 'jewish',
    createdAt: 21,
  },
  {
    id: 'chavruta-rav-ovadia',
    title: 'הרב עובדיה יוסף',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5750, // מעוגל ל-50 שנה (שנה עגולה: 2000 לספירה / 1920–2013 לספירה)
    endYear: 5775,
    description: `הראשון לציון, פוסק הדור הספרדי, מנהיג רוחני ומחבר עשרות כרכי שו"ת "יביע אומר" ו"יחוה דעת". חולל מהפכה תורנית וחינוכית והחזיר את עטרת יהדות ספרד ליושנה בדורנו.`,
    imageUrl: '/images/image_2.png',
    tags: ['הרב עובדיה יוסף', 'יביע אומר', 'הראשון לציון', 'פוסק ספרדי', 'הלכה'],
    links: [
      { label: 'הרב עובדיה יוסף - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%94_%D7%99%D7%95%D7%A1%D7%A3' }
    ],
    color: '#10b981',
    tradition: 'jewish',
    createdAt: 22,
  }
];
