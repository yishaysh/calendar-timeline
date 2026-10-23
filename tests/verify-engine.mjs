import { toHebrewYearString } from '../src/engine/gematria.ts';
import { hebrewToGregorian, gregorianToHebrew } from '../src/engine/calendarMath.ts';
import { yearToScreenX, screenXToYear, getTickInterval } from '../src/engine/coordinates.ts';
import { computePeriodLanes } from '../src/engine/layoutEngine.ts';

console.log('=== Running Core Engine Verification Tests ===');

// 1. Test Gematria
const gematriaTests = [
  { year: 1, expected: "א'" },
  { year: 15, expected: 'ט"ו' },
  { year: 16, expected: 'ט"ז' },
  { year: 1000, expected: "א' אלפים" },
  { year: 3760, expected: 'ג\'תש"ס' },
  { year: 5000, expected: "ה' אלפים" },
  { year: 5786, expected: 'ה\'תשפ"ו' },
  { year: 6000, expected: "ו' אלפים" },
];

for (const t of gematriaTests) {
  const result = toHebrewYearString(t.year);
  console.assert(result === t.expected, `Gematria failed for ${t.year}: expected "${t.expected}", got "${result}"`);
}
console.log('✓ Gematria tests passed!');

// 2. Test Dual-Date conversion
console.assert(hebrewToGregorian(3760).year === 1 && hebrewToGregorian(3760).era === 'BCE', 'Year 3760 should be 1 BCE');
console.assert(hebrewToGregorian(3761).year === 1 && hebrewToGregorian(3761).era === 'CE', 'Year 3761 should be 1 CE');
console.assert(hebrewToGregorian(5708).year === 1948 && hebrewToGregorian(5708).era === 'CE', 'Year 5708 should be 1948 CE');
console.assert(hebrewToGregorian(5786).year === 2026 && hebrewToGregorian(5786).era === 'CE', 'Year 5786 should be 2026 CE');

console.assert(gregorianToHebrew(1, 'BCE') === 3760, '1 BCE should be 3760');
console.assert(gregorianToHebrew(1, 'CE') === 3761, '1 CE should be 3761');
console.assert(gregorianToHebrew(1948, 'CE') === 5708, '1948 CE should be 5708');
console.assert(gregorianToHebrew(2026, 'CE') === 5786, '2026 CE should be 5786');
console.log('✓ Dual Calendar math tests passed!');

// 3. Test RTL Coordinates
const zoom = 1.0;
const pan = 0;
const x6000 = yearToScreenX(6000, zoom, pan);
const x1 = yearToScreenX(1, zoom, pan);
console.assert(x6000 === 0, `Year 6000 should be at x=0 (far left), got ${x6000}`);
console.assert(x1 === 5999, `Year 1 should be at x=5999 (far right), got ${x1}`);
console.assert(screenXToYear(0, zoom, pan) === 6000, 'Screen x=0 should map back to year 6000');
console.assert(screenXToYear(5999, zoom, pan) === 1, 'Screen x=5999 should map back to year 1');
console.log('✓ RTL Coordinates tests passed!');

// 4. Test Period Lanes
const mockPeriods = [
  { id: '1', title: 'P1', type: 'period', startYear: 100, endYear: 200, importance: 1, category: 'test', description: '', tags: [], links: [], createdAt: 0 },
  { id: '2', title: 'P2', type: 'period', startYear: 150, endYear: 250, importance: 1, category: 'test', description: '', tags: [], links: [], createdAt: 0 },
  { id: '3', title: 'P3', type: 'period', startYear: 210, endYear: 300, importance: 1, category: 'test', description: '', tags: [], links: [], createdAt: 0 },
];
const lanes = computePeriodLanes(mockPeriods, 1.0, 0);
console.assert(lanes.find(l => l.item.id === '1').lane === 0, 'P1 should be lane 0');
console.assert(lanes.find(l => l.item.id === '2').lane === 1, 'P2 overlaps P1, should be lane 1');
console.assert(lanes.find(l => l.item.id === '3').lane === 0, 'P3 starts after P1 ends, should reuse lane 0');
console.log('✓ Period lane greedy packing tests passed!');

console.log('=== All Engine Tests Passed Successfully! ===');
