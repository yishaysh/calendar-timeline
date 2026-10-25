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
  // פרק א': עולם התנ"ך והעת העתיקה
  // ==========================================
  {
    id: 'chavruta-creation',
    title: 'בריאת העולם ואדם הראשון',
    type: 'event',
    category: 'תנ"ך',
    importance: 1,
    startYear: 1, // 3761 לפנה"ס
    description: `בריאת העולם, השמיים, הארץ וכל אשר בם, וסיומה בבריאת אדם וחוה ביום השישי. ראשית ציר הזמן האנושי על פי המסורת היהודית (שנת א' לבריאה / 3761 לפנה"ס).`,
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    tags: ['בראשית', 'בריאת העולם', 'אדם הראשון', 'תורה שבכתב'],
    links: [
      { label: 'אדם הראשון - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%90%D7%93%D7%9D_%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%9F' },
      { label: 'בריאת העולם בתנ"ך - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%91%D7%A8%D7%99%D7%90%D7%AA_%D7%94%D7%A2%D7%95%D7%9C%D7%9D_%D7%91%D7%AA%D7%A0%22%D7%9A' }
    ],
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
    startYear: 1656, // 2105 לפנה"ס (ב'תרנ"ו לבריאה)
    description: `המבול ותיבת נח בשנת ב'תרנ"ו לבריאה (2105 לפנה"ס). רקע היסטורי ותרבותי במזרח הקדום (עלילות גילגמש, קודי חוקים קדומים כמו חוקי חמורבי). התחלה מחודשת של האנושות עם ברית הקשת.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    tags: ['המבול', 'נח', 'חוקי חמורבי', 'עלילות גילגמש', 'בראשית'],
    links: [
      { label: 'נח - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A0%D7%97' },
      { label: 'המבול - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%91%D7%95%D7%9C' }
    ],
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
    startYear: 1948, // 1813 לפנה"ס (א'תתקמ"ח לבריאה)
    endYear: 2123,   // 1638 לפנה"ס (ב'קכ"ג לבריאה - 175 שנה)
    description: `אבי האומה העברית (נולד בשנת א'תתקמ"ח / 1813 לפנה"ס וחי 175 שנה עד שנת ב'קכ"ג / 1638 לפנה"ס). מפיץ האמונה המונותאיסטית בעולם, עמוד החסד, ברית בין הבתרים וההבטחה לארץ ישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    tags: ['אברהם', 'אבות', 'מונותאיזם', 'ברית בין הבתרים'],
    links: [
      { label: 'אברהם אבינו - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%A8%D7%94%D7%9D' }
    ],
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
    startYear: 2448, // 1313 לפנה"ס (ב'תתמ"ח לבריאה / המאה ה-13 לפנה"ס)
    description: `גאולת ישראל משעבוד מצרים בהנהגת משה רבנו, מתן תורה ועשרת הדיברות בהר סיני ב-ו' בסיוון שנת ב'תתמ"ח לבריאה (1313 לפנה"ס / המאה ה-13 לפנה"ס), והנחלת חמשת חומשי תורה.`,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    tags: ['תורה שבכתב', 'משה רבנו', 'יציאת מצרים', 'מעמד הר סיני', 'חומש'],
    links: [
      { label: 'מעמד הר סיני - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%9E%D7%A2%D7%9E%D7%93_%D7%94%D7%A8_%D7%A1%D7%99%D7%A0%D7%99' },
      { label: 'משה רבנו - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94' },
      { label: 'יציאת מצרים - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%99%D7%90%D7%AA_%D7%9E%D7%A6%D7%A8%D7%99%D7%9D' }
    ],
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
    startYear: 2488, // 1273 לפנה"ס (ב'תפ"ח לבריאה)
    endYear: 2884,   // 877 לפנה"ס (ב'תתפ"ד לבריאה / כ-1025 לפנה"ס במחקר)
    description: `כניסת בני ישראל לארץ בהנהגת יהושע (שנת ב'תפ"ח לבריאה) ותקופת השופטים (דבורה, גדעון, שמשון, שמואל הנביא) עד להמלכת שאול המלך ותחילת המלוכה בישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    tags: ['שופטים', 'יהושע', 'שמואל הנביא', 'נביאים'],
    links: [
      { label: 'תקופת השופטים - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%94%D7%A9%D7%95%D7%A4%D7%98%D7%99%D7%9D' }
    ],
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
    startYear: 2801, // 960 לפנה"ס במחקר (במסורת: 2928 / 833 לפנה"ס)
    endYear: 3175,   // 586 לפנה"ס במחקר (במסורת: 3338 / 423 לפנה"ס)
    description: `מלכות דוד ושלמה ובניית בית המקדש הראשון בירושלים על הר המוריה ועד חורבנו (960 - 586 לפנה"ס במחקר / 833 - 423 לפנה"ס במסורת סדר עולם). מרכז הרוח והריבונות של עם ישראל לאורך מאות שנים.`,
    imageUrl: 'https://images.unsplash.com/photo-1548625361-12f8a846152e?auto=format&fit=crop&w=800&q=80',
    tags: ['בית ראשון', 'דוד המלך', 'שלמה המלך', 'ירושלים', 'מלכים'],
    links: [
      { label: 'בית המקדש הראשון - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%A7%D7%93%D7%A9_%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%9F' }
    ],
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
    startYear: 3175, // 586 לפנה"ס במחקר (במסורת סדר עולם: 3338 / 423 לפנה"ס)
    description: `החרבת בית המקדש הראשון בידי נבוכדנצר מלך בבל והגליית עם ישראל לבבל (586 לפנה"ס במחקר / 423 לפנה"ס במסורת סדר עולם). תקופת "על נהרות בבל" וגעגועי ציון.`,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    tags: ['חורבן בית ראשון', 'גלות בבל', 'נבוכדנצר'],
    links: [
      { label: 'גלות בבל - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%92%D7%9C%D7%95%D7%AA_%D7%91%D7%91%D7%9C' },
      { label: 'חורבן בית ראשון - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A6%D7%95%D7%A8_%D7%A2%D7%9C_%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_(588_%D7%9C%D7%A4%D7%A0%D7%94%22%D7%A1)' }
    ],
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
    startYear: 3223, // 538 לפנה"ס (הצהרת כורש / שיבת ציון; במסורת: 3408 / 353 לפנה"ס)
    endYear: 3830,   // 70 לספירה (חורבן בית שני בידי טיטוס)
    description: `הצהרת כורש (538 לפנה"ס), שיבת ציון, עליית עזרא ונחמיה, חידוש בית המקדש השני וכינון כנסת הגדולה ועד חורבנו בשנת 70 לספירה (3830 לבריאה).`,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['בית שני', 'כורש', 'שיבת ציון', 'עזרא הסופר', 'אנשי כנסת הגדולה'],
    links: [
      { label: 'הכרזת כורש - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%94%D7%9B%D7%A8%D7%96%D7%AA_%D7%9B%D7%95%D7%A8%D7%A9' },
      { label: 'עזרא הסופר - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A2%D7%96%D7%A8%D7%90_%D7%94%D7%A1%D7%95%D7%A4%D7%A8' },
      { label: 'תקופת בית שני - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A7%D7%95%D7%A4%D7%AA_%D7%91%D7%99%D7%AA_%D7%A9%D7%A0%D7%99' }
    ],
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
    startYear: 3333, // 428/427 לפנה"ס
    endYear: 3414,   // 348/347 לפנה"ס
    description: `פילוסופיה יוונית קלאסית, משל המערה ותורת האידיאות (428/427 - 348/347 לפנה"ס / 3333 - 3414 לבריאה). תלמידו של סוקרטס ומורו של אריסטו באתונה הקלאסית. עמודי התווך של החשיבה המערבית.`,
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
    startYear: 3405, // 356 לפנה"ס
    endYear: 3438,   // 323 לפנה"ס
    description: `אלכסנדר מוקדון (356 - 323 לפנה"ס / 3405 - 3438 לבריאה). כיבוש המזרח, המפגש עם שמעון הצדיק בירושלים, תחילת התקופה ההלניסטית ותרגום התורה ליוונית (תרגום השבעים).`,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    tags: ['אלכסנדר מוקדון', 'תרגום השבעים', 'הלניזם', 'יוון'],
    links: [
      { label: 'אלכסנדר מוקדון - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%90%D7%9C%D7%9B%D7%A1%D7%A0%D7%93%D7%A8_%D7%94%D7%92%D7%93%D7%95%D7%9C' },
      { label: 'תרגום השבעים - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%A8%D7%92%D7%95%D7%9D_%D7%94%D7%A9%D7%91%D7%22%D7%99' }
    ],
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
    startYear: 3597, // 164 לפנה"ס (כ"ה בכסלו ג'תר"א)
    description: `התקוממות מתתיהו ובניו כנגד גזירות אנטיוכוס, טיהור המקדש ונס פך השמן בשנת 164 לפנה"ס (ג'תר"א לבריאה), וחידוש הריבונות היהודית בארץ ישראל.`,
    imageUrl: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80',
    tags: ['חנוכה', 'חשמונאים', 'יהודה המכבי', 'מקדש'],
    links: [
      { label: 'מרד החשמונאים - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%93_%D7%94%D7%97%D7%A9%D7%9E%D7%95%D7%A0%D7%90%D7%99%D7%9D' },
      { label: 'חנוכה - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%97%D7%A0%D7%95%D7%9B%D7%94' }
    ],
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
    startYear: 3757, // כ-4 לפנה"ס
    endYear: 3793,   // כ-33 לספירה
    description: `ישו מנצרת (כ-4 לפנה"ס עד 30-33 לספירה / 3757 - 3793 לבריאה). ראשית צמיחתה של הדת הנוצרית מתוך יהדות שלהי ימי בית שני, הדרשה על ההר.`,
    imageUrl: '/images/image.png',
    tags: ['ישו', 'ראשית הנצרות', 'המאה ה-1 לספירה', 'הדרשה על ההר'],
    links: [
      { label: 'ישו - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%95' }
    ],
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
    startYear: 3830, // 70 לספירה (ג'תת"ל לבריאה)
    description: `שריפת בית המקדש השני והחרבת ירושלים בידי הרומאים בפיקודו של טיטוס בשנת 70 לספירה (ג'תת"ל לבריאה). תחילת הגלות הארוכה ועליית מרכז יבנה של רבן יוחנן בן זכאי.`,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    tags: ['חורבן בית שני', 'רומא', 'טיטוס', 'תשעה באב', 'יבנה'],
    links: [
      { label: 'חורבן בית המקדש השני - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A6%D7%95%D7%A8_%D7%A2%D7%9C_%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_(70)' },
      { label: 'בית המקדש השני - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%A7%D7%93%D7%A9_%D7%94%D7%A9%D7%A0%D7%99' }
    ],
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
    startYear: 3840, // כ-80 לספירה (המאה ה-2 לספירה)
    endYear: 3920,   // כ-160 לספירה
    description: `תנא מגדולי תלמידי רבי עקיבא (פעל במאה ה-2 לספירה, כ-80 עד 160 לספירה / 3840 עד 3920 לבריאה), ששהה במערה בפקיעין שלוש עשרה שנה בימי גזירות אדריאנוס. מיוחסת לו תורת הסוד והקבלה וחיבור ספר הזוהר.`,
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
    startYear: 4260, // 500 לספירה (ד'ר"ס לבריאה)
    description: `חתימת התלמוד הבבלי בידי רבינא ורב אשי סביב שנת 500 לספירה (ד'ר"ס לבריאה). סוגיית "שנים אוחזין בטלית", צורת הדף, פולמוס דיאלקטי, מחלוקות בית שמאי ובית הלל, והעמדת התורה שבעל פה על בסיסה הנצחי.`,
    imageUrl: '/images/image_9.png',
    tags: ['גמרא', 'בבא מציעא', 'שנים אוחזין', 'תלמוד בבלי', 'תורה שבעל פה', 'רבינא ורב אשי'],
    links: [
      { label: 'תלמוד בבלי - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%AA%D7%9C%D7%9E%D7%95%D7%93_%D7%91%D7%91%D7%9C%D7%99' },
      { label: 'מסכת בבא מציעא - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%9E%D7%A1%D7%9B%D7%AA_%D7%91%D7%91%D7%90_%D7%9E%D7%A6%D7%99%D7%A2%D7%90' }
    ],
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
    startYear: 4898, // 1138 לספירה (ד'תתצ"ח לבריאה)
    endYear: 4964,   // 1204 לספירה (ד'תתקס"ה לבריאה)
    description: `רבי משה בן מימון (1138 – 1204 לספירה / ד'תתצ"ח – ד'תתקס"ה לבריאה). ענק ההלכה והמחשבה היהודית, פילוסוף ורופא דגול. מחבר משנה תורה (היד החזקה), מורה הנבוכים, ופירוש המשנה. "ממשה עד משה לא קם כמשה".`,
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
    startYear: 5505, // 1745 לספירה (ה'תק"ה לבריאה)
    endYear: 5572,   // 1812 לספירה (ה'תקע"ג לבריאה)
    description: `רבי שניאור זלמן מלאדי (1745 – 1812 לספירה / ה'תק"ה – ה'תקע"ג לבריאה). מייסד חסידות חב״ד ומחבר ספר התניא ושולחן ערוך הרב. פיתח את תורת החסידות העיונית המשלבת בין חכמה, בינה ודעת לבין דבקות בעבודת ה'.`,
    imageUrl: '/images/image_5.png',
    tags: ['חב"ד', 'בעל התניא', 'האדמו"ר הזקן', 'חסידות', 'תורת הנפש'],
    links: [
      { label: 'האדמו״ר הזקן (בעל התניא) - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A9%D7%A0%D7%99%D7%90%D7%95%D7%A8_%D7%96%D7%9C%D7%9E%D7%9F_%D7%9E%D7%9C%D7%90%D7%93%D7%99' },
      { label: 'ספר התניא - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A1%D7%A4%D7%A8_%D7%94%D7%AA%D7%A0%D7%99%D7%90' }
    ],
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
    startYear: 5616, // 1856 לספירה (ה'תרט"ז לבריאה)
    endYear: 5699,   // 1939 לספירה (ה'תרצ"ט לבריאה)
    description: `זיגמונד פרויד (1856 – 1939 לספירה / ה'תרט"ז – ה'תרצ"ט לבריאה). רופא נוירולוג יהודי אוסטרי, אבי הפסיכואנליזה, מחבר "פירוש החלומות". פיתח את תורת הנפש המודרנית, מושגי המודע, התת-מודע, האיד, האגו והסופר-אגו.`,
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
    startYear: 5666, // 1906 לספירה (ה'תרס"ז לבריאה)
    endYear: 5735,   // 1975 לספירה (ה'תשל"ו לבריאה)
    description: `חנה ארנדט (1906 – 1975 לספירה / ה'תרס"ז – ה'תשל"ו לבריאה). פילוסופית וחוקרת מדע המדינה יהודייה-גרמנית. טבעה את המושג "הבנאליות של הרוע" בדיווחיה ממשפט אייכמן בירושלים, וחקרה לעומק את שורשי הטוטליטריזם והחירות.`,
    imageUrl: '/images/image_11.png',
    tags: ['חנה ארנדט', 'פילוסופיה פוליטית', 'הבנאליות של הרוע', 'משפט אייכמן', 'טוטליטריזם'],
    links: [
      { label: 'חנה ארנדט - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%97%D7%A0%D7%94_%D7%90%D7%A8%D7%A0%D7%93%D7%98' }
    ],
    color: '#0ea5e9',
    tradition: 'jewish', // מסורת והגות יהודית (מתחת לציר)
    createdAt: 19,
  },
  {
    id: 'chavruta-israel',
    title: 'הקמת מדינת ישראל',
    type: 'event',
    category: 'היסטוריה',
    importance: 1,
    startYear: 5708, // 1948 לספירה (ה' באייר תש"ח)
    description: `הכרזת העצמאות של מדינת ישראל בה' באייר תש"ח (14 במאי 1948) על ידי דוד בן גוריון במוזיאון תל אביב, חידוש הריבונות היהודית בארץ ישראל לאחר אלפיים שנות גלות.`,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['מדינת ישראל', 'עצמאות', 'תש"ח', '1948', 'ציונות'],
    links: [
      { label: 'מגילת העצמאות - אתר הכנסת', url: 'https://main.knesset.gov.il/about/pages/declaration.aspx' },
      { label: 'הכרזת העצמאות - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%94%D7%9B%D7%A8%D7%96%D7%AA_%D7%94%D7%A2%D7%A6%D7%9E%D7%90%D7%95%D7%AA' }
    ],
    color: '#2563eb',
    tradition: 'jewish',
    createdAt: 20,
  },
  {
    id: 'chavruta-rav-ovadia',
    title: 'הרב עובדיה יוסף',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5681, // 1920 לספירה (י"ב בתשרי תרפ"א)
    endYear: 5774,   // 2013 לספירה (ג' במרחשוון תשע"ד)
    description: `הרב עובדיה יוסף (1920 – 2013 לספירה / ה'תרפ"א – ה'תשע"ד לבריאה). הראשון לציון, פוסק הדור הספרדי, מנהיג רוחני ומחבר עשרות כרכי שו"ת "יביע אומר" ו"יחוה דעת". חולל מהפכה תורנית וחינוכית והחזיר את עטרת יהדות ספרד ליושנה בדורנו.`,
    imageUrl: '/images/image_2.png',
    tags: ['הרב עובדיה יוסף', 'יביע אומר', 'הראשון לציון', 'פוסק ספרדי', 'הלכה'],
    links: [
      { label: 'הרב עובדיה יוסף - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%94_%D7%99%D7%95%D7%A1%D7%A3' }
    ],
    color: '#10b981',
    tradition: 'jewish',
    createdAt: 21,
  },
  {
    id: 'chavruta-yemima',
    title: 'ימימה אביטל',
    type: 'person',
    category: 'אישים',
    importance: 1,
    startYear: 5689, // 1929 לספירה (י"ט באדר א' תרפ"ט)
    endYear: 5759,   // 1999 לספירה (ב' בסיוון תשנ"ט)
    description: `ימימה אביטל (1929 – 1999 לספירה / ה'תרפ"ט – ה'תשנ"ט לבריאה). מורה רוחנית ומפתחת תורת "החשיבה ההכרתית" (לימוד ימימה). לימדה אלפי תלמידים עבודה פנימית על המידות, תיקון הלב, הפרדה בין עיקר לטפל והתקרבות לכוחות הנפש החיוביים.`,
    imageUrl: '/images/image_10.png',
    tags: ['ימימה אביטל', 'חשיבה הכרתית', 'לימוד ימימה', 'תורת הנפש', 'עבודה על המידות'],
    links: [
      { label: 'ימימה אביטל - ויקיפדיה', url: 'https://he.wikipedia.org/wiki/%D7%99%D7%9E%D7%99%D7%9E%D7%94_%D7%90%D7%91%D7%99%D7%98%D7%9C' }
    ],
    color: '#ec4899',
    tradition: 'jewish',
    createdAt: 22,
  }
];
