import React from 'react';
import { StaggeredNode } from '../../types/timeline';
import { toHebrewYearString } from '../../engine/gematria';
import { hebrewToGregorian } from '../../engine/calendarMath';
import { Calendar, User, Sparkles, Globe, BookOpen } from 'lucide-react';

interface EventNodeProps {
  node: StaggeredNode;
  axisY: number;
  fontScale?: number;
  onSelect: () => void;
}

export const EventNode: React.FC<EventNodeProps> = ({
  node,
  axisY,
  fontScale = 1.0,
  onSelect,
}) => {
  const { item, x, tier, direction, collapsed } = node;

  const isAbove = direction === 'above';

  // Staggered vertical distances scaled smoothly
  const stemScale = Math.min(1.25, fontScale);
  // Above the axis, period bars sit close to the axis (~55px - 115px), so general thinkers float cleanly above:
  const tierOffsetsAbove = [
    Math.round(130 * stemScale),
    Math.round(200 * stemScale),
    Math.round(270 * stemScale),
    Math.round(340 * stemScale),
  ];
  // Below the axis, Jewish tradition items start directly below the ruler:
  const tierOffsetsBelow = [
    Math.round(42 * stemScale),
    Math.round(115 * stemScale),
    Math.round(185 * stemScale),
    Math.round(255 * stemScale),
  ];
  const tierOffsets = isAbove ? tierOffsetsAbove : tierOffsetsBelow;
  const stemHeight = tierOffsets[tier] || Math.round((isAbove ? 130 : 45) * stemScale);

  const gematria = toHebrewYearString(item.startYear);
  const greg = hebrewToGregorian(item.startYear);
  const isPerson = item.type === 'person';

  const endGreg = item.endYear && item.endYear !== item.startYear ? hebrewToGregorian(item.endYear) : null;
  const gregorianDisplay = endGreg
    ? greg.era === endGreg.era
      ? `${greg.year} - ${endGreg.year} ${greg.era === 'BCE' ? 'לפנה"ס' : 'לספירה'}`
      : `${greg.formatted} - ${endGreg.formatted}`
    : greg.formatted;

  const hebrewDisplay = item.endYear && item.endYear !== item.startYear
    ? `${gematria} (${item.startYear}) - ${toHebrewYearString(item.endYear)} (${item.endYear})`
    : `${gematria} (${item.startYear})`;

  // Distinction colors:
  // General (Above): Slate/Violet/Cyan
  // Jewish (Below): Amber/Gold/Emerald/Blue
  const defaultColor = isAbove
    ? isPerson ? '#818cf8' : '#a855f7'
    : isPerson ? '#f59e0b' : '#3b82f6';

  const nodeColor = item.color || defaultColor;

  const markerSize = Math.round(16 * Math.min(1.25, fontScale));
  const cardWidth = Math.round(205 * Math.min(1.3, fontScale));
  const cardPadding = Math.round(10 * Math.min(1.2, fontScale));
  const avatarSize = Math.round(32 * Math.min(1.25, fontScale));

  // If collapsed due to high density at current zoom
  if (collapsed) {
    const microDotSize = Math.round(14 * Math.min(1.3, fontScale));
    return (
      <div
        data-interactive="true"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="absolute cursor-pointer group z-10"
        style={{
          left: `${x}px`,
          top: isAbove ? `${axisY - 14}px` : `${axisY + 4}px`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Pulsing micro dot on axis */}
        <div
          className="rounded-full border border-white/60 shadow-md group-hover:scale-150 transition-transform flex items-center justify-center"
          style={{
            width: `${microDotSize}px`,
            height: `${microDotSize}px`,
            backgroundColor: nodeColor,
          }}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" />
        </div>

        {/* Hover Popover */}
        <div
          className={`absolute right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40 bg-slateTheme-900/95 text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap ${
            isAbove ? 'bottom-6' : 'top-6'
          }`}
          style={{ fontSize: `${Math.round(11 * fontScale * 10) / 10}px` }}
        >
          <div className="font-bold flex items-center gap-1" style={{ color: nodeColor }}>
            {isAbove ? <Globe className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {item.title}
          </div>
          <div className="text-slate-300 flex items-center gap-1.5" style={{ fontSize: `${Math.round(9.5 * fontScale * 10) / 10}px` }}>
            <span className="text-cyan-300 font-bold">{gregorianDisplay}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300/80">{hebrewDisplay}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-interactive="true"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="absolute cursor-pointer group z-10"
      style={{
        left: `${x}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* 1. Anchor Marker on the Main Axis Line */}
      <div
        className="absolute rounded-full border-2 border-slateTheme-950 shadow-md group-hover:scale-125 transition-transform flex items-center justify-center z-20"
        style={{
          top: `${axisY - markerSize / 2}px`,
          width: `${markerSize}px`,
          height: `${markerSize}px`,
          backgroundColor: nodeColor,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>

      {/* 2. Vertical Stem / Connector Line */}
      <div
        className={`absolute w-[1.5px] transition-colors pointer-events-none ${
          isAbove
            ? 'bg-gradient-to-t from-slate-400/80 via-indigo-500/50 to-indigo-400/30 group-hover:from-indigo-400 group-hover:to-cyan-400'
            : 'bg-gradient-to-b from-slate-400/80 via-amber-500/50 to-amber-400/30 group-hover:from-amber-400 group-hover:to-cyan-400'
        }`}
        style={{
          top: isAbove ? `${axisY - stemHeight}px` : `${axisY}px`,
          height: `${stemHeight}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* 3. Floating Node Card (Above or Below Axis) */}
      <div
        className="absolute rounded-xl bg-slateTheme-900/95 hover:bg-slateTheme-850 backdrop-blur-md border border-slate-700/80 hover:border-amber-400/60 transition-all duration-200 shadow-xl group-hover:shadow-glow-gold text-right overflow-hidden"
        style={{
          top: isAbove ? `${axisY - stemHeight}px` : `${axisY + stemHeight}px`,
          left: '50%',
          transform: isAbove
            ? 'translateX(-50%) translateY(-100%)'
            : 'translateX(-50%)',
          width: `${cardWidth}px`,
          padding: `${cardPadding}px`,
        }}
      >
        {/* Accent strip on card: Bottom of card if above, Top of card if below */}
        <div
          className={`absolute left-0 right-0 h-[2.5px] ${isAbove ? 'bottom-0' : 'top-0'}`}
          style={{ backgroundColor: nodeColor }}
        />

        <div className="flex items-start gap-2">
          {/* Avatar / Icon Badge */}
          <div
            className="rounded-full shrink-0 flex items-center justify-center border border-white/20 shadow-sm overflow-hidden transition-all duration-100"
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              backgroundColor: `${nodeColor}33`,
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : isPerson ? (
              <User className="w-4 h-4" style={{ color: nodeColor }} />
            ) : (
              <Calendar className="w-4 h-4" style={{ color: nodeColor }} />
            )}
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            {/* Header Mini Badge */}
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="font-semibold text-slate-400 flex items-center gap-0.5 transition-all duration-100"
                style={{ fontSize: `${Math.round(9 * fontScale * 10) / 10}px` }}
              >
                {isAbove ? (
                  <>
                    <Globe className="w-2.5 h-2.5 text-indigo-400" />
                    כללי / עולם
                  </>
                ) : (
                  <>
                    <BookOpen className="w-2.5 h-2.5 text-amber-400" />
                    מסורת יהודית
                  </>
                )}
              </span>
            </div>

            <h4
              className="font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors"
              style={{
                fontSize: `${Math.round(12.5 * fontScale * 10) / 10}px`,
                lineHeight: 1.25,
              }}
            >
              {item.title}
            </h4>

            {/* Primary Date: Gregorian (שנים לועזיות בערכים) */}
            <p
              className="text-cyan-300 font-bold truncate mt-0.5 transition-all duration-100"
              style={{ fontSize: `${Math.round(11 * fontScale * 10) / 10}px` }}
            >
              {gregorianDisplay}
            </p>

            {/* Secondary Date: Hebrew */}
            <p
              className="text-amber-300/80 font-medium truncate transition-all duration-100"
              style={{ fontSize: `${Math.round(9.5 * fontScale * 10) / 10}px` }}
            >
              {hebrewDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
