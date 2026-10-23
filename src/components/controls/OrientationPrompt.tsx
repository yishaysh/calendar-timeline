import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Maximize2, X, Check } from 'lucide-react';

interface OrientationPromptProps {
  onToggleForceRotate?: (force: boolean) => void;
  isForceRotated?: boolean;
}

export const OrientationPrompt: React.FC<OrientationPromptProps> = ({
  onToggleForceRotate,
  isForceRotated = false,
}) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSupportedFullscreen, setIsSupportedFullscreen] = useState(false);

  useEffect(() => {
    // Check if on a mobile/touch device
    const isMobileDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;

    const checkOrientation = () => {
      const portrait = window.matchMedia('(orientation: portrait)').matches && window.innerWidth <= 850;
      setIsPortrait(portrait && isMobileDevice);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    setIsSupportedFullscreen(
      Boolean(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)
    );

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleFullscreenLandscape = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }

      // Try Screen Orientation Lock if available (Android Chrome / PWAs)
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (err) {
      console.warn('Orientation lock or fullscreen not permitted by browser:', err);
      // Fallback: trigger CSS force rotation
      if (onToggleForceRotate) {
        onToggleForceRotate(true);
      }
    }
  };

  if (!isPortrait || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="הודעת כיוון מסך"
      dir="rtl"
      className="fixed bottom-4 left-3 right-3 z-50 animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-400/50 shadow-2xl text-slate-100"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
          <RotateCw className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            לחוויה מיטבית: סובב את המכשיר לרוחב
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            ציר הזמן הוא אופקי ורחב (6,000 שנה). אחיזה במאוזן מעניקה חוויית צפייה מושלמת.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        {/* Fullscreen / Orientation lock button */}
        <button
          onClick={handleFullscreenLandscape}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>למסך מלא לרוחב</span>
        </button>

        {/* CSS Force Rotate 90deg toggle */}
        {onToggleForceRotate && (
          <button
            onClick={() => onToggleForceRotate(!isForceRotated)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isForceRotated
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="סובב את המסך ב-90 מעלות באופן מאולץ דרך CSS"
          >
            <span>{isForceRotated ? 'ביטול סיבוב 90°' : 'סובב 90°'}</span>
          </button>
        )}

        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
          title="המשך במצב אנכי"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
