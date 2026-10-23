import React from 'react';
import { TimelineProvider } from './store/TimelineContext';
import { TopControlBar } from './components/controls/TopControlBar';
import { TimelineCanvas } from './components/timeline/TimelineCanvas';
import { FloatingActionButton } from './components/controls/FloatingActionButton';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { AddEditModal } from './components/modals/AddEditModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { NeonDatabaseModal } from './components/modals/NeonDatabaseModal';

export const AppContent: React.FC = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col bg-slateTheme-950 overflow-hidden font-sans">
      {/* 1. Top Control Bar (Search, Filters, Quick Jump, Controls) */}
      <TopControlBar />

      {/* 2. Interactive Infinite Horizontal Timeline Canvas */}
      <main className="relative flex-1 w-full overflow-hidden">
        <TimelineCanvas />
      </main>

      {/* 3. Floating Action Button (FAB) */}
      <FloatingActionButton />

      {/* 4. Modals */}
      <ItemDetailModal />
      <AddEditModal />
      <AIAssistantModal />
      <NeonDatabaseModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TimelineProvider>
      <AppContent />
    </TimelineProvider>
  );
};

export default App;
