import type { RailFormatters } from './types';

/**
 * Intl 기반 기본 포매터 생성. locale만 넘기면 모든 언어를 커버하고,
 * overrides로 개별 포매터를 교체할 수 있다.
 */
export function createFormatters(
  locale = 'en',
  overrides: Partial<RailFormatters> = {}
): RailFormatters {
  const month = new Intl.DateTimeFormat(locale, { month: 'short' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  const monthLong = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const defaults: RailFormatters = {
    month: (date) => month.format(date),
    weekday: (date) => weekday.format(date),
    day: (date) => String(date.getDate()),
    monthLabel: (date) => monthLong.format(date),
    cellAriaLabel: (date, isToday) =>
      isToday ? `${full.format(date)} (${relative.format(0, 'day')})` : full.format(date),
  };

  const merged: RailFormatters = { ...defaults };
  for (const key of Object.keys(overrides) as (keyof RailFormatters)[]) {
    const fn = overrides[key];
    if (fn) merged[key] = fn as never;
  }
  return merged;
}
