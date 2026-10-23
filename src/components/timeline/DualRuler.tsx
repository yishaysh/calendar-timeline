import React, { useMemo } from 'react';
import { getVisibleTicks } from '../../engine/coordinates';

interface DualRulerProps {
  viewportWidth: number;
  pixelsPerYear: number;
  panX: number;
}

export const DualRuler: React.FC<DualRulerProps> = ({
  viewportWidth,
  pixelsPerYear,
  panX,
}) => {
  const ticks = useMemo(() => {
    return getVisibleTicks(viewportWidth, pixelsPerYear, panX);
  }, [viewportWidth, pixelsPerYear, panX]);

  return (
    <div
      id="timeline-dual-ruler"
      className="sticky top-0 z-20 w-full h-20 bg-slateTheme-900/95 backdrop-blur-md border-b border-slate-700/80 shadow-lg select-none overflow-hidden"
    >
      {/* Hebrew Timeline Ruler (Top row) */}
      <div className="relative w-full h-10 border-b border-slate-800/80 overflow-hidden">
        <span className="absolute right-3 top-2 text-[10.5px] font-bold text-amber-400/80 tracking-wider bg-slateTheme-950/80 px-2 py-0.5 rounded border border-amber-500/30 z-10">
          שנה עברית (לבריאת העולם)
        </span>
        {ticks.map((tick) => (
          <div
            key={`heb-${tick.hebrewYear}`}
            className="absolute top-0 flex flex-col items-center pointer-events-none transition-opacity duration-150"
            style={{
              left: `${tick.x}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Tick Mark */}
            <div
              className={`w-[1.5px] ${
                tick.isMajor
                  ? 'h-3.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'h-2 bg-slate-600'
              }`}
            />
            {/* Label */}
            {tick.isMajor && (
              <span className="mt-0.5 text-[10.5px] font-bold text-amber-300 whitespace-nowrap bg-slateTheme-950/90 px-1.5 py-0.2 rounded border border-amber-400/30 shadow-sm">
                {tick.labelHebrew}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Gregorian Timeline Ruler (Bottom row) */}
      <div className="relative w-full h-10 overflow-hidden">
        <span className="absolute right-3 top-2 text-[10.5px] font-bold text-cyan-400/80 tracking-wider bg-slateTheme-950/80 px-2 py-0.5 rounded border border-cyan-500/30 z-10">
          שנה גרגוריאנית (לספירה / לפנה"ס)
        </span>
        {ticks.map((tick) => (
          <div
            key={`greg-${tick.hebrewYear}`}
            className="absolute top-0 flex flex-col items-center pointer-events-none transition-opacity duration-150"
            style={{
              left: `${tick.x}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Tick Mark */}
            <div
              className={`w-[1.5px] ${
                tick.isMajor
                  ? 'h-3.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                  : 'h-2 bg-slate-600'
              }`}
            />
            {/* Label */}
            {tick.isMajor && (
              <span className="mt-0.5 text-[10px] font-semibold text-cyan-300 whitespace-nowrap bg-slateTheme-950/90 px-1.5 py-0.2 rounded border border-cyan-400/30 shadow-sm">
                {tick.labelGregorian}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
