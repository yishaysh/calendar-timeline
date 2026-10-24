import React from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { Plus, Sparkles, Lock } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const { setIsAddModalOpen, setEditingItem, setIsAIModalOpen, isAdmin, requireAdmin } = useTimelineStore();

  const handleOpenAdd = () => {
    requireAdmin(() => {
      setEditingItem(null);
      setIsAddModalOpen(true);
    }, 'הוספת פריטים חדשים לציר הזמן מוגבלת למנהל מערכת בלבד.');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      {/* AI Assistant Button */}
      <button
        id="btn-ai-assistant-fab"
        onClick={() => setIsAIModalOpen(true)}
        title="מחקר, למידה ועריכה בשפה חופשית (AI)"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-glow-cyan hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-cyan-200/50 group relative"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform animate-pulse" />
        <span className="sr-only">עוזר AI</span>
      </button>

      {/* Manual Add Item Button */}
      <button
        id="btn-add-item-fab"
        onClick={handleOpenAdd}
        title={isAdmin ? 'הוספת פריט חדש לציר הזמן (+)' : 'הוספת פריט (נעול - נדרשת הרשאת מנהל)'}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border-2 active:scale-95 group relative ${
          isAdmin
            ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-glow-gold hover:scale-110 border-white/50'
            : 'bg-slate-800 text-amber-300 border-amber-500/40 shadow-lg hover:border-amber-400 hover:bg-slate-700'
        }`}
      >
        <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
        {!isAdmin && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 border border-slate-900 flex items-center justify-center shadow-md"
            title="נדרשת סיסמת מנהל"
          >
            <Lock className="w-3 h-3 stroke-[2.5]" />
          </span>
        )}
        <span className="sr-only">הוסף פריט לציר הזמן</span>
      </button>
    </div>
  );
};
