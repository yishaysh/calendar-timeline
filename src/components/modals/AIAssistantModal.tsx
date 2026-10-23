import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import {
  processNaturalLanguageWithAI,
  AICommandResult,
  AIItemPayload,
  DEFAULT_GEMINI_API_KEY,
} from '../../engine/aiAssistant';
import { toHebrewYearString } from '../../engine/gematria';
import { hebrewToGregorian } from '../../engine/calendarMath';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Trash2,
  Edit3,
  PlusCircle,
  Key,
  Globe,
  BookOpen,
  Calendar,
  User,
  Layers,
  ListPlus,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const {
    items,
    isAIModalOpen,
    setIsAIModalOpen,
    aiInitialPrompt,
    aiTargetItem,
    addItem,
    addItems,
    updateItem,
    deleteItem,
    jumpToYear,
  } = useTimelineStore();

  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_API_KEY);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AICommandResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bulk items preview state (allows user to review general overview, toggle tradition, or remove)
  const [previewItems, setPreviewItems] = useState<AIItemPayload[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);

  // Editable fields in manual form mode (for single item tweak or update)
  const [editTitle, setEditTitle] = useState('');
  const [editStartYear, setEditStartYear] = useState<number>(5700);
  const [editEndYear, setEditEndYear] = useState<number | undefined>(undefined);
  const [editTradition, setEditTradition] = useState<'jewish' | 'general'>('jewish');
  const [editType, setEditType] = useState<'person' | 'event' | 'period'>('event');

  // Load initial prompt if opened from a specific item
  useEffect(() => {
    if (isAIModalOpen) {
      if (aiInitialPrompt) {
        setPrompt(aiInitialPrompt);
      } else if (aiTargetItem) {
        setPrompt(`עדכן את ${aiTargetItem.title}: `);
      } else {
        setPrompt('');
      }
      setResult(null);
      setPreviewItems([]);
      setShowManualForm(false);
      setSuccessMessage(null);
    }
  }, [isAIModalOpen, aiInitialPrompt, aiTargetItem]);

  // Sync preview fields when result arrives
  useEffect(() => {
    if (result) {
      if (result.action === 'bulk_create' && result.bulkItems) {
        setPreviewItems(result.bulkItems);
        setShowManualForm(false);
      } else if (result.itemData) {
        setPreviewItems(result.bulkItems && result.bulkItems.length > 0 ? result.bulkItems : [result.itemData]);
        setEditTitle(result.itemData.title);
        setEditStartYear(result.itemData.startYear);
        setEditEndYear(result.itemData.endYear);
        setEditTradition(result.itemData.tradition);
        setEditType(result.itemData.type);
        setShowManualForm(false);
      }
    }
  }, [result]);

  if (!isAIModalOpen) return null;

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || prompt).trim();
    if (!text) return;

    setIsLoading(true);
    setResult(null);
    setPreviewItems([]);
    setSuccessMessage(null);

    try {
      const parsed = await processNaturalLanguageWithAI(text, items, apiKey);
      setResult(parsed);
    } catch (e) {
      console.error('Failed to parse AI prompt', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItemTradition = (index: number) => {
    setPreviewItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newTradition = item.tradition === 'jewish' ? 'general' : 'jewish';
        return {
          ...item,
          tradition: newTradition,
          color: newTradition === 'jewish'
            ? item.type === 'person' ? '#f59e0b' : item.type === 'period' ? '#06b6d4' : '#3b82f6'
            : item.type === 'person' ? '#818cf8' : item.type === 'period' ? '#10b981' : '#a855f7',
        };
      })
    );
  };

  const handleRemovePreviewItem = (index: number) => {
    setPreviewItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecute = () => {
    if (!result) return;

    if (result.action === 'delete' && result.targetItemId) {
      deleteItem(result.targetItemId);
      setSuccessMessage(`הפריט "${result.itemData?.title}" נמחק בהצלחה מציר הזמן.`);
      setTimeout(() => {
        setIsAIModalOpen(false);
      }, 1400);
      return;
    }

    if (result.action === 'update' && result.targetItemId && result.itemData) {
      const updates = {
        ...result.itemData,
        title: editTitle,
        startYear: editStartYear,
        endYear: editEndYear,
        tradition: editTradition,
        type: editType,
        importance: (editType === 'period' ? 1 : (result.itemData.importance || 2)) as 1 | 2 | 3 | 4,
        links: result.itemData.links || [],
      };
      updateItem(result.targetItemId, updates);
      jumpToYear(editStartYear);
      setSuccessMessage(`הפריט "${editTitle}" עודכן בהצלחה! ציר הזמן נע אל שנת ${editStartYear}.`);
      setTimeout(() => {
        setIsAIModalOpen(false);
      }, 1400);
      return;
    }

    // Bulk creation or general overview creation
    if (previewItems.length > 0) {
      const newItemsToCreate = previewItems.map((pi) => ({
        ...pi,
        importance: (pi.type === 'period' ? 1 : (pi.importance || 2)) as 1 | 2 | 3 | 4,
        links: pi.links || [],
      }));

      addItems(newItemsToCreate);
      const jumpYear = newItemsToCreate[0].startYear;
      jumpToYear(jumpYear);

      const msg = newItemsToCreate.length === 1
        ? `הפריט "${newItemsToCreate[0].title}" נוסף בהצלחה לציר הזמן!`
        : `${newItemsToCreate.length} פריטים היסטוריים נוספו בהצלחה בבת אחת לציר הזמן!`;

      setSuccessMessage(msg);
      setTimeout(() => {
        setIsAIModalOpen(false);
      }, 1400);
      return;
    }

    // Fallback if previewItems was empty
    if (result.action === 'create' && result.itemData) {
      const newItemData = {
        ...result.itemData,
        title: editTitle,
        startYear: editStartYear,
        endYear: editEndYear,
        tradition: editTradition,
        type: editType,
        importance: (editType === 'period' ? 1 : (result.itemData.importance || 2)) as 1 | 2 | 3 | 4,
        links: result.itemData.links || [],
      };
      addItem(newItemData);
      jumpToYear(editStartYear);
      setSuccessMessage(`הפריט "${editTitle}" נוסף בהצלחה לציר הזמן!`);
      setTimeout(() => {
        setIsAIModalOpen(false);
      }, 1400);
    }
  };

  const quickPrompts = [
    'הוסף את תקופת התנאים בשנים שהם היו',
    'הוסף רשימה: תקופת התנאים (10-220 לספירה), רבי עקיבא (50-135 לספירה), חורבן בית המקדש השני בשנת 70 לספירה',
    'הוסף את תקופת הראשונים, רש"י (1040-1105), והרמב"ם (1138-1204)',
    'הוסף את שפינוזה (1632-1677), דקארט (1596-1650), ועמנואל קאנט (1724-1804)',
    'הוסף את גירוש ספרד בשנת רנ"ב (1492)',
    'הוסף תקופה: השואה בין השנים 1939 ל-1945',
  ];

  const gematriaPreview = toHebrewYearString(editStartYear);
  const gregPreview = hebrewToGregorian(editStartYear);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsAIModalOpen(false)}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slateTheme-900 border border-slate-700/80 shadow-2xl p-5 sm:p-7 text-slate-100 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-cyan-400 p-0.5 shadow-glow-gold flex items-center justify-center">
              <div className="w-full h-full bg-slateTheme-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-cyan-300">
                עוזר AI חכם לציר הזמן
              </h3>
              <p className="text-xs text-slate-400">
                הוספה בודדת או מרוכזת של ערכים, תקופות ואישים היסטוריים בשפה חופשית
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Engine Badge & API Key Toggle */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              {apiKey.trim() ? (
                <span className="text-cyan-300 font-semibold">מחובר למנוע Google Gemini AI</span>
              ) : (
                <span className="text-amber-300 font-semibold">מנוע NLP מקומי חכם (אופליין מלא, כולל פענוח מרובה ערכים ותקופות)</span>
              )}
            </span>
          </div>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            {showKeyInput ? 'הסתר הגדרות מפתח' : 'מפתח Gemini API (אופציונלי)'}
          </button>
        </div>

        {/* API Key Input Drawer */}
        {showKeyInput && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>הזן מפתח Google Gemini API (נשמר מקומית בדפדפן בלבד):</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline text-[11px]"
              >
                קבל מפתח חינמי ב-Google AI Studio ↗
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              {apiKey && (
                <button
                  onClick={() => handleSaveApiKey('')}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-900/60"
                >
                  נקה מפתח
                </button>
              )}
            </div>
            {apiKey && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 leading-relaxed flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span>מפתח ה-API מוגדר ומופעל. המערכת מחוברת ישירות למודל העדכני של Google Gemini (Flash) עם מנוע ה-NLP הפנימי לגיבוי מלא.</span>
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              * גם ללא מפתח כלל, המערכת כוללת מנוע שפה טבעית פנימי מלא שמפענח תאריכים, גימטריות, רשימות וטקסט חופשי מרובה פריטים.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>טקסט חופשי להוספה או עריכה בציר הזמן (ניתן להזין פסקה שלמה או כמה ערכים בבת אחת):</span>
            <span className="text-[11px] text-slate-400 font-normal">תומך ברשימות, שורות מרובות או משפטים מחוברים</span>
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="כתוב בשפה פשוטה וחופשית. לדוגמה:
'הוסף את תקופת התנאים בשנים שהם היו'
או רשימה שלמה:
'תקופת התנאים
רבי עקיבא (50 עד 135 לספירה)
חורבן בית המקדש השני (70 לספירה)
ברוך שפינוזה (1632-1677)'"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-y min-h-[96px]"
            />
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 hidden sm:inline">Ctrl+Enter להפעלה מהירה</span>
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    מפענח טקסט...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 rotate-180" />
                    פענח ובצע
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        {!result && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              דוגמאות מוכנות לניסוי מהיר (לחץ להפעלה):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(qp);
                    handleAnalyze(qp);
                  }}
                  className="text-right text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-amber-200 border border-slate-700/50 transition-colors"
                >
                  ✨ {qp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Parsed Result Preview */}
        {result && (
          <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-700 shadow-inner animate-fadeIn">
            {/* Action & Source Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                {result.action === 'bulk_create' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/70 px-3 py-1 rounded-full border border-cyan-500/40">
                    <ListPlus className="w-4 h-4 text-cyan-400" />
                    הוספה מרוכזת: {previewItems.length} פריטים זוהו בבת אחת
                  </span>
                )}
                {result.action === 'create' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/40">
                    <PlusCircle className="w-3.5 h-3.5" />
                    פעולה: הוספת פריט חדש
                  </span>
                )}
                {result.action === 'update' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-500/40">
                    <Edit3 className="w-3.5 h-3.5" />
                    פעולה: עדכון פריט קיים
                  </span>
                )}
                {result.action === 'delete' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/70 px-3 py-1 rounded-full border border-rose-500/40">
                    <Trash2 className="w-3.5 h-3.5" />
                    פעולה: מחיקת פריט
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                מנוע: {result.source === 'gemini' ? 'Google Gemini AI' : 'Smart NLP Engine'}
              </span>
            </div>

            {/* Explanation */}
            <p className="text-xs text-amber-200/90 font-medium bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
              💡 {result.explanation}
            </p>

            {/* GENERAL OVERVIEW PREVIEW (תצוגה מקדימה כללית של מה שהובן ומה הולך להכנס) */}
            {result.action !== 'delete' && previewItems.length > 0 && !showManualForm && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                  <span className="font-bold flex items-center gap-1.5 text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    תצוגה מקדימה כללית של הפריטים שיוזנו לציר הזמן:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    לחץ על מיקום בציר לשינוי מהיר (יהדות / כללי)
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {previewItems.map((item, idx) => {
                    const startG = hebrewToGregorian(item.startYear);
                    const endG = item.endYear ? hebrewToGregorian(item.endYear) : null;
                    const startHeb = toHebrewYearString(item.startYear);
                    const endHeb = item.endYear ? toHebrewYearString(item.endYear) : '';

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
                      >
                        {/* Title & Type badge */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-400 mt-1 shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-100 truncate">
                                {item.title}
                              </span>
                              {/* Type Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                                  item.type === 'period'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                    : item.type === 'person'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                    : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                                }`}
                              >
                                {item.type === 'period' && <Layers className="w-3 h-3" />}
                                {item.type === 'person' && <User className="w-3 h-3" />}
                                {item.type === 'event' && <Calendar className="w-3 h-3" />}
                                {item.type === 'period' ? 'תקופה רציפה (Lane)' : item.type === 'person' ? 'אישיות' : 'אירוע'}
                              </span>
                            </div>

                            {/* Description / Summary */}
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {item.description || item.category}
                            </p>
                          </div>
                        </div>

                        {/* Years & Tradition Controls */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                          {/* Years display */}
                          <div className="text-[11px] bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-right">
                            <div className="font-bold text-cyan-300">
                              {endG ? `${startG.formatted} - ${endG.formatted}` : startG.formatted}
                            </div>
                            <div className="text-[10px] text-amber-300/80">
                              {endHeb ? `${startHeb} - ${endHeb}` : `${startHeb} (${item.startYear})`}
                              {item.type === 'period' && item.endYear && (
                                <span className="text-slate-400 mr-1">({item.endYear - item.startYear} שנה)</span>
                              )}
                            </div>
                          </div>

                          {/* Quick Tradition Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleItemTradition(idx)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all ${
                              item.tradition === 'jewish'
                                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                                : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                            }`}
                            title="לחץ להחלפה בין מסורת יהודית למסורת כללית"
                          >
                            {item.tradition === 'jewish' ? (
                              <>
                                <BookOpen className="w-3 h-3 text-amber-400" />
                                <span>יהדות ↓</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3 text-indigo-400" />
                                <span>כללי ↑</span>
                              </>
                            )}
                          </button>

                          {/* Quick Remove from bulk */}
                          {previewItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePreviewItem(idx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="הסר פריט זה מרשימת ההוספה"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Manual Detailed Form Toggle (for power users or update actions) */}
            {result.action !== 'delete' && (
              <div className="pt-1">
                {previewItems.length === 1 && (
                  <button
                    type="button"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    {showManualForm ? 'חזור לתצוגה מקדימה כללית' : 'עריכה ידנית מפורטת של השדות (אופציונלי)'}
                    {showManualForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {/* Single Item Manual Form */}
                {(showManualForm || result.action === 'update') && result.itemData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 animate-fadeIn">
                    {/* Title */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        כותרת הפריט:
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Tradition */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        מיקום בציר (מסורת):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditTradition('jewish')}
                          className={`py-1.5 px-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                            editTradition === 'jewish'
                              ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          יהדות (מתחת ↓)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTradition('general')}
                          className={`py-1.5 px-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                            editTradition === 'general'
                              ? 'bg-indigo-950/80 border-indigo-400 text-indigo-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <Globe className="w-3 h-3 text-indigo-400" />
                          כללי (מעל ↑)
                        </button>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        סוג פריט:
                      </label>
                      <select
                        value={editType}
                        onChange={(e) => {
                          const newType = e.target.value as any;
                          setEditType(newType);
                          if (newType === 'period' && !editEndYear) {
                            setEditEndYear(editStartYear + 50);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                      >
                        <option value="person">אישיות / הוגה</option>
                        <option value="event">אירוע היסטורי</option>
                        <option value="period">תקופה רציפה</option>
                      </select>
                    </div>

                    {/* Years Inputs */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          שנת התחלה (עברית):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={6000}
                          value={editStartYear}
                          onChange={(e) => setEditStartYear(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                        />
                        <div className="text-[10px] text-cyan-300 mt-0.5 truncate">
                          {gregPreview.formatted} | {gematriaPreview}
                        </div>
                      </div>

                      {(editType === 'period' || editEndYear !== undefined) && (
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            שנת סיום:
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={6000}
                            value={editEndYear ?? editStartYear + 50}
                            onChange={(e) => setEditEndYear(parseInt(e.target.value, 10) || editStartYear + 1)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                          />
                          <div className="text-[10px] text-cyan-300 mt-0.5 truncate">
                            {editEndYear ? `${hebrewToGregorian(editEndYear).formatted} | ${toHebrewYearString(editEndYear)}` : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setPreviewItems([]);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                בטל וחזור לעריכת הטקסט
              </button>

              <button
                type="button"
                onClick={handleExecute}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-glow-cyan transition-all transform hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                {result.action === 'delete'
                  ? 'אשר מחיקה מהציר'
                  : previewItems.length > 1
                  ? `אשר והוסף את כל ${previewItems.length} הפריטים לציר הזמן בבת אחת`
                  : 'אשר והוסף לציר הזמן'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
