import React from 'react';
import { LaneItem } from '../../types/timeline';
import { toHebrewYearString } from '../../engine/gematria';
import { hebrewToGregorian } from '../../engine/calendarMath';

interface PeriodBarProps {
  laneItem: LaneItem;
  axisY: number; // Vertical screen position of the axis line
  fontScale?: number;
  onSelect: () => void;
}

export const PeriodBar: React.FC<PeriodBarProps> = ({
  laneItem,
  axisY,
  fontScale = 1.0,
  onSelect,
}) => {
  const { item, lane, startX, width } = laneItem;

  // In RTL, startX is the right edge.
  // The CSS left position is startX - width
  const leftPos = startX - width;

  // Period bars placed directly and closely above the timeline axis
  const laneHeight = Math.round(30 * Math.min(1.25, fontScale));
  const laneGap = Math.round(8 * Math.min(1.2, fontScale));
  // Lane 0 sits right above the ruler ticks (approx 55px above axisY)
  const topPos = axisY - Math.round(55 * Math.min(1.15, fontScale)) - lane * (laneHeight + laneGap);

  const startGematria = toHebrewYearString(item.startYear);
  const endGematria = item.endYear ? toHebrewYearString(item.endYear) : '';
  const startGreg = hebrewToGregorian(item.startYear);
  const endGreg = item.endYear ? hebrewToGregorian(item.endYear) : null;

  const gregorianRange = endGreg
    ? startGreg.era === endGreg.era
      ? `${startGreg.year} - ${endGreg.year} ${startGreg.era === 'BCE' ? 'לפנה"ס' : 'לספירה'}`
      : `${startGreg.formatted} - ${endGreg.formatted}`
    : startGreg.formatted;

  const hebrewRange = item.endYear
    ? `${startGematria} (${item.startYear}) - ${endGematria} (${item.endYear})`
    : `${startGematria} (${item.startYear})`;

  const barColor = item.color || '#3b82f6';

  return (
    <div
      data-interactive="true"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="absolute cursor-pointer group transition-all duration-200 z-10"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
        width: `${width}px`,
        height: `${laneHeight}px`,
      }}
    >
      {/* Outer Glow & Border Container */}
      <div
        className="w-full h-full rounded-xl flex items-center justify-between px-3 relative overflow-hidden transition-all duration-200 shadow-md group-hover:shadow-glow-cyan group-hover:scale-[1.01] border border-white/20"
        style={{
          background: `linear-gradient(135deg, ${barColor}dd, ${barColor}99)`,
        }}
      >
        {/* Subtle light sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-black/20 pointer-events-none" />

        {/* Title */}
        <span
          className="font-bold text-white truncate drop-shadow-sm z-10 flex items-center gap-1.5 transition-all duration-100"
          style={{ fontSize: `${Math.round(13 * fontScale * 10) / 10}px` }}
        >
          <span className="w-2 h-2 rounded-full bg-white/80 shrink-0" />
          {item.title}
        </span>

        {/* Year Badge if width allows - Gregorian years */}
        {width > 120 && (
          <span
            className="font-bold text-cyan-200 bg-black/40 rounded-full whitespace-nowrap shrink-0 z-10 mr-1.5 border border-cyan-400/30 transition-all duration-100"
            style={{
              fontSize: `${Math.round(10 * fontScale * 10) / 10}px`,
              padding: `${Math.round(2 * fontScale)}px ${Math.round(8 * fontScale)}px`,
            }}
          >
            {gregorianRange}
          </span>
        )}
      </div>

      {/* Floating Hover Tooltip for tight widths */}
      <div
        className="absolute -top-9 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 bg-slateTheme-900/95 text-slate-100 px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap"
        style={{ fontSize: `${Math.round(11 * fontScale * 10) / 10}px` }}
      >
        <span className="font-bold text-amber-300">{item.title}</span> ({item.category})
        <div className="text-[10px] text-slate-300">
          <span className="text-cyan-300 font-bold">{gregorianRange}</span>
          <span className="text-slate-400 mx-1">•</span>
          <span className="text-amber-300/80">{hebrewRange}</span>
        </div>
      </div>
    </div>
  );
};
