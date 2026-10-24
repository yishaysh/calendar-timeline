import React, { useEffect } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { formatDualDateRange } from '../../engine/calendarMath';
import {
  X,
  Calendar,
  User,
  Compass,
  Edit3,
  Trash2,
  ExternalLink as LinkIcon,
  Tag,
  Sparkles,
  Lock,
} from 'lucide-react';

export const ItemDetailModal: React.FC = () => {
  const {
    selectedItem,
    setSelectedItem,
    setEditingItem,
    setIsAddModalOpen,
    deleteItem,
    setSearchQuery,
    openAIWithPrompt,
    isAdmin,
    requireAdmin,
  } = useTimelineStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedItem]);

  if (!selectedItem) return null;

  const dualDateStr = formatDualDateRange(selectedItem.startYear, selectedItem.endYear);

  const typeLabels = {
    period: 'תקופה היסטורית',
    event: 'אירוע / ציון דרך',
    person: 'אישיות היסטורית',
  };

  const TypeIcon =
    selectedItem.type === 'period'
      ? Compass
      : selectedItem.type === 'person'
      ? User
      : Calendar;

  const handleEdit = () => {
    requireAdmin(() => {
      setEditingItem(selectedItem);
      setIsAddModalOpen(true);
      setSelectedItem(null);
    }, `עריכת הפריט "${selectedItem.title}" מוגבלת למנהל מערכת בלבד.`);
  };

  const handleDelete = () => {
    requireAdmin(() => {
      if (window.confirm(`האם למחוק את "${selectedItem.title}" מציר הזמן?`)) {
        deleteItem(selectedItem.id);
        setSelectedItem(null);
      }
    }, `מחיקת הפריט "${selectedItem.title}" מוגבלת למנהל מערכת בלבד.`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedItem(null);
  };

  return (
    <div
      id="item-detail-modal-backdrop"
      onClick={() => setSelectedItem(null)}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="item-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slateTheme-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Top Accent Strip */}
        <div
          className="h-2 w-full shrink-0"
          style={{ backgroundColor: selectedItem.color || '#eab308' }}
        />

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-start justify-between gap-4 border-b border-slate-800">
          <div>
            {/* Badges: Type & Category */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20"
                style={{
                  backgroundColor: `${selectedItem.color || '#eab308'}25`,
                  color: selectedItem.color || '#facc15',
                }}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                {typeLabels[selectedItem.type]}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {selectedItem.category}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                רמת חשיבות: {selectedItem.importance}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                selectedItem.tradition === 'general'
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {selectedItem.tradition === 'general' ? '🌍 עולם והגות כללית (מעל הציר)' : '✡️ מסורת יהודית (מתחת לציר)'}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {selectedItem.title}
            </h2>

            {/* Synchronized Dual Date (Gregorian first) */}
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 mt-1">
              {dualDateStr}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedItem(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 flex-1">
          {/* Optional Image Banner */}
          {selectedItem.imageUrl && (
            <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner bg-slate-950">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Full Description */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
            {selectedItem.description}
          </div>

          {/* Tags Section */}
          {selectedItem.tags && selectedItem.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5" />
                תגיות קשורות (לחץ לסינון בציר):
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="text-xs bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 px-2.5 py-1 rounded-lg transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* External Links Section */}
          {selectedItem.links && selectedItem.links.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                <LinkIcon className="w-3.5 h-3.5" />
                מקורות וקישורים חיצוניים:
              </h4>
              <ul className="space-y-1.5">
                {selectedItem.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {link.label || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 bg-slateTheme-950/70 border-t border-slate-800 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              id="btn-modal-edit"
              onClick={handleEdit}
              title={isAdmin ? 'עריכת פריט' : 'עריכה שמורה למנהל מערכת בלבד'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {isAdmin ? <Edit3 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>עריכה</span>
            </button>
            <button
              id="btn-modal-ai-edit"
              onClick={() => {
                requireAdmin(() => {
                  if (selectedItem) {
                    const it = selectedItem;
                    setSelectedItem(null);
                    openAIWithPrompt(`עדכן את ${it.title}: `, it);
                  }
                }, `עריכת פריטים באמצעות AI שמורה למנהל מערכת בלבד.`);
              }}
              title={isAdmin ? 'עריכה חכמה עם AI' : 'עריכת AI שמורה למנהל מערכת בלבד'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-cyan-300 text-xs font-semibold border border-cyan-500/40 shadow-sm transition-colors"
            >
              {isAdmin ? (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>ערוך עם AI ✨</span>
            </button>
            <button
              id="btn-modal-delete"
              onClick={handleDelete}
              title={isAdmin ? 'מחיקת פריט' : 'מחיקה שמורה למנהל מערכת בלבד'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-400 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {isAdmin ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
              <span>מחיקה</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedItem(null)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
