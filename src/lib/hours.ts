/**
 * Opening-hours logic. Everything here is pure and evaluated in America/Toronto,
 * whatever time zone the browser is in.
 */
import { joinNaturally } from './format';
import type { DayHours, DayKey, DoorOverride, SpecialDay, TimeRange, WeekHours } from './types';

export const TIME_ZONE = 'America/Toronto';

/** Index matches Date#getDay(): 0 = Sunday. */
const DAY_BY_INDEX: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEK_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_NAMES: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const DAY_ABBR: Record<DayKey, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export type DoorStatus = { open: boolean; note: string };

type Span = { from: number; to: number; range: TimeRange };
type CalendarDate = { year: number; month: number; day: number };

/* ---------- time parsing and formatting ---------- */

/** 'HH:MM' → minutes after midnight, or null when malformed. */
export function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes > 0)) return null;
  return hours * 60 + minutes;
}

/** Minutes after midnight → 'HH:MM' (clamped to the day). */
export function toHHMM(minutes: number): string {
  const clamped = Math.min(Math.max(Math.round(minutes), 0), 23 * 60 + 59);
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
}

/** Split one opening range around a break in the middle: 11–16 → 11–1 and 2–4. */
export function splitAroundBreak(range: TimeRange): TimeRange[] {
  const from = toMinutes(range.from);
  const to = toMinutes(range.to);
  if (from === null || to === null || to - from < 120) {
    return [
      { from: '11:00', to: '13:00' },
      { from: '14:00', to: '16:00' },
    ];
  }
  const middle = Math.round((from + to) / 2 / 30) * 30;
  return [
    { from: range.from, to: toHHMM(middle - 30) },
    { from: toHHMM(middle + 30), to: range.to },
  ];
}

function splitTime(value: string) {
  const total = toMinutes(value) ?? 0;
  const h24 = Math.floor(total / 60) % 24;
  return { h12: h24 % 12 === 0 ? 12 : h24 % 12, minutes: total % 60, pm: h24 >= 12 };
}

/** '16:30' → '4:30', '11:00' → '11' */
export function formatTimeShort(value: string): string {
  const { h12, minutes } = splitTime(value);
  return minutes ? `${h12}:${String(minutes).padStart(2, '0')}` : String(h12);
}

/** '16:30' → '4:30 pm', '11:00' → '11 am' */
export function formatTime(value: string): string {
  return `${formatTimeShort(value)} ${splitTime(value).pm ? 'pm' : 'am'}`;
}

/** Valid ranges only (opening before closing), sorted by opening time. */
function toSpans(ranges: TimeRange[]): Span[] {
  return ranges
    .map((range) => ({ from: toMinutes(range.from), to: toMinutes(range.to), range }))
    .filter((span): span is Span => span.from !== null && span.to !== null && span.from < span.to)
    .sort((a, b) => a.from - b.from);
}

export function isRangeValid(range: TimeRange): boolean {
  return toSpans([range]).length === 1;
}

export function isOpenDay(day: DayHours | undefined): boolean {
  return !!day && day.open && toSpans(day.ranges).length > 0;
}

/* ---------- dates in Toronto ---------- */

/** Calendar date, weekday and minutes since midnight in America/Toronto. */
export function zonedNow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    dayKey: get('weekday').slice(0, 3).toLowerCase() as DayKey,
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

/** The date `offset` days after a calendar date, as YYYY-MM-DD with its weekday. */
function shiftDate(date: CalendarDate, offset: number) {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + offset));
  return { iso: shifted.toISOString().slice(0, 10), dayKey: DAY_BY_INDEX[shifted.getUTCDay()] };
}

/** Today's date in Toronto as YYYY-MM-DD. */
export function torontoIsoDate(now: Date): string {
  return shiftDate(zonedNow(now), 0).iso;
}

/** Opening ranges for one date: a special day overrides the regular hours. */
export function rangesForDate(
  iso: string,
  dayKey: DayKey,
  week: WeekHours,
  specials: SpecialDay[],
): TimeRange[] {
  const special = specials.find((s) => s.date === iso);
  if (special) return special.closedAllDay ? [] : special.ranges;
  const day = week[dayKey];
  return day?.open ? day.ranges : [];
}

/* ---------- the door sign ---------- */

