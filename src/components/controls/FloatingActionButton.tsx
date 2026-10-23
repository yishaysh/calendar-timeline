import React from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { Plus, Sparkles } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const { setIsAddModalOpen, setEditingItem, setIsAIModalOpen } = useTimelineStore();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      {/* AI Assistant Button */}
      <button
        id="btn-ai-assistant-fab"
        onClick={() => setIsAIModalOpen(true)}
        title="הוספה ועריכה בשפה חופשית (AI)"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-glow-cyan hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-cyan-200/50 group"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform animate-pulse" />
        <span className="sr-only">עוזר AI</span>
      </button>

      {/* Manual Add Item Button */}
      <button
        id="btn-add-item-fab"
        onClick={handleOpenAdd}
        title="הוספת פריט חדש לציר הזמן (+)"
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-glow-gold hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/50 group"
      >
        <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
        <span className="sr-only">הוסף פריט לציר הזמן</span>
      </button>
    </div>
  );
};
