import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { TimelineItem, FilterCategory, FilterType } from '../types/timeline';
import { SEED_TIMELINE_ITEMS } from './seedData';

const STORAGE_KEY = 'timeline_items_chavruta_v3';

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
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

// Known non-Jewish / world philosophers, scientists, and global historical figures
const GENERAL_FIGURE_KEYWORDS = [
  'אפלטון', 'אריסטו', 'סוקרטס', 'אלכסנדר', 'ישו', 'פרויד', 'ארנדט', 'שפינוזה',
  'קאנט', 'דקארט', 'הגל', 'ניטשה', 'הובס', 'לוק', 'רוסו', 'שופנהאואר',
  'מרקס', 'ניוטון', 'גלילאו', 'דרווין', 'גוטנברג', 'קיסר', 'אוגוסטוס',
  'יוון', 'רומא', 'הלניזם'
];

export function sanitizeItemTradition(item: TimelineItem): TimelineItem {
  const textCorpus = `${item.title} ${(item.tags || []).join(' ')} ${item.category || ''}`.toLowerCase();
  const isGeneralFigure = GENERAL_FIGURE_KEYWORDS.some((kw) => textCorpus.includes(kw));

  let tradition: 'jewish' | 'general' = item.tradition || 'jewish';
  if (isGeneralFigure) {
    tradition = 'general';
  }

  // Periods are major horizontal timeline lanes that define the macro structure of history.
  // Always guarantee importance: 1 so they are visible at every zoom level.
  const importance = item.type === 'period' ? 1 : (item.importance || 1);

  return { ...item, tradition, importance };
}

export const TimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<TimelineItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeItemTradition);
        }
      }
    } catch (e) {
      console.error('Failed to load timeline items from localStorage', e);
    }
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
              headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  // Initial DB connection & sync check
  useEffect(() => {
    syncWithDatabase();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist items to localStorage', e);
    }
  }, [items]);

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

    // Asynchronously sync to Neon DB if connected
    if (dbStatus === 'connected') {
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      }).catch((e) => console.warn('Background sync failed:', e));
    }

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

    // Asynchronously sync batch to Neon DB if connected
    if (dbStatus === 'connected') {
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdItems),
      }).catch((e) => console.warn('Background batch sync failed:', e));
    }

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

    if (updatedItem && dbStatus === 'connected') {
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      }).catch((e) => console.warn('Background update sync failed:', e));
    }
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }

    if (dbStatus === 'connected') {
      fetch(`/api/items?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Background delete sync failed:', e));
    }
  };

  const resetToDefault = () => {
    setItems(SEED_TIMELINE_ITEMS.map(sanitizeItemTradition));
    localStorage.removeItem(STORAGE_KEY);
    setSelectedItem(null);
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
          headers: { 'Content-Type': 'application/json' },
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