function scheduledStatus(
  now: Date,
  week: WeekHours,
  specials: SpecialDay[],
  ignoreCurrentRange = false,
): DoorStatus {
  const zoned = zonedNow(now);
  const today = shiftDate(zoned, 0);
  const spans = toSpans(rangesForDate(today.iso, today.dayKey, week, specials));

  const current = spans.find((s) => zoned.minutes >= s.from && zoned.minutes < s.to);
  if (current && !ignoreCurrentRange) {
    return { open: true, note: `until ${formatTime(current.range.to)}` };
  }

  const later = spans.find((s) => zoned.minutes < s.from);
  if (later) {
    const word = later === spans[0] ? 'opening' : 'back';
    return { open: false, note: `${word} today at ${formatTime(later.range.from)}` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const next = shiftDate(zoned, offset);
    const nextSpans = toSpans(rangesForDate(next.iso, next.dayKey, week, specials));
    if (nextSpans.length) {
      const when = offset === 1 ? 'tomorrow' : DAY_NAMES[next.dayKey];
      return { open: false, note: `back ${when} at ${formatTime(nextSpans[0].range.from)}` };
    }
  }
  return { open: false, note: '' };
}

/**
 * What the door sign says. A special day overrides the regular hours for its date,
 * and an override of `open` or `closed` wins over everything.
 */
export function getDoorStatus(
  now: Date,
  hours: WeekHours,
  specials: SpecialDay[],
  override: DoorOverride,
): DoorStatus {
  if (override !== 'auto') return { open: override === 'open', note: 'until you switch it back' };
  return scheduledStatus(now, hours, specials);
}

/**
 * The sign as visitors see it on the website. Same open/closed answer as getDoorStatus,
 * but an owner override gets a note that makes sense to visitors.
 */
export function getPublicDoorStatus(
  now: Date,
  hours: WeekHours,
  specials: SpecialDay[],
  override: DoorOverride,
): DoorStatus {
  const scheduled = scheduledStatus(now, hours, specials);
  if (override === 'open') {
    return { open: true, note: scheduled.open ? `${scheduled.note} today` : '' };
  }
  if (override === 'closed') {
    const note = scheduled.open ? scheduledStatus(now, hours, specials, true).note : scheduled.note;
    return { open: false, note };
  }
  return scheduled.open ? { open: true, note: `${scheduled.note} today` } : scheduled;
}

/* ---------- hours lists ---------- */

type DayGroup = { days: DayKey[]; hours: DayHours };

function signature(day: DayHours): string {
  const spans = day.open ? toSpans(day.ranges) : [];
  return spans.length ? spans.map((s) => `${s.from}-${s.to}`).join(',') : 'closed';
}

/** Runs of consecutive days with the same hours. The week wraps, so Sun & Mon can group. */
function groupWeek(week: WeekHours): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const key of WEEK_ORDER) {
    const last = groups[groups.length - 1];
    if (last && signature(last.hours) === signature(week[key])) last.days.push(key);
    else groups.push({ days: [key], hours: week[key] });
  }
  const first = groups[0];
  const last = groups[groups.length - 1];
  if (groups.length > 1 && signature(first.hours) === signature(last.hours)) {
    groups.shift();
    last.days.push(...first.days);
  }
  return groups;
}

function groupLabel(days: DayKey[], style: 'long' | 'short'): string {
  if (days.length === 1) return style === 'long' ? DAY_NAMES[days[0]] : DAY_ABBR[days[0]];
  if (days.length === 2) return `${DAY_ABBR[days[0]]} & ${DAY_ABBR[days[1]]}`;
  return `${DAY_ABBR[days[0]]} – ${DAY_ABBR[days[days.length - 1]]}`;
}

/** '11–2:30 & 4:30–7' */
export function formatRangesCompact(ranges: TimeRange[]): string {
  return toSpans(ranges)
    .map((s) => `${formatTimeShort(s.range.from)}–${formatTimeShort(s.range.to)}`)
    .join(' & ');
}

/** '11 am – 4 pm' for a single range; split days use the compact form. */
export function formatRangesLong(ranges: TimeRange[]): string {
  const spans = toSpans(ranges);
  if (spans.length !== 1) return formatRangesCompact(ranges);
  return `${formatTime(spans[0].range.from)} – ${formatTime(spans[0].range.to)}`;
}

export type HoursRow = { label: string; value: string; closed: boolean };

