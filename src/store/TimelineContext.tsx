import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { TimelineItem, FilterCategory, FilterType, SiteTheme, ThemeInfo } from '../types/timeline';
import { SEED_TIMELINE_ITEMS } from './seedData';

export const THEME_CONFIGS: ThemeInfo[] = [
  {
    id: 'classic-dark',
    name: 'קלאסי כהה (קוסמי)',
    subtitle: 'שחור אובסידיאן, ציאן וזהב',
    description: 'מראה כהה ויוקרתי עם עומק אסטרונומי והילת זהב',
    primaryColor: '#0f172a',
    accentColor: '#f59e0b',
    bgColor: '#080d19',
  },
  {
    id: 'museum-brutalist',
    name: 'ארכיון ברוטליסטי',
    subtitle: 'מונוכרום אדריכלי וכחול קליין',
    description: 'קווים גיאומטריים חדים, ניגודיות גבוהה, סגנון מוזיאלי ואוצרותי',
    primaryColor: '#ffffff',
    accentColor: '#002fa7',
    bgColor: '#e6e5df',
  },
  {
    id: 'desert-zen',
    name: 'זן מדברי מינימליסטי',
    subtitle: 'חול יהודה, טרקוטה ורוגע',
    description: 'גווני חול חמים, אבן חלוקי נחל, מרווחי נשימה ושקט אופטימי',
    primaryColor: '#fbf7f0',
    accentColor: '#c26d53',
    bgColor: '#f4eee5',
  },
];

const STORAGE_KEY = 'timeline_items_chavruta_v3';
const SITE_THEME_KEY = 'site_active_theme_v1';
const ADMIN_AUTH_KEY = 'timeline_admin_authenticated_v1';
const ADMIN_TOKEN_KEY = 'timeline_admin_token_v1';
const ADMIN_CUSTOM_PASS_KEY = 'timeline_admin_custom_pass_v1';

const DEFAULT_ADMIN_PASSWORD = 'avianir';

