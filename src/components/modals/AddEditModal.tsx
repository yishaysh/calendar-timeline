import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { EntityType, ExternalLink } from '../../types/timeline';
import {
  hebrewToGregorian,
  gregorianToHebrew,
} from '../../engine/calendarMath';
import { toHebrewYearString } from '../../engine/gematria';
import { X, Calendar, Plus, Trash2, Image, Link, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  '#eab308', // Gold
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
  '#64748b', // Slate
];

export const AddEditModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingItem,
    setEditingItem,
    categories,
    addItem,
    updateItem,
    jumpToYear,
    isAdmin,
    requireAdmin,
  } = useTimelineStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntityType>('event');
  const [category, setCategory] = useState('היסטוריה');
  const [customCategory, setCustomCategory] = useState('');
  const [importance, setImportance] = useState<1 | 2 | 3 | 4>(2);
  const [startYear, setStartYear] = useState<number>(3760);
  const [endYear, setEndYear] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [color, setColor] = useState('#eab308');
  const [tradition, setTradition] = useState<'jewish' | 'general'>('jewish');

  // Dual-Date Converter Helpers (for startYear)
  const [gregYearInput, setGregYearInput] = useState<number>(1);
  const [gregEraInput, setGregEraInput] = useState<'BCE' | 'CE'>('BCE');

  // Dual-Date Converter Helpers (for endYear / death year)
  const [gregEndYearInput, setGregEndYearInput] = useState<number | ''>('');
  const [gregEndEraInput, setGregEndEraInput] = useState<'BCE' | 'CE'>('CE');

  // Prefill when editing
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setType(editingItem.type);
      setCategory(editingItem.category);
      setImportance(editingItem.importance);
      setStartYear(editingItem.startYear);
      setEndYear(editingItem.endYear);
      setDescription(editingItem.description);
      setImageUrl(editingItem.imageUrl || '');
      setTagsStr(editingItem.tags.join(', '));
      setLinks(editingItem.links || []);
      setColor(editingItem.color || '#eab308');
      setTradition(editingItem.tradition || 'jewish');

      const greg = hebrewToGregorian(editingItem.startYear);
      setGregYearInput(greg.year);
      setGregEraInput(greg.era);

      if (editingItem.endYear) {
        const gregEnd = hebrewToGregorian(editingItem.endYear);
        setGregEndYearInput(gregEnd.year);
        setGregEndEraInput(gregEnd.era);
      } else {
        setGregEndYearInput('');
        setGregEndEraInput(greg.era === 'BCE' ? 'BCE' : 'CE');
      }
    } else {
      // Default new item values
      setTitle('');
      setType('event');
      setCategory(categories[0] || 'היסטוריה');
      setCustomCategory('');
      setImportance(2);
      setStartYear(3760);
      setEndYear(undefined);
      setDescription('');
      setImageUrl('');
      setTagsStr('');
      setLinks([]);
      setColor('#eab308');
      setTradition('jewish');

      const greg = hebrewToGregorian(3760);
      setGregYearInput(greg.year);
      setGregEraInput(greg.era);

      setGregEndYearInput('');
      setGregEndEraInput('CE');
    }
  }, [editingItem, categories, isAddModalOpen]);

  // Sync Gregorian inputs when Hebrew startYear changes
  const handleHebrewYearChange = (val: number) => {
    const clamped = Math.max(1, Math.min(6000, val));
    setStartYear(clamped);
    const greg = hebrewToGregorian(clamped);
    setGregYearInput(greg.year);
    setGregEraInput(greg.era);
  };

  // Sync Hebrew startYear when Gregorian inputs change
  const handleGregorianChange = (year: number, era: 'BCE' | 'CE') => {
    setGregYearInput(year);
    setGregEraInput(era);
    const heb = gregorianToHebrew(year, era);
    setStartYear(heb);
  };

  // Sync Gregorian inputs when Hebrew endYear changes
  const handleHebrewEndYearChange = (val: number | '') => {
    if (val === '' || isNaN(val as number) || (val as number) <= 0) {
      setEndYear(undefined);
      setGregEndYearInput('');
    } else {
      const clamped = Math.max(1, Math.min(6000, val as number));
      setEndYear(clamped);
      const greg = hebrewToGregorian(clamped);
      setGregEndYearInput(greg.year);
      setGregEndEraInput(greg.era);
    }
  };

  // Sync Hebrew endYear when Gregorian endYear inputs change
  const handleGregorianEndYearChange = (year: number | '', era: 'BCE' | 'CE') => {
    setGregEndYearInput(year);
    setGregEndEraInput(era);
    if (year === '' || isNaN(year as number) || (year as number) <= 0) {
      setEndYear(undefined);
    } else {
      const heb = gregorianToHebrew(year as number, era);
      setEndYear(heb);
    }
  };

  const handleTypeChange = (newType: EntityType) => {
    setType(newType);
    if (newType === 'period') {
      if (!endYear || endYear <= startYear) {
        const newEnd = Math.min(6000, startYear + 50);
        setEndYear(newEnd);
        const gregEnd = hebrewToGregorian(newEnd);
        setGregEndYearInput(gregEnd.year);
        setGregEndEraInput(gregEnd.era);
      }
      if (importance > 2) setImportance(2);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleLinkChange = (idx: number, field: 'label' | 'url', value: string) => {
    const updated = [...links];
    updated[idx] = { ...updated[idx], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      requireAdmin(() => {}, 'שמירה או עדכון של פריטים בציר הזמן דורשים הרשאת מנהל.');
      return;
    }

    if (!title.trim()) {
      alert('נא להזין כותרת');
      return;
    }

    const finalCategory = customCategory.trim() ? customCategory.trim() : category;
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const validLinks = links
      .filter((l) => l.url.trim().length > 0)
      .map((l) => {
        const raw = l.url.trim();
        const url = raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')
          ? raw
          : `https://${raw}`;
        return { label: l.label.trim() || raw, url };
      });

    const finalEndYear =
      typeof gregEndYearInput === 'number' && gregEndYearInput > 0
        ? gregorianToHebrew(gregEndYearInput, gregEndEraInput)
        : endYear;

    if (type === 'period' && (!finalEndYear || finalEndYear <= startYear)) {
      alert('עבור תקופה, שנת הסיום חייבת להיות גדולה משנת ההתחלה');
      return;
    }

    const resolvedEndYear =
      type === 'period' || (type === 'person' && finalEndYear) ? finalEndYear : undefined;

    if (editingItem) {
      updateItem(editingItem.id, {
        title: title.trim(),
        type,
        category: finalCategory,
        importance,
        startYear,
        endYear: resolvedEndYear,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        tags,
        links: validLinks,
        color,
        tradition,
      });
      jumpToYear(startYear);
    } else {
      addItem({
        title: title.trim(),
        type,
        category: finalCategory,
        importance,
        startYear,
        endYear: resolvedEndYear,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        tags,
        links: validLinks,
        color,
        tradition,
      });
      jumpToYear(startYear);
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  if (!isAddModalOpen) return null;

  return (
    <div
      id="add-edit-modal-backdrop"
      onClick={() => {
        setIsAddModalOpen(false);
        setEditingItem(null);
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="add-edit-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slateTheme-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {editingItem ? 'עריכת פריט בציר הזמן' : 'הוספת פריט חדש לציר הזמן'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingItem(null);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              כותרת הפריט *
            </label>
            <input
              id="input-item-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: יציאת מצרים, הרמב״ם, תקופת בית ראשון..."
              className="w-full bg-slateTheme-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Entity Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              סוג הישות *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'event', label: 'אירוע / ציון דרך' },
                { id: 'period', label: 'תקופה (טווח שנים)' },
                { id: 'person', label: 'אישיות היסטורית' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleTypeChange(t.id as EntityType)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    type === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slateTheme-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tradition / Axis Side Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              מיקום ושיוך לציר הזמן *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTradition('jewish')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tradition === 'jewish'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slateTheme-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>✡️</span>
                <span>מסורת יהודית (מתחת לציר ↓)</span>
              </button>
              <button
                type="button"
                onClick={() => setTradition('general')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tradition === 'general'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-slateTheme-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🌍</span>
                <span>עולם והגות כללית (מעל לציר ↑)</span>
              </button>
            </div>
          </div>

          {/* Dual Date Input Helper Box */}
          <div className="p-3.5 rounded-xl bg-slateTheme-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                מחשבון וסנכרון תאריכים דו-לוחי
              </span>
              <span className="text-[11px] text-slate-400">
                {toHebrewYearString(startYear)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Gregorian Year Input (ראשון) */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  שנה גרגוריאנית (לועזית):
                </label>
                <div className="flex gap-1.5">
                  <input
                    id="input-gregorian-year"
                    type="number"
                    min="1"
                    value={gregYearInput}
                    onChange={(e) =>
                      handleGregorianChange(parseInt(e.target.value, 10) || 1, gregEraInput)
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:outline-none"
                  />
                  <select
                    value={gregEraInput}
                    onChange={(e) =>
                      handleGregorianChange(gregYearInput, e.target.value as 'BCE' | 'CE')
                    }
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="BCE">לפנה"ס</option>
                    <option value="CE">לספירה</option>
                  </select>
                </div>
              </div>

              {/* Hebrew Year Input */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  שנה עברית מקבילה (1 - 6,000 לבריאה):
                </label>
                <input
                  id="input-hebrew-year"
                  type="number"
                  min="1"
                  max="6000"
                  value={startYear}
                  onChange={(e) => handleHebrewYearChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs text-amber-300 font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* End Year / Death Year for Periods or Persons */}
            {(type === 'period' || type === 'person') && (
              <div className="pt-2.5 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    {type === 'period'
                      ? 'שנת סיום התקופה (שנה לועזית / גרגוריאנית) *'
                      : 'שנת פטירה (שנה לועזית / גרגוריאנית):'}
                  </label>
                  {endYear && (
                    <span className="text-[11px] text-amber-300 font-medium">
                      תואם שנה עברית: {toHebrewYearString(endYear)} ({endYear})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gregorian Year Input (לועזית ראשון ובולט) */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {type === 'person' ? 'שנת פטירה לועזית:' : 'שנת סיום לועזית:'}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        id="input-death-gregorian-year"
                        type="number"
                        min="1"
                        value={gregEndYearInput}
                        onChange={(e) =>
                          handleGregorianEndYearChange(
                            e.target.value === '' ? '' : parseInt(e.target.value, 10),
                            gregEndEraInput
                          )
                        }
                        placeholder={type === 'period' ? 'לדוגמה: 70' : 'לדוגמה: 1975, 1204'}
                        className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:outline-none"
                      />
                      <select
                        value={gregEndEraInput}
                        onChange={(e) =>
                          handleGregorianEndYearChange(
                            gregEndYearInput,
                            e.target.value as 'BCE' | 'CE'
                          )
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="CE">לספירה</option>
                        <option value="BCE">לפנה"ס</option>
                      </select>
                    </div>
                  </div>

                  {/* Hebrew Year Input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      שנה עברית מקבילה:
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        id="input-death-hebrew-year"
                        type="number"
                        min="1"
                        max="6000"
                        value={endYear || ''}
                        onChange={(e) =>
                          handleHebrewEndYearChange(
                            e.target.value === '' ? '' : parseInt(e.target.value, 10)
                          )
                        }
                        placeholder={type === 'period' ? 'שנה עברית...' : 'אופציונלי'}
                        className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg p-2 text-xs text-amber-300 font-bold focus:outline-none"
                      />
                      {endYear && (
                        <button
                          type="button"
                          onClick={() => {
                            setEndYear(undefined);
                            setGregEndYearInput('');
                          }}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg text-[10px] transition-colors shrink-0"
                          title="נקה שנת פטירה"
                        >
                          נקה
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {type === 'person' && (
                  <p className="text-[10px] text-slate-400">
                    💡 מזינים ישירות את שנת הפטירה הלועזית (לדוגמה: 1975 עבור חנה ארנדט, 1204 עבור הרמב"ם, 70 לספירה). השנה העברית מחושבת ומסונכרנת אוטומטית.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Category & Importance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                קטגוריה
              </label>
              <div className="flex gap-1.5">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 bg-slateTheme-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="חדש">+ קטגוריה חדשה</option>
                </select>
                {category === 'חדש' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="שם קטגוריה..."
                    className="flex-1 bg-slateTheme-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Importance Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                רמת חשיבות (LOD)
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)}
                className="w-full bg-slateTheme-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={1}>1 - מאקרו (מוצג תמיד בכל מרחק זום)</option>
                <option value={2}>2 - אזורי (מוצג בזום בינוני)</option>
                <option value={3}>3 - ממוקד (מוצג בזום מאות/עשורים)</option>
                <option value={4}>4 - מיקרו (מוצג רק בתקריב שנתי גבוה)</option>
              </select>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              צבע הדגשה
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              תיאור מפורט
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="רקע היסטורי, מקורות, משמעות ופרטים נוספים..."
              className="w-full bg-slateTheme-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Image URL & Thumbnail Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              כתובת תמונה או נתיב מקומי (למשל: /images/image_4.png או קישור רשת)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/image_4.png או https://example.com/image.jpg"
                className="flex-1 bg-slateTheme-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              תגיות (מופרדות בפסיקים)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="תנ״ך, ירושלים, גאולה, מנהיגות..."
              className="w-full bg-slateTheme-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* External Links */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                קישורים חיצוניים ומקורות
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                הוסף קישור
              </button>
            </div>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                    placeholder="תווית (למשל: ויקיפדיה)"
                    className="w-1/3 bg-slateTheme-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slateTheme-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-glow-gold transition-all"
            >
              {editingItem ? 'שמור שינויים' : 'הוסף לציר הזמן'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
