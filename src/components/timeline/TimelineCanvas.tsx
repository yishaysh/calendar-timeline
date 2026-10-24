import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import { useTimelinePanZoom } from '../../hooks/useTimelinePanZoom';
import { PeriodBar } from './PeriodBar';
import { EventNode } from './EventNode';
import {
  computePeriodLanes,
  filterItemsByLOD,
  computeStaggeredNodes,
} from '../../engine/layoutEngine';
import { yearToScreenX, getVisibleTicks, getZoomFontScale } from '../../engine/coordinates';
import { Globe, BookOpen, Layers } from 'lucide-react';

export const TimelineCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { filteredItems, setSelectedItem, targetJumpYear, showHebrewYearsOnRuler } = useTimelineStore();
  const [containerHeight, setContainerHeight] = useState<number>(window.innerHeight - 64);

  const lastHandledJumpTsRef = useRef<number>(0);

  const {
    pixelsPerYear,
    panX,
    panY,
    viewportWidth,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    flyToYear,
  } = useTimelinePanZoom({ containerRef, initialYear: 3760 });

  // Update container height on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic axis position:
  // Allocate ~44% to upper zone (periods + general thinkers) and ~56% to lower zone (ruler + Jewish heritage + FAB).
  // Guarantee balanced breathing room on all screens and TVs (from 500px to 2160px).
  const baseAxisY = useMemo(() => {
    const minTop = 180;
    const minBottom = 260;
    const calculated = Math.floor(containerHeight * 0.44);
    return Math.max(minTop, Math.min(containerHeight - minBottom, calculated));
  }, [containerHeight]);

  // Apply vertical pan smoothly
  const axisY = useMemo(() => {
    return baseAxisY + panY;
  }, [baseAxisY, panY]);

  // Gentle, gradual font scale factor based on zoom (pixelsPerYear)
  const fontScale = useMemo(() => {
    return getZoomFontScale(pixelsPerYear);
  }, [pixelsPerYear]);

  // Listen for external jump requests - protected against infinite loops
  useEffect(() => {
    if (targetJumpYear && targetJumpYear.ts !== lastHandledJumpTsRef.current) {
      lastHandledJumpTsRef.current = targetJumpYear.ts;
      flyToYear(targetJumpYear.year);
    }
  }, [targetJumpYear, flyToYear]);

  // 1. Visible dynamic ticks on the axis itself
  const ticks = useMemo(() => {
    return getVisibleTicks(viewportWidth, pixelsPerYear, panX);
  }, [viewportWidth, pixelsPerYear, panX]);

  // 2. Filter items according to Semantic LOD (zoom tier)
  const lodItems = useMemo(() => {
    return filterItemsByLOD(filteredItems, pixelsPerYear);
  }, [filteredItems, pixelsPerYear]);

  // 3. Separate periods and points
  const periods = useMemo(() => {
    return lodItems.filter((i) => i.type === 'period');
  }, [lodItems]);

  // 4. Compute period lanes (in upper area)
  const periodLanes = useMemo(() => {
    return computePeriodLanes(periods, pixelsPerYear, panX);
  }, [periods, pixelsPerYear, panX]);

  // 5. Compute staggered nodes for events and persons (above for general, below for jewish)
  const staggeredNodes = useMemo(() => {
    return computeStaggeredNodes(lodItems, pixelsPerYear, panX, viewportWidth, fontScale);
  }, [lodItems, pixelsPerYear, panX, viewportWidth, fontScale]);

  // Start and End year screen positions for the axis line
  const startAxisX = yearToScreenX(1, pixelsPerYear, panX); // Year 1 (right)
  const endAxisX = yearToScreenX(6000, pixelsPerYear, panX); // Year 6000 (left)

  return (
    <div
      ref={containerRef}
      id="timeline-main-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full h-full overflow-hidden select-none bg-radial-gradient from-slateTheme-900 to-slateTheme-950 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* ==================================================== */}
      {/* תגיות כיוון והסבר על אזורי הציר (מעל הציר / מתחת לציר) */}
      {/* ==================================================== */}

      {/* 1. כותרת אזור התקופות ההיסטוריות (צמוד לציר) */}
      <div
        className="absolute right-4 pointer-events-none z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slateTheme-900/80 border border-slate-700/60 shadow-md text-[11px] font-bold text-cyan-300"
        style={{ top: `${axisY - 55}px` }}
      >
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        תקופות היסטוריות (צמוד לציר ↑)
      </div>

      {/* 2. כותרת אזור העולם הכללי (מעל התקופות) */}
      <div
        className="absolute right-4 pointer-events-none z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40 shadow-md text-[11px] font-bold text-indigo-200"
        style={{ top: `${axisY - 145}px` }}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400" />
        הוגים, פילוסופיה ואירועים בעולם הכללי (מעל הציר ↑)
      </div>

      {/* 3. כותרת אזור המסורת היהודית (מתחת לציר, מתחת לשנתות הגרגוריאניות) */}
      <div
        className="absolute right-4 pointer-events-none z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 shadow-md text-[11px] font-bold text-amber-200"
        style={{ top: `${axisY + 46}px` }}
      >
        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
        חכמים, מורשת ואירועים במסורת היהודית (מתחת לציר ↓)
      </div>

      {/* ==================================================== */}
      {/* שכבת הקנבס האינטראקטיבית */}
      {/* ==================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* הילת רקע עדינה סביב הציר המרכזי */}
        <div
          className="absolute left-0 right-0 h-48 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none"
          style={{ top: `${axisY - 24}px` }}
        />

        {/* ---------------------------------------------------- */}
        {/* קו ציר הזמן המרכזי (מעוצב עם הילה זהובה-ציאן) */}
        {/* ---------------------------------------------------- */}
        <div
          className="absolute h-[4px] bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-500 shadow-[0_0_16px_rgba(251,191,36,0.7)] z-10 rounded-full"
          style={{
            left: `${Math.min(startAxisX, endAxisX)}px`,
            width: `${Math.abs(startAxisX - endAxisX)}px`,
            top: `${axisY - 2}px`,
          }}
        />

        {/* ---------------------------------------------------- */}
        {/* השנתות על ציר הזמן עצמו (גרגוריאניות ראשיות, עבריות לפי מתג) */}
        {/* ---------------------------------------------------- */}
        {ticks.map((tick) => (
          <div
            key={`axis-tick-${tick.hebrewYear}`}
            className="absolute flex flex-col items-center pointer-events-none z-10 transition-opacity duration-150"
            style={{
              left: `${tick.x}px`,
              top: `${axisY}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* 1. שנת עברית (מוצגת רק אם המתג למעלה מופעל) */}
            {showHebrewYearsOnRuler && (
              <div
                className="absolute flex flex-col items-center animate-fadeIn"
                style={{ bottom: '2px' }}
              >
                {/* תגית שנה עברית */}
                {tick.isMajor && (
                  <span
                    className="mb-1 font-extrabold text-amber-300 whitespace-nowrap bg-slateTheme-950/90 rounded border border-amber-400/40 shadow-sm drop-shadow-md transition-all duration-100"
                    style={{
                      fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
                      padding: `${Math.round(2 * fontScale)}px ${Math.round(6 * fontScale)}px`,
                    }}
                  >
                    {tick.labelHebrew}
                  </span>
                )}
                {/* קו שנת עברי (עולה למעלה) */}
                <div
                  className={`transition-all duration-100 ${
                    tick.isMajor
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : 'bg-slate-500/80'
                  }`}
                  style={{
                    height: tick.isMajor ? `${Math.round(14 * fontScale)}px` : `${Math.round(8 * fontScale)}px`,
                    width: `${Math.max(1.5, Math.min(3, 1.5 * fontScale))}px`,
                  }}
                />
              </div>
            )}

            {/* 2. שנת גרגוריאנית (ראשית ומרכזית על הציר) */}
            <div
              className="absolute flex flex-col items-center"
              style={{ top: '2px' }}
            >
              {/* קו שנת גרגוריאני (יורד למטה) */}
              <div
                className={`transition-all duration-100 ${
                  tick.isMajor
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'bg-slate-500/80'
                }`}
                style={{
                  height: tick.isMajor ? `${Math.round(14 * fontScale)}px` : `${Math.round(8 * fontScale)}px`,
                  width: `${Math.max(1.5, Math.min(3, 1.5 * fontScale))}px`,
                }}
              />
              {/* תגית שנה גרגוריאנית ראשית */}
              {tick.isMajor && (
                <span
                  className="mt-1 font-extrabold text-cyan-200 whitespace-nowrap bg-slateTheme-950/95 rounded border border-cyan-400/50 shadow-md drop-shadow-md transition-all duration-100"
                  style={{
                    fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
                    padding: `${Math.round(2 * fontScale)}px ${Math.round(6 * fontScale)}px`,
                  }}
                >
                  {tick.labelGregorian}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* ---------------------------------------------------- */}
        {/* קצה ימין: ראשית הציר (3761 לפנה"ס) */}
        {/* ---------------------------------------------------- */}
        <div
          className="absolute flex flex-col items-center z-20 pointer-events-none"
          style={{
            left: `${startAxisX}px`,
            top: `${axisY - Math.round(16 * Math.min(1.25, fontScale))}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="rounded-full bg-cyan-600 border-2 border-white shadow-glow-cyan flex items-center justify-center font-black text-white transition-all duration-100 px-1 text-center"
            style={{
              width: `${Math.round(36 * Math.min(1.25, fontScale))}px`,
              height: `${Math.round(36 * Math.min(1.25, fontScale))}px`,
              fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
            }}
          >
            {showHebrewYearsOnRuler ? "א'" : '3761-'}
          </div>
          <span
            className="font-extrabold text-cyan-300 mt-1 whitespace-nowrap bg-slateTheme-950/95 rounded border border-cyan-500/40 shadow-lg transition-all duration-100"
            style={{
              fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
              padding: `${Math.round(2 * fontScale)}px ${Math.round(8 * fontScale)}px`,
            }}
          >
            {showHebrewYearsOnRuler
              ? "3761 לפנה\"ס • בריאת העולם (א')"
              : '3761 לפנה"ס (ראשית הציר)'}
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* קצה שמאל: קצה הציר (2240 לספירה) */}
        {/* ---------------------------------------------------- */}
        <div
          className="absolute flex flex-col items-center z-20 pointer-events-none"
          style={{
            left: `${endAxisX}px`,
            top: `${axisY - Math.round(16 * Math.min(1.25, fontScale))}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="rounded-full bg-cyan-500 border-2 border-white shadow-glow-cyan flex items-center justify-center font-black text-slate-950 transition-all duration-100 px-1 text-center"
            style={{
              width: `${Math.round(36 * Math.min(1.25, fontScale))}px`,
              height: `${Math.round(36 * Math.min(1.25, fontScale))}px`,
              fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
            }}
          >
            {showHebrewYearsOnRuler ? "ו'" : '2240'}
          </div>
          <span
            className="font-extrabold text-cyan-300 mt-1 whitespace-nowrap bg-slateTheme-950/95 rounded border border-cyan-500/40 shadow-lg transition-all duration-100"
            style={{
              fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
              padding: `${Math.round(2 * fontScale)}px ${Math.round(8 * fontScale)}px`,
            }}
          >
            {showHebrewYearsOnRuler
              ? "2240 לספירה • שנת ו' אלפים (6000)"
              : '2240 לספירה (קצה הציר)'}
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* פסי תקופות (מעל ציר הזמן באזור העליון) */}
        {/* ---------------------------------------------------- */}
        <div className="pointer-events-auto">
          {periodLanes.map((laneItem) => (
            <PeriodBar
              key={laneItem.item.id}
              laneItem={laneItem}
              axisY={axisY}
              fontScale={fontScale}
              onSelect={() => setSelectedItem(laneItem.item)}
            />
          ))}
        </div>

        {/* ---------------------------------------------------- */}
        {/* אירועים ואישים (מעל הציר לכלליים, מתחת לציר ליהודיים) */}
        {/* ---------------------------------------------------- */}
        <div className="pointer-events-auto">
          {staggeredNodes.map((node) => (
            <EventNode
              key={node.item.id}
              node={node}
              axisY={axisY}
              containerHeight={containerHeight}
              fontScale={fontScale}
              onSelect={() => setSelectedItem(node.item)}
            />
          ))}
        </div>
      </div>

      {/* הנחיות ניווט צפות בעת תצוגה מרוחקת */}
      {pixelsPerYear < 0.6 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slateTheme-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 shadow-lg text-xs text-slate-300 pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          גרור לניווט (אופקי ואנכי) • גלול בעכבר לביצוע זום פנימה והחוצה
        </div>
      )}
    </div>
  );
};