function getEffectiveAdminPassword(): string {
  try {
    const custom = localStorage.getItem(ADMIN_CUSTOM_PASS_KEY);
    if (custom && custom.trim()) return custom.trim();
  } catch {}
  return ((import.meta as any).env?.VITE_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim();
}

interface TimelineContextType {
  items: TimelineItem[];
  filteredItems: TimelineItem[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: FilterCategory;
  setSelectedCategory: (cat: FilterCategory) => void;
  selectedType: FilterType;
  setSelectedType: (type: FilterType) => void;
  selectedItem: TimelineItem | null;
  setSelectedItem: (item: TimelineItem | null) => void;
  editingItem: TimelineItem | null;
  setEditingItem: (item: TimelineItem | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;
  aiInitialPrompt: string;
  setAiInitialPrompt: (prompt: string) => void;
  aiTargetItem: TimelineItem | null;
  setAiTargetItem: (item: TimelineItem | null) => void;
  openAIWithPrompt: (initialPrompt?: string, targetItem?: TimelineItem | null) => void;
  targetJumpYear: { year: number; ts: number } | null;
  jumpToYear: (year: number) => void;
  addItem: (item: Omit<TimelineItem, 'id' | 'createdAt'>) => TimelineItem;
  addItems: (items: Array<Omit<TimelineItem, 'id' | 'createdAt'>>) => TimelineItem[];
  updateItem: (id: string, updates: Partial<TimelineItem>) => void;
  deleteItem: (id: string) => void;
  resetToDefault: () => void;
  showHebrewYearsOnRuler: boolean;
  setShowHebrewYearsOnRuler: (show: boolean) => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => { success: boolean; error?: string };
  dbStatus: 'connected' | 'offline' | 'checking';
  isSyncing: boolean;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  syncWithDatabase: () => Promise<void>;
  pushAllToDatabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  adminModalMessage: string;
  setAdminModalMessage: (msg: string) => void;
  requireAdmin: (action: () => void, customMessage?: string) => void;
  currentTheme: SiteTheme;
  setCurrentTheme: (theme: SiteTheme) => Promise<void>;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

// Known non-Jewish / world philosophers, scientists, and global historical figures
// Known non-Jewish / world philosophers, scientists, and global historical figures
const GENERAL_FIGURE_KEYWORDS = [
  'אפלטון', 'אריסטו', 'סוקרטס', 'אלכסנדר מוקדון', 'ישו',
  'קאנט', 'דקארט', 'הגל', 'ניטשה', 'הובס', 'לוק', 'רוסו', 'שופנהאואר',
  'ניוטון', 'גלילאו', 'דרווין', 'גוטנברג', 'קיסר', 'אוגוסטוס'
];

export function sanitizeItemTradition(item: TimelineItem): TimelineItem {
  // If tradition is explicitly set on the item ('jewish' or 'general'), faithfully respect it!
  let tradition: 'jewish' | 'general' = item.tradition || 'jewish';

  // Only if tradition was unspecified, check against general world thinkers
  if (!item.tradition) {
    const title = (item.title || '').toLowerCase();
    const isGeneralFigure = GENERAL_FIGURE_KEYWORDS.some((kw) => title.includes(kw));
    if (isGeneralFigure) {
      tradition = 'general';
    }
  }

  // Periods are major horizontal timeline lanes that define the macro structure of history.
  // Always guarantee importance: 1 so they are visible at every zoom level.
  const importance = item.type === 'period' ? 1 : (item.importance || 1);

  return { ...item, tradition, importance };
}

export const TimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Neon DB is the single source of truth. Initialize from seed and sync with Neon DB immediately.
  const [items, setItems] = useState<TimelineItem[]>(() => {
    return SEED_TIMELINE_ITEMS.map(sanitizeItemTradition);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [selectedType, setSelectedType] = useState<FilterType>('ALL');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [aiTargetItem, setAiTargetItem] = useState<TimelineItem | null>(null);
  const [targetJumpYear, setTargetJumpYear] = useState<{ year: number; ts: number } | null>(null);

  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Site Theme State ('classic-dark' | 'museum-brutalist' | 'desert-zen')
  const [currentTheme, setCurrentThemeState] = useState<SiteTheme>(() => {
    try {
      const stored = localStorage.getItem(SITE_THEME_KEY);
      if (stored === 'museum-brutalist' || stored === 'desert-zen' || stored === 'classic-dark') {
        return stored as SiteTheme;
      }
    } catch {}
    return 'classic-dark';
  });

  // Apply theme attribute to html and body
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.body.setAttribute('data-theme', currentTheme);
    } catch {}
  }, [currentTheme]);

  // Set theme, persist locally, and push to database if available
  const setCurrentTheme = useCallback(async (newTheme: SiteTheme) => {
    setCurrentThemeState(newTheme);
    try {
      localStorage.setItem(SITE_THEME_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }

    // Persist to Neon DB settings table
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'site_theme', value: newTheme }),
      });
    } catch {}
  }, []);

  // Sync theme from server on startup
  useEffect(() => {
    const fetchRemoteTheme = async () => {
      try {
        const res = await fetch('/api/settings?key=site_theme');
        if (res.ok) {
          const data = await res.json();
          const remote = data?.setting?.value;
          if (remote && (remote === 'classic-dark' || remote === 'museum-brutalist' || remote === 'desert-zen')) {
            setCurrentThemeState(remote);
            try {
              localStorage.setItem(SITE_THEME_KEY, remote);
              document.documentElement.setAttribute('data-theme', remote);
              document.body.setAttribute('data-theme', remote);
            } catch {}
          }
        }
      } catch {}
    };
    fetchRemoteTheme();
  }, []);

  // Admin and Security States - default permanent password is avianir
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch {}
    return getEffectiveAdminPassword();
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminModalMessage, setAdminModalMessage] = useState('');
  const pendingAdminActionRef = useRef<(() => void) | null>(null);

  const loginAdmin = useCallback((inputPassword: string): boolean => {
    const effective = getEffectiveAdminPassword();
    if (inputPassword.trim() === effective) {
      setIsAdmin(true);
      setAdminToken(inputPassword.trim());
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_TOKEN_KEY, inputPassword.trim());
      } catch (e) {
        console.warn('Failed to persist admin session', e);
      }
      setIsAdminModalOpen(false);

      if (pendingAdminActionRef.current) {
        const action = pendingAdminActionRef.current;
        pendingAdminActionRef.current = null;
        setTimeout(() => action(), 50);
      }
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (e) {
      console.warn('Failed to clear admin session', e);
    }
  }, []);

  const changeAdminPassword = useCallback((oldPass: string, newPass: string) => {
    const effective = getEffectiveAdminPassword();
    if (oldPass.trim() !== effective) {
      return { success: false, error: 'הסיסמה הנוכחית שהוזנה שגויה' };
    }
    if (newPass.trim().length < 4) {
      return { success: false, error: 'הסיסמה החדשה חייבת להכיל לפחות 4 תווים' };
    }
    try {
      localStorage.setItem(ADMIN_CUSTOM_PASS_KEY, newPass.trim());
      setAdminToken(newPass.trim());
      localStorage.setItem(ADMIN_TOKEN_KEY, newPass.trim());
      return { success: true };
    } catch {
      return { success: false, error: 'שגיאה בשמירת הסיסמה' };
    }
  }, []);

  const requireAdmin = useCallback((action: () => void, customMessage?: string) => {
    if (isAdmin) {
      action();
    } else {
      pendingAdminActionRef.current = action;
      if (customMessage) {
        setAdminModalMessage(customMessage);
      }
      setIsAdminModalOpen(true);
    }
  }, [isAdmin]);

  const [showHebrewYearsOnRuler, setShowHebrewYearsOnRulerState] = useState<boolean>(() => {
    return localStorage.getItem('timeline_show_hebrew_ruler') === 'true';
  });

  const setShowHebrewYearsOnRuler = (show: boolean) => {
    setShowHebrewYearsOnRulerState(show);
    localStorage.setItem('timeline_show_hebrew_ruler', String(show));
  };

  const openAIWithPrompt = (initialPrompt: string = '', targetItem: TimelineItem | null = null) => {
    setAiInitialPrompt(initialPrompt);
    setAiTargetItem(targetItem);
    setIsAIModalOpen(true);
  };

  const syncWithDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          setDbStatus('connected');
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items.map(sanitizeItemTradition));
          } else if (items.length > 0) {
            // Auto-seed the database if it's connected but currently empty
            await fetch('/api/items', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminToken,
              },
              body: JSON.stringify(items),
            });
          }
        } else {
          setDbStatus('offline');
        }
      } else {
        setDbStatus('offline');
      }
    } catch {
      setDbStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

  const pushAllToDatabase = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken,
        },
        body: JSON.stringify(items),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbStatus('connected');
        return { success: true, count: items.length };
      }
      return { success: false, error: data.error || 'נכשל בסנכרון לדאטהבייס' };
    } catch (e: any) {
      return { success: false, error: e.message || 'שגיאת תקשורת' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial DB connection & sync check (and clear stale localStorage data/passwords)
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ADMIN_CUSTOM_PASS_KEY);
      localStorage.setItem(ADMIN_TOKEN_KEY, DEFAULT_ADMIN_PASSWORD);
    } catch {}
    syncWithDatabase();
  }, []);

  // Derived categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Search query (title, description, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(q));
        const yearMatch = String(item.startYear).includes(q) || (item.endYear && String(item.endYear).includes(q));
        return titleMatch || descMatch || tagMatch || yearMatch;
      }
      return true;
    });
  }, [items, selectedType, selectedCategory, searchQuery]);

  const jumpToYear = (year: number) => {
    setTargetJumpYear({ year, ts: Date.now() });
  };

  const addItem = (data: Omit<TimelineItem, 'id' | 'createdAt'>): TimelineItem => {
    const rawItem: TimelineItem = {
      ...data,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    const newItem = sanitizeItemTradition(rawItem);
    setItems((prev) => [newItem, ...prev]);

    // Clear active filters so the newly added item is immediately visible
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedItem(newItem);

    // Persist directly to Neon DB (not localStorage)
    fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminToken || getEffectiveAdminPassword(),
      },
      body: JSON.stringify(newItem),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to save item to Neon DB:', err);
          alert(err.error || 'שגיאה בשמירת הפריט למסד הנתונים Neon (נדרשת סיסמת מנהל).');
        } else {
          setDbStatus('connected');
        }
      })
      .catch((e) => {
        console.error('Network error saving to Neon DB:', e);
      });

    return newItem;
  };

  const addItems = (newItemsData: Array<Omit<TimelineItem, 'id' | 'createdAt'>>): TimelineItem[] => {
    const createdItems: TimelineItem[] = newItemsData.map((data, index) => {
      const rawItem: TimelineItem = {
        ...data,
        id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now() + index,
      };
      return sanitizeItemTradition(rawItem);
    });
    setItems((prev) => [...createdItems, ...prev]);

    // Clear active filters so newly added items are immediately visible
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
    if (createdItems.length > 0) {
      setSelectedItem(createdItems[0]);
    }

    // Persist batch directly to Neon DB
    fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminToken || getEffectiveAdminPassword(),
      },
      body: JSON.stringify(createdItems),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to save batch items to Neon DB:', err);
          alert(err.error || 'שגיאה בשמירת הפריטים למסד הנתונים Neon (נדרשת סיסמת מנהל).');
        } else {
          setDbStatus('connected');
        }
      })
      .catch((e) => console.error('Background batch sync failed:', e));

    return createdItems;
  };

  const updateItem = (id: string, updates: Partial<TimelineItem>) => {
    let updatedItem: TimelineItem | null = null;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = sanitizeItemTradition({ ...item, ...updates });
          return updatedItem;
        }
        return item;
      })
    );
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? sanitizeItemTradition({ ...prev, ...updates }) : null));
    }

    // Persist update directly to Neon DB
    if (updatedItem) {
      fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken || getEffectiveAdminPassword(),
        },
        body: JSON.stringify(updatedItem),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('Failed to update item in Neon DB:', err);
            alert(err.error || 'שגיאה בעדכון הפריט במסד הנתונים Neon (נדרשת סיסמת מנהל).');
          } else {
            setDbStatus('connected');
          }
        })
        .catch((e) => console.error('Background update sync failed:', e));
    }
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }

    // Persist deletion directly to Neon DB
    fetch(`/api/items?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminToken || getEffectiveAdminPassword(),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Failed to delete item from Neon DB:', err);
          alert(err.error || 'שגיאה במחיקת הפריט ממסד הנתונים Neon (נדרשת סיסמת מנהל).');
        } else {
          setDbStatus('connected');
        }
      })
      .catch((e) => console.error('Background delete sync failed:', e));
  };

  const resetToDefault = () => {
    const defaultSanitized = SEED_TIMELINE_ITEMS.map(sanitizeItemTradition);
    setItems(defaultSanitized);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSelectedItem(null);

    // Push the default items to Neon DB
    fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminToken || getEffectiveAdminPassword(),
      },
      body: JSON.stringify(defaultSanitized),
    }).catch((e) => console.error('Failed to reset Neon DB items:', e));
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `timeline_items_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'הקובץ אינו מכיל מערך תקין של פריטים' };
      }
      // Simple validation
      const valid = parsed.every(
        (i) => i.id && i.title && typeof i.startYear === 'number' && i.type
      );
      if (!valid) {
        return { success: false, error: 'חלק מהפריטים בקובץ חסרים שדות חובה (כותרת, שנה, סוג)' };
      }
      const newItems = parsed.map(sanitizeItemTradition);
      setItems(newItems);
      if (dbStatus === 'connected') {
        fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': adminToken,
          },
          body: JSON.stringify(newItems),
        }).catch((e) => console.warn('Import cloud sync failed:', e));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'שגיאה בפענוח קובץ ה-JSON: קובץ לא תקין' };
    }
  };

  return (
    <TimelineContext.Provider
      value={{
        items,
        filteredItems,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedType,
        setSelectedType,
        selectedItem,
        setSelectedItem,
        editingItem,
        setEditingItem,
        isAddModalOpen,
        setIsAddModalOpen,
        isAIModalOpen,
        setIsAIModalOpen,
        aiInitialPrompt,
        setAiInitialPrompt,
        aiTargetItem,
        setAiTargetItem,
        openAIWithPrompt,
        targetJumpYear,
        jumpToYear,
        addItem,
        addItems,
        updateItem,
        deleteItem,
        resetToDefault,
        showHebrewYearsOnRuler,
        setShowHebrewYearsOnRuler,
        exportJSON,
        importJSON,
        dbStatus,
        isSyncing,
        isDbModalOpen,
        setIsDbModalOpen,
        syncWithDatabase,
        pushAllToDatabase,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        isAdminModalOpen,
        setIsAdminModalOpen,
        adminModalMessage,
        setAdminModalMessage,
        requireAdmin,
        currentTheme,
        setCurrentTheme,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelineStore = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineStore must be used within a TimelineProvider');
  }
  return context;
};
