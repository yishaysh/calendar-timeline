import React, { useState } from 'react';
import { TimelineProvider } from './store/TimelineContext';
import { TopControlBar } from './components/controls/TopControlBar';
import { TimelineCanvas } from './components/timeline/TimelineCanvas';
import { FloatingActionButton } from './components/controls/FloatingActionButton';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { AddEditModal } from './components/modals/AddEditModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { NeonDatabaseModal } from './components/modals/NeonDatabaseModal';
import { OrientationPrompt } from './components/controls/OrientationPrompt';

export const AppContent: React.FC = () => {
  const [isForceRotated, setIsForceRotated] = useState(false);

  return (
    <div
      className={`relative w-screen h-screen flex flex-col bg-slateTheme-950 overflow-hidden font-sans transition-transform duration-300 ${
        isForceRotated ? 'rotate-90 origin-top-left w-[100vh] h-[100vw] absolute top-0 left-full' : ''
      }`}
    >
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

      {/* 5. Mobile Orientation Prompt */}
      <OrientationPrompt
        isForceRotated={isForceRotated}
        onToggleForceRotate={setIsForceRotated}
      />
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
