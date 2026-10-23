import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { FilterType, TimelineItem } from '../../types/timeline';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Compass,
  X,
  RefreshCw,
  BookOpen,
  Database,
} from 'lucide-react';

interface TopControlBarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const {
    items,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    categories,
    jumpToYear,
    setSelectedItem,
    exportJSON,
    importJSON,
    resetToDefault,
    setIsAIModalOpen,
    showHebrewYearsOnRuler,
    setShowHebrewYearsOnRuler,
    dbStatus,
    isSyncing,
    setIsDbModalOpen,
  } = useTimelineStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [jumpYearInput, setJumpYearInput] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return items
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          String(i.startYear).includes(q)
      )
      .slice(0, 7);
  }, [items, searchQuery]);

  const handleSelectSearchResult = (item: TimelineItem) => {
    jumpToYear(item.startYear);
    setSelectedItem(item);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(jumpYearInput, 10);
    if (!isNaN(year) && year >= 1 && year <= 6000) {
      jumpToYear(year);
      setJumpYearInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJSON(content);
        if (res.success) {
          alert('קובץ הנתונים יובא בהצלחה!');
        } else {
          alert(`שגיאה בייבוא: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header
      id="top-control-bar"
      className="relative z-30 w-full h-16 bg-slateTheme-900/95 backdrop-blur-md border-b border-slate-700/80 px-3 sm:px-5 flex items-center justify-between gap-3 text-slate-100"
    >
      {/* 1. App Title & Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-10 px-2 rounded-xl bg-slate-900 border border-amber-400/40 shadow-glow-gold flex items-center justify-center overflow-hidden">
          <img
            src="/images/LOGO.png"
            alt="חברותא שטייגען"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-sm font-extrabold text-amber-300 tracking-wide flex items-center gap-1.5">
            חברותא שטייגען • תיכון החממה
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            ציר זמן היסטורי עברי-גרגוריאני (6,000 שנה)
          </p>
        </div>
      </div>

      {/* AI Assistant Natural Language Button */}
      <button
        id="btn-open-ai-assistant"
        onClick={() => setIsAIModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-indigo-500/20 to-cyan-500/25 hover:from-amber-500/40 hover:via-indigo-500/35 hover:to-cyan-500/40 border border-amber-400/50 hover:border-amber-300 shadow-glow-gold text-amber-200 hover:text-amber-100 text-xs font-bold transition-all duration-200 group shrink-0"
        title="הוספה ועריכה באמצעות AI בשפה פשוטה"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-125 transition-transform animate-pulse" />
        <span className="hidden sm:inline">עריכה והוספה ב-AI ✨</span>
        <span className="sm:hidden">AI ✨</span>
      </button>

      {/* 2. Search Bar with Autocomplete Dropdown */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md">
        <div className="relative flex items-center">
          <input
            id="timeline-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="חיפוש אירוע, אישיות, תקופה או שנה..."
            className="w-full bg-slateTheme-950/80 border border-slate-700/80 focus:border-amber-400 rounded-xl py-1.5 pr-9 pl-8 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
          />
          <Search className="absolute right-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute left-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown Menu */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-10 right-0 left-0 bg-slateTheme-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
            {searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectSearchResult(item)}
                className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-right transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color || '#eab308' }}
                    />
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.category} • שנה {item.startYear}
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                  קפוץ לפריט
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Entity Type Filters (Pills) */}
      <div className="hidden xl:flex items-center gap-1 bg-slateTheme-950/60 p-1 rounded-xl border border-slate-800">
        {[
          { id: 'ALL', label: 'הכל', icon: Layers },
          { id: 'period', label: 'תקופות', icon: Compass },
          { id: 'event', label: 'אירועים', icon: Sparkles },
          { id: 'person', label: 'אישים', icon: Users },
        ].map((btn) => {
          const Icon = btn.icon;
          const active = selectedType === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setSelectedType(btn.id as FilterType)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 4. Quick Jump to Year Input */}
      <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1.5">
        <input
          type="number"
          min="1"
          max="6000"
          value={jumpYearInput}
          onChange={(e) => setJumpYearInput(e.target.value)}
          placeholder="שנה (1-6000)"
          className="w-24 bg-slateTheme-950/80 border border-slate-700/80 rounded-lg py-1 px-2 text-xs text-center text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-medium transition-colors"
        >
          קפיצה
        </button>
      </form>

      {/* 5. Toggle Switch for Hebrew Years on Ruler */}
      <button
        id="toggle-hebrew-ruler-btn"
        type="button"
        onClick={() => setShowHebrewYearsOnRuler(!showHebrewYearsOnRuler)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
          showHebrewYearsOnRuler
            ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-glow-gold'
            : 'bg-slate-950/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
        }`}
        title={
          showHebrewYearsOnRuler
            ? 'שנים עבריות מוצגות על השנתות (לחץ להסרה)'
            : 'לחץ להצגת שנים עבריות על שנתות ציר הזמן'
        }
      >
        <BookOpen className={`w-3.5 h-3.5 ${showHebrewYearsOnRuler ? 'text-amber-300' : 'text-slate-500'}`} />
        <span className="hidden sm:inline">שנים עבריות בציר:</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-wide ${
            showHebrewYearsOnRuler
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {showHebrewYearsOnRuler ? 'מוצג' : 'כבוי'}
        </span>
      </button>

      {/* 6. Zoom & View Controls */}
      <div className="flex items-center gap-1">
        <button
          id="btn-zoom-in"
          onClick={onZoomIn}
          title="זום פנימה (+)"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={onZoomOut}
          title="זום החוצה (-)"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-reset-view"
          onClick={onResetView}
          title="איפוס תצוגה (כל 6000 השנים)"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Neon Serverless Postgres Status & Config Button */}
      <button
        id="btn-open-neon-db"
        onClick={() => setIsDbModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
          dbStatus === 'connected'
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-glow-green hover:bg-emerald-500/30'
            : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-slate-100 hover:border-slate-500'
        }`}
        title={
          dbStatus === 'connected'
            ? 'מסד נתונים Neon מחובר ומסונכרן (לחץ לניהול)'
            : 'חיבור למסד נתונים Neon (כרגע במצב מקומי)'
        }
      >
        <Database className={`w-3.5 h-3.5 ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'}`} />
        <span className="hidden sm:inline">Neon DB:</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wide flex items-center gap-1 ${
            dbStatus === 'connected'
              ? 'bg-emerald-500/30 text-emerald-300'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          {dbStatus === 'connected' ? 'מחובר' : 'מקומי'}
        </span>
      </button>

      {/* 6. Data Management (Export, Import, Reset) */}
      <div className="flex items-center gap-1">
        <button
          id="btn-export-json"
          onClick={exportJSON}
          title="ייצוא נתונים (JSON)"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors hidden sm:block"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          id="btn-import-json"
          onClick={() => fileInputRef.current?.click()}
          title="ייבוא נתונים מקובץ JSON"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors hidden sm:block"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          id="btn-reset-seed"
          onClick={() => {
            if (window.confirm('האם לאפס את כל הנתונים לנתוני ברירת המחדל ההיסטוריים?')) {
              resetToDefault();
            }
          }}
          title="שחזור נתוני ברירת מחדל"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