/** Rows for the “Come find the cauldron” list: Tue – Thu · Friday · Saturday · Sun & Mon. */
export function weeklyHoursRows(week: WeekHours): HoursRow[] {
  return groupWeek(week).map((group) => {
    const closed = !isOpenDay(group.hours);
    return {
      label: groupLabel(group.days, 'long'),
      value: closed ? 'closed' : formatRangesLong(group.hours.ranges),
      closed,
    };
  });
}

function summarize(week: WeekHours) {
  const groups = groupWeek(week);
  const order = groups.flatMap((g) => g.days);
  const openDays = order.filter((d) => isOpenDay(week[d]));
  if (!openDays.length) return null;

  // The hours most open days share become the headline; other open days are exceptions.
  const counts = new Map<string, number>();
  for (const d of openDays)
    counts.set(signature(week[d]), (counts.get(signature(week[d])) ?? 0) + 1);
  let mainKey = signature(week[openDays[0]]);
  for (const [key, count] of counts) if (count > (counts.get(mainKey) ?? 0)) mainKey = key;
  const mainDay = openDays.find((d) => signature(week[d]) === mainKey) ?? openDays[0];
  const mainSpans = toSpans(week[mainDay].ranges);

  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  return {
    first,
    last,
    span: first === last ? DAY_ABBR[first] : `${DAY_ABBR[first]} – ${DAY_ABBR[last]}`,
    mainSpans,
    exceptions: groups
      .filter((g) => isOpenDay(g.hours) && signature(g.hours) !== mainKey)
      .map((g) => `${groupLabel(g.days, 'short')} ${formatRangesCompact(g.hours.ranges)}`),
    closedDays: order.filter((d) => !isOpenDay(week[d])),
    earliest: openDays
      .map((d) => toSpans(week[d].ranges)[0])
      .reduce((a, b) => (b.from < a.from ? b : a)).range.from,
  };
}

/** The hours ribbon: { headline: 'Tue – Sat, 11 to 4', detail: 'Fri 11–2:30 & 4:30–7 · closed Sun & Mon' } */
export function hoursRibbon(week: WeekHours): { headline: string; detail: string } {
  const s = summarize(week);
  if (!s) return { headline: 'Closed for now', detail: 'check back soon' };
  const main =
    s.mainSpans.length === 1
      ? `${formatTimeShort(s.mainSpans[0].range.from)} to ${formatTimeShort(s.mainSpans[0].range.to)}`
      : formatRangesCompact(s.mainSpans.map((x) => x.range));
  const closed = s.closedDays.length
    ? `closed ${joinNaturally(s.closedDays.map((d) => DAY_ABBR[d]))}`
    : '';
  return {
    headline: `${s.span}, ${main}`,
    detail: [...s.exceptions, closed].filter(Boolean).join(' · '),
  };
}

/** The footer line: 'Tue – Sat 11 am – 4 pm · Fri 11–2:30 & 4:30–7' */
export function hoursFooterLine(week: WeekHours): string {
  const s = summarize(week);
  if (!s) return 'Closed for now';
  return [`${s.span} ${formatRangesLong(s.mainSpans.map((x) => x.range))}`, ...s.exceptions].join(
    ' · ',
  );
}

/** 'Tuesday to Saturday from 11', or null when the shop has no open days. */
export function openingSummary(week: WeekHours): string | null {
  const s = summarize(week);
  if (!s) return null;
  const days =
    s.first === s.last ? DAY_NAMES[s.first] : `${DAY_NAMES[s.first]} to ${DAY_NAMES[s.last]}`;
  return `${days} from ${formatTimeShort(s.earliest)}`;
}

/** Help text on the dashboard: 'Fridays already have one, from 2:30 to 4:30.' */
export function breakHint(week: WeekHours): string {
  for (const key of WEEK_ORDER) {
    const spans = week[key].open ? toSpans(week[key].ranges) : [];
    if (spans.length > 1) {
      return `${DAY_NAMES[key]}s already have one, from ${formatTimeShort(spans[0].range.to)} to ${formatTimeShort(spans[1].range.from)}.`;
    }
  }
  return 'Use the + beside any day’s hours to add one.';
}

/* ---------- dashboard dates ---------- */

/** 'Thursday, November 19' in Toronto */
export function formatDateLabel(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
}

export function greetingFor(now: Date): string {
  const hour = zonedNow(now).minutes / 60;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** '2026-12-25' → 'Fri, Dec. 25' */
export function formatSpecialDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return 'Date to be set';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
