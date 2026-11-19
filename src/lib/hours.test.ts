import { describe, expect, it } from 'vitest';
import {
  breakHint,
  formatDateLabel,
  formatRangesCompact,
  formatSpecialDate,
  formatTime,
  getDoorStatus,
  getPublicDoorStatus,
  hoursFooterLine,
  hoursRibbon,
  openingSummary,
  splitAroundBreak,
  weeklyHoursRows,
} from './hours';
import { createSeedContent } from './seed';
import type { SpecialDay, WeekHours } from './types';

const seedWeek = (): WeekHours => createSeedContent().hours.week;

/** A wall-clock time in Toronto. November 2026 is EST (UTC−5); July is EDT (UTC−4). */
const toronto = (local: string, offset = '-05:00') => new Date(`${local}${offset}`);

// 2026-11-19 is a Thursday.
const THU_NOON = toronto('2026-11-19T12:00:00');
const FRI_1500 = toronto('2026-11-20T15:00:00');
const FRI_1700 = toronto('2026-11-20T17:00:00');
const SAT_1630 = toronto('2026-11-21T16:30:00');
const SUN_NOON = toronto('2026-11-22T12:00:00');
const TUE_1000 = toronto('2026-11-24T10:00:00');

describe('getDoorStatus', () => {
  const status = (now: Date, specials: SpecialDay[] = []) =>
    getDoorStatus(now, seedWeek(), specials, 'auto');

  it('covers the cases in the brief', () => {
    expect(status(FRI_1500)).toEqual({ open: false, note: 'back today at 4:30 pm' });
    expect(status(FRI_1700)).toEqual({ open: true, note: 'until 7 pm' });
    expect(status(SAT_1630)).toEqual({ open: false, note: 'back Tuesday at 11 am' });
    expect(status(SUN_NOON)).toEqual({ open: false, note: 'back Tuesday at 11 am' });
    expect(status(TUE_1000)).toEqual({ open: false, note: 'opening today at 11 am' });
  });

  it('handles the rest of the week', () => {
    expect(status(THU_NOON)).toEqual({ open: true, note: 'until 4 pm' });
    expect(status(toronto('2026-11-20T11:00:00'))).toEqual({ open: true, note: 'until 2:30 pm' });
    expect(status(toronto('2026-11-20T14:30:00'))).toEqual({
      open: false,
      note: 'back today at 4:30 pm',
    });
    expect(status(toronto('2026-11-20T19:00:00'))).toEqual({
      open: false,
      note: 'back tomorrow at 11 am',
    });
    expect(status(toronto('2026-11-23T09:00:00'))).toEqual({
      open: false,
      note: 'back tomorrow at 11 am',
    });
  });

  it('follows daylight saving time', () => {
    // 2026-07-07 is a Tuesday, during EDT.
    expect(status(toronto('2026-07-07T10:00:00', '-04:00'))).toEqual({
      open: false,
      note: 'opening today at 11 am',
    });
    expect(status(toronto('2026-07-07T15:59:00', '-04:00'))).toEqual({
      open: true,
      note: 'until 4 pm',
    });
  });

  it('uses Toronto time whatever the browser time zone is', () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = 'Pacific/Auckland';
      expect(status(FRI_1500)).toEqual({ open: false, note: 'back today at 4:30 pm' });
      process.env.TZ = 'America/Los_Angeles';
      expect(status(TUE_1000)).toEqual({ open: false, note: 'opening today at 11 am' });
    } finally {
      process.env.TZ = original;
    }
  });

  it('lets a special day override the regular hours', () => {
    const closedWednesday: SpecialDay = {
      id: 's1',
      date: '2026-11-25',
      label: 'Closed for a private event',
      closedAllDay: true,
      ranges: [],
    };
    expect(status(toronto('2026-11-25T12:00:00'), [closedWednesday])).toEqual({
      open: false,
      note: 'back tomorrow at 11 am',
    });

    const openMonday: SpecialDay = {
      id: 's2',
      date: '2026-11-23',
      label: 'Holiday lunch',
      closedAllDay: false,
      ranges: [{ from: '10:00', to: '14:00' }],
    };
    expect(status(toronto('2026-11-23T12:00:00'), [openMonday])).toEqual({
      open: true,
      note: 'until 2 pm',
    });
    expect(status(SUN_NOON, [openMonday])).toEqual({
      open: false,
      note: 'back tomorrow at 10 am',
    });
  });

  it('skips special closures when looking ahead', () => {
    const closedTuesday: SpecialDay = {
      id: 's3',
      date: '2026-11-24',
      label: 'Closed',
      closedAllDay: true,
      ranges: [],
    };
    expect(status(SAT_1630, [closedTuesday])).toEqual({
      open: false,
      note: 'back Wednesday at 11 am',
    });
  });

  it('lets an override win over everything', () => {
    expect(getDoorStatus(SUN_NOON, seedWeek(), [], 'open')).toEqual({
      open: true,
      note: 'until you switch it back',
    });
    expect(getDoorStatus(THU_NOON, seedWeek(), [], 'closed')).toEqual({
      open: false,
      note: 'until you switch it back',
    });
  });
});

