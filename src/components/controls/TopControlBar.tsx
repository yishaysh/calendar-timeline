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
  Menu,
  SlidersHorizontal,
  ShieldCheck,
  Lock,
  Maximize,
  Minimize,
  Tv,
  Palette,
} from 'lucide-react';
import { THEME_CONFIGS } from '../../store/TimelineContext';

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
    isAdmin,
    setIsAdminModalOpen,
    setAdminModalMessage,
    requireAdmin,
    currentTheme,
    setCurrentTheme,
  } = useTimelineStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [jumpYearInput, setJumpYearInput] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' && Boolean(document.fullscreenElement);
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Track native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Close search and theme dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
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
      <div ref={searchRef} className="relative flex-1 min-w-[140px] max-w-xs sm:max-w-sm">
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
            placeholder="חיפוש אירוע, אישיות או שנה..."
            className="w-full bg-slateTheme-950/80 border border-slate-700/80 focus:border-amber-400 rounded-xl py-1.5 pr-8 pl-7 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
          />
          <Search className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute left-2 text-slate-400 hover:text-slate-200"
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

      {/* 3. Entity Type Filters (Pills) - Visible on ultrawide monitors */}
      <div className="hidden min-[1680px]:flex items-center gap-1 bg-slateTheme-950/60 p-1 rounded-xl border border-slate-800 shrink-0">
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

      {/* Left-hand Controls Cluster: Hebrew Ruler, Zoom, DB Status, Admin, Data Management */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pl-1 sm:pl-2">
        {/* Toggle Switch for Hebrew Years on Ruler */}
        <button
          id="toggle-hebrew-ruler-btn"
          type="button"
          onClick={() => setShowHebrewYearsOnRuler(!showHebrewYearsOnRuler)}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            showHebrewYearsOnRuler
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-glow-gold'
              : 'bg-slate-950/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
          }`}
          title={
            showHebrewYearsOnRuler
              ? 'שנים עבריות מוצגות על השנתות (לחץ להסרה)'
              : 'לחץ להצגת שנים עבריות על שנתות ציר הזמן'
          }
        >
          <BookOpen className={`w-3.5 h-3.5 ${showHebrewYearsOnRuler ? 'text-amber-300' : 'text-slate-500'}`} />
          <span className="text-[11px]">שנים עבריות</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
              showHebrewYearsOnRuler
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {showHebrewYearsOnRuler ? 'פעיל' : 'כבוי'}
          </span>
        </button>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-0.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            id="btn-zoom-in"
            onClick={onZoomIn}
            title="זום פנימה (+)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={onZoomOut}
            title="זום החוצה (-)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-reset-view"
            onClick={onResetView}
            title="איפוס תצוגה (כל 6000 השנים)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fullscreen / TV Presentation Mode Toggle */}
        <button
          id="btn-toggle-fullscreen"
          type="button"
          onClick={handleToggleFullscreen}
          title={
            isFullscreen
              ? 'יציאה ממסך מלא (Esc)'
              : 'מצב מסך מלא (מומלץ במיוחד לחיבור לטלוויזיה ומצגות)'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            isFullscreen
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-glow-cyan'
              : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
          }`}
        >
          {isFullscreen ? (
            <Minimize className="w-3.5 h-3.5 text-cyan-300" />
          ) : (
            <Maximize className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="hidden xl:inline">{isFullscreen ? 'צא ממסך מלא' : 'מסך מלא ⛶'}</span>
        </button>

        {/* Neon Serverless Postgres Status & Config Button */}
        <button
          id="btn-open-neon-db"
          onClick={() => setIsDbModalOpen(true)}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
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
          <span className="text-[11px]">Neon</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wide flex items-center gap-1 ${
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

        {/* Quick Theme Switcher Button & Dropdown */}
        <div ref={themeMenuRef} className="relative shrink-0">
          <button
            id="btn-theme-switcher"
            type="button"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 bg-slate-950/80 border-slate-700/80 text-slate-200 hover:border-amber-400 hover:text-white"
            title="החלפת ערכת נושא (עיצוב האתר)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {(THEME_CONFIGS.find((t) => t.id === currentTheme) || THEME_CONFIGS[0]).name}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
              style={{
                backgroundColor: (THEME_CONFIGS.find((t) => t.id === currentTheme) || THEME_CONFIGS[0]).accentColor,
              }}
            />
          </button>

          {showThemeMenu && (
            <div
              dir="rtl"
              className="absolute left-0 mt-2 w-72 max-h-[85vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5 animate-fadeIn"
            >
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>בחר ערכת נושא:</span>
                <span className="text-[10px] text-amber-400">1-קליק להחלפה</span>
              </div>
              {THEME_CONFIGS.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCurrentTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <div>
                        <div>{t.name}</div>
                        <div className="text-[10px] font-normal text-slate-400">{t.subtitle}</div>
                      </div>
                    </div>
                    {isSelected && <span className="text-amber-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Mode Status & Unlock Button */}
        <button
          id="btn-admin-status"
          onClick={() => {
            if (!isAdmin) {
              setAdminModalMessage('כניסת מנהל מערכת לפתיחת הרשאות עריכה, הוספה ומחיקה בציר הזמן');
            }
            setIsAdminModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            isAdmin
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-glow-gold hover:bg-amber-500/30'
              : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-slate-100 hover:border-slate-500'
          }`}
          title={
            isAdmin
              ? 'מנהל מערכת מחובר (לחץ לניהול סיסמה או יציאה)'
              : 'מצב צפייה בלבד (לחץ לכניסת מנהל ועריכת נתונים)'
          }
        >
          {isAdmin ? (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wide ${
              isAdmin
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isAdmin ? 'מנהל 👑' : 'צפייה 🔒'}
          </span>
        </button>

        {/* Data Management (Export, Import, Reset) */}
        <div className="hidden sm:flex items-center gap-0.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            id="btn-export-json"
            onClick={exportJSON}
            title="ייצוא נתונים (JSON)"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-import-json"
            onClick={() => {
              requireAdmin(() => {
                fileInputRef.current?.click();
              }, 'ייבוא נתונים מקובץ חיצוני מוגבל למנהל מערכת בלבד.');
            }}
            title={isAdmin ? "ייבוא נתונים מקובץ JSON" : "ייבוא נתונים (מוגן - נדרש מנהל)"}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-sky-400 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
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
              requireAdmin(() => {
                if (window.confirm('האם לאפס את כל הנתונים לנתוני ברירת המחדל ההיסטוריים?')) {
                  resetToDefault();
                }
              }, 'איפוס נתוני ציר הזמן מוגבל למנהל מערכת בלבד.');
            }}
            title={isAdmin ? "שחזור נתוני ברירת מחדל" : "שחזור נתונים (מוגן - נדרש מנהל)"}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          id="btn-mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors relative"
          title="תפריט כלים ומסננים"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {dbStatus === 'connected' && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div
          dir="rtl"
          className="lg:hidden absolute top-16 right-0 left-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/80 p-4 shadow-2xl z-40 space-y-4 max-h-[80vh] overflow-y-auto animate-slide-down"
        >
          {/* Mobile Jump to Year */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">קפיצה מהירה לשנה:</label>
            <form onSubmit={(e) => { handleJumpSubmit(e); setIsMobileMenuOpen(false); }} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="6000"
                value={jumpYearInput}
                onChange={(e) => setJumpYearInput(e.target.value)}
                placeholder="הזן שנה (1 עד 6000)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-4 py-2 rounded-xl font-bold transition-colors"
              >
                קפוץ
              </button>
            </form>
          </div>

          {/* Mobile Entity Filters */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">סינון לפי סוג:</label>
            <div className="grid grid-cols-4 gap-1.5">
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
                    onClick={() => {
                      setSelectedType(btn.id as FilterType);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Categories Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">סינון לפי קטגוריה:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">כל הקטגוריות</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Hebrew Years on Ruler */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>הצגת שנים עבריות על השנתות</span>
            </div>
            <button
              onClick={() => setShowHebrewYearsOnRuler(!showHebrewYearsOnRuler)}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                showHebrewYearsOnRuler
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {showHebrewYearsOnRuler ? 'פעיל' : 'כבוי'}
            </button>
          </div>

          {/* Mobile Admin Permissions Row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <span>הרשאות עריכה (מנהל):</span>
            </div>
            <button
              onClick={() => {
                if (!isAdmin) {
                  setAdminModalMessage('כניסת מנהל מערכת לפתיחת הרשאות עריכה, הוספה ומחיקה');
                }
                setIsAdminModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isAdmin ? 'מנהל פעיל 👑' : 'כניסת מנהל 🔒'}
            </button>
          </div>

          {/* Mobile Theme Selection Row */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>ערכת נושא לעיצוב האתר:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {THEME_CONFIGS.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTheme(t.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-black shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full mb-1 border border-white/20"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span className="text-[10px] leading-tight">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Fullscreen / TV Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>מסך מלא (לטלוויזיה ומצגות)</span>
            </div>
            <button
              onClick={() => {
                handleToggleFullscreen();
                setIsMobileMenuOpen(false);
              }}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                isFullscreen
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              {isFullscreen ? 'יציאה ממסך מלא' : 'מסך מלא ⛶'}
            </button>
          </div>

          {/* Mobile Neon DB & Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsDbModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              <Database className={`w-4 h-4 ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Neon DB: {dbStatus === 'connected' ? 'מחובר 🟢' : 'מקומי ⚪'}</span>
            </button>

            <button
              onClick={() => {
                exportJSON();
                setIsMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400"
              title="ייצוא נתונים (פתוח לכולם)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                requireAdmin(() => {
                  fileInputRef.current?.click();
                  setIsMobileMenuOpen(false);
                }, 'ייבוא נתונים מקובץ חיצוני מוגבל למנהל בלבד.');
              }}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-sky-400"
              title={isAdmin ? "ייבוא נתונים" : "ייבוא נתונים (מוגן)"}
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                requireAdmin(() => {
                  if (window.confirm('האם לאפס את כל הנתונים לברירת מחדל?')) {
                    resetToDefault();
                    setIsMobileMenuOpen(false);
                  }
                }, 'איפוס נתוני ציר הזמן מוגבל למנהל בלבד.');
              }}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400"
              title={isAdmin ? "איפוס נתונים" : "איפוס נתונים (מוגן)"}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
