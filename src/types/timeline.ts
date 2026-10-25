export type EntityType = 'period' | 'event' | 'person';

export interface ExternalLink {
  label: string;
  url: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  type: EntityType;
  category: string; // e.g., 'תנ"ך', 'היסטוריה כללית', 'מדע', 'אישים', 'תרבות', 'מקדש'
  importance: 1 | 2 | 3 | 4; // 1 = Always visible (Macro), 4 = Micro (max zoom only)
  startYear: number; // Hebrew Year (1 - 6000). For 'person', this is birth/active year.
  endYear?: number;  // Required for 'period'. Optional for 'person' (death year).
  description: string;
  imageUrl?: string;
  tags: string[];
  links: ExternalLink[];
  color?: string; // Optional custom hex/tailwind color
  tradition?: 'jewish' | 'general'; // 'jewish' (מתחת לציר) | 'general' (מעל לציר)
  createdAt: number;
}

export interface GregorianDateInfo {
  year: number;
  era: 'BCE' | 'CE';
  formatted: string; // e.g. "3761 לפנה"ס" or "1948 לספירה"
}

export interface RulerTick {
  hebrewYear: number;
  gregorian: GregorianDateInfo;
  x: number;
  isMajor: boolean;
  labelHebrew: string;
  labelGregorian: string;
}

export interface LaneItem {
  item: TimelineItem;
  lane: number;
  startX: number; // Screen pixel (RTL: right side)
  endX: number;   // Screen pixel (RTL: left side)
  width: number;
}

export interface StaggeredNode {
  item: TimelineItem;
  x: number;
  tier: number; // 0, 1, 2 for vertical offset
  direction: 'above' | 'below'; // 'above' for general, 'below' for jewish
  collapsed: boolean;
}

export type FilterCategory = 'ALL' | string;
export type FilterType = 'ALL' | EntityType;

export type SiteTheme = 'classic-dark' | 'museum-brutalist' | 'desert-zen';

export interface ThemeInfo {
  id: SiteTheme;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
}