describe('getPublicDoorStatus', () => {
  it('matches the home page sign when automatic', () => {
    expect(getPublicDoorStatus(THU_NOON, seedWeek(), [], 'auto')).toEqual({
      open: true,
      note: 'until 4 pm today',
    });
    expect(getPublicDoorStatus(SAT_1630, seedWeek(), [], 'auto')).toEqual({
      open: false,
      note: 'back Tuesday at 11 am',
    });
  });

  it('gives visitors a useful note when the owners override the sign', () => {
    expect(getPublicDoorStatus(THU_NOON, seedWeek(), [], 'closed')).toEqual({
      open: false,
      note: 'back tomorrow at 11 am',
    });
    expect(getPublicDoorStatus(toronto('2026-11-20T12:00:00'), seedWeek(), [], 'closed')).toEqual({
      open: false,
      note: 'back today at 4:30 pm',
    });
    expect(getPublicDoorStatus(SUN_NOON, seedWeek(), [], 'open')).toEqual({ open: true, note: '' });
  });
});

describe('hours lists', () => {
  it('formats the seed hours like the artboards', () => {
    const week = seedWeek();
    expect(hoursRibbon(week)).toEqual({
      headline: 'Tue – Sat, 11 to 4',
      detail: 'Fri 11–2:30 & 4:30–7 · closed Sun & Mon',
    });
    expect(weeklyHoursRows(week)).toEqual([
      { label: 'Tue – Thu', value: '11 am – 4 pm', closed: false },
      { label: 'Friday', value: '11–2:30 & 4:30–7', closed: false },
      { label: 'Saturday', value: '11 am – 4 pm', closed: false },
      { label: 'Sun & Mon', value: 'closed', closed: true },
    ]);
    expect(hoursFooterLine(week)).toBe('Tue – Sat 11 am – 4 pm · Fri 11–2:30 & 4:30–7');
    expect(openingSummary(week)).toBe('Tuesday to Saturday from 11');
    expect(formatRangesCompact(week.fri.ranges)).toBe('11–2:30 & 4:30–7');
    expect(breakHint(week)).toBe('Fridays already have one, from 2:30 to 4:30.');
  });

  it('keeps up when the hours change', () => {
    const week = seedWeek();
    week.wed = { open: false, ranges: [] };
    expect(hoursRibbon(week)).toEqual({
      headline: 'Tue – Sat, 11 to 4',
      detail: 'Fri 11–2:30 & 4:30–7 · closed Wed, Sun & Mon',
    });

    const withMonday = seedWeek();
    withMonday.mon = { open: true, ranges: [{ from: '11:00', to: '16:00' }] };
    expect(hoursRibbon(withMonday)).toEqual({
      headline: 'Mon – Sat, 11 to 4',
      detail: 'Fri 11–2:30 & 4:30–7 · closed Sun',
    });
    expect(weeklyHoursRows(withMonday)[0]).toEqual({
      label: 'Mon – Thu',
      value: '11 am – 4 pm',
      closed: false,
    });
  });

  it('copes with a week with no open days', () => {
    const week = seedWeek();
    for (const day of Object.values(week)) day.open = false;
    expect(hoursRibbon(week).headline).toBe('Closed for now');
    expect(openingSummary(week)).toBeNull();
  });
});

describe('time helpers', () => {
  it('formats times the way the shop writes them', () => {
    expect(formatTime('11:00')).toBe('11 am');
    expect(formatTime('12:00')).toBe('12 pm');
    expect(formatTime('00:00')).toBe('12 am');
    expect(formatTime('16:30')).toBe('4:30 pm');
  });

  it('splits a day around a midday break', () => {
    expect(splitAroundBreak({ from: '11:00', to: '16:00' })).toEqual([
      { from: '11:00', to: '13:00' },
      { from: '14:00', to: '16:00' },
    ]);
  });

  it('formats dashboard dates in Toronto', () => {
    expect(formatDateLabel(THU_NOON)).toBe('Thursday, November 19');
    expect(formatSpecialDate('2026-12-25')).toMatch(/^Fri, Dec\.? 25$/);
    expect(formatSpecialDate('')).toBe('Date to be set');
  });
});
