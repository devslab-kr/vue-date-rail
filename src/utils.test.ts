import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  addDays,
  addMonths,
  clampDate,
  dateKey,
  generateDates,
  generateMonths,
  isSameDay,
  isSameMonth,
  monthKey,
  startOfDay,
  startOfMonth,
} from './utils';

const fcDate = fc.date({
  min: new Date(1900, 0, 1),
  max: new Date(2200, 0, 1),
  noInvalidDate: true,
});

describe('startOfDay / startOfMonth', () => {
  // 주의: "시각이 정확히 00:00"은 단언하지 않는다 — 자정에 DST가 시작되는 날
  // (한국 1950년대, 브라질 등)은 자정이 존재하지 않아 setHours(0,…)이 01:00을 반환한다.
  // 계약은 "같은 날의 가장 이른 시각으로의 멱등 정규화"다.
  it('같은 날 안에서 멱등하게 정규화한다', () => {
    fc.assert(
      fc.property(fcDate, (d) => {
        const s = startOfDay(d);
        expect(isSameDay(s, d)).toBe(true);
        expect(s.getTime()).toBeLessThanOrEqual(d.getTime());
        // 멱등: 한 번 정규화한 값을 다시 정규화해도 같다
        expect(startOfDay(s).getTime()).toBe(s.getTime());
        // 같은 날의 어떤 시각을 넣어도 같은 결과가 나온다 (키 안정성)
        expect(dateKey(s)).toBe(dateKey(d));
      })
    );
  });

  it('월 1일로 멱등하게 정규화한다', () => {
    fc.assert(
      fc.property(fcDate, (d) => {
        const s = startOfMonth(d);
        expect(s.getDate()).toBe(1);
        expect(isSameMonth(s, d)).toBe(true);
        expect(startOfMonth(s).getTime()).toBe(s.getTime());
      })
    );
  });

  it('원본을 변형하지 않는다', () => {
    const d = new Date(2026, 6, 25, 13, 45);
    startOfDay(d);
    startOfMonth(d);
    addDays(d, 5);
    addMonths(d, 5);
    expect(d.getTime()).toBe(new Date(2026, 6, 25, 13, 45).getTime());
  });
});

describe('addMonths', () => {
  it('월말 오버플로 없이 항상 월 1일을 반환한다', () => {
    // 1/31 + 1개월이 3/3이 되면 안 된다
    const d = addMonths(new Date(2026, 0, 31), 1);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(1);
  });

  it('연도 경계를 넘는다', () => {
    const d = addMonths(new Date(2026, 11, 15), 1);
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(0);
  });
});

describe('dateKey / monthKey', () => {
  it('dateKey는 YYYY-MM-DD 형식이다', () => {
    fc.assert(
      fc.property(fcDate, (d) => {
        expect(dateKey(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      })
    );
  });

  it('같은 날이면 시각과 무관하게 같은 키를 만든다', () => {
    expect(dateKey(new Date(2026, 6, 25, 0, 0))).toBe(dateKey(new Date(2026, 6, 25, 23, 59)));
    expect(dateKey(new Date(2026, 6, 25))).toBe('2026-07-25');
    expect(monthKey(new Date(2026, 6, 25))).toBe('2026-07');
  });
});

describe('clampDate', () => {
  it('min/max 범위로 잘라낸다', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    expect(clampDate(new Date(2026, 0, 5), min, max).getTime()).toBe(min.getTime());
    expect(clampDate(new Date(2026, 0, 25), min, max).getTime()).toBe(max.getTime());
    expect(clampDate(new Date(2026, 0, 15), min, max).getDate()).toBe(15);
  });

  it('경계가 없으면 그대로 반환한다', () => {
    const d = new Date(2026, 0, 15);
    expect(clampDate(d).getTime()).toBe(d.getTime());
  });
});

describe('generateDates', () => {
  it('n일 범위는 n+1개의 연속된 날짜를 만든다', () => {
    fc.assert(
      fc.property(fcDate, fc.integer({ min: 0, max: 400 }), (start, n) => {
        const dates = generateDates(start, addDays(start, n));
        expect(dates).toHaveLength(n + 1);
        expect(isSameDay(dates[0], start)).toBe(true);
        for (let i = 1; i < dates.length; i++) {
          // DST가 있어도 달력상 하루 차이여야 한다
          expect(isSameDay(dates[i], addDays(dates[i - 1], 1))).toBe(true);
          // 각 항목은 정규화 완료 상태여야 한다 (멱등)
          expect(startOfDay(dates[i]).getTime()).toBe(dates[i].getTime());
        }
      })
    );
  });

  it('start > end면 빈 배열을 반환한다', () => {
    const today = new Date();
    expect(generateDates(addDays(today, 1), today)).toHaveLength(0);
  });
});

describe('generateMonths', () => {
  it('n개월 범위는 n+1개의 연속된 월을 만든다', () => {
    fc.assert(
      fc.property(fcDate, fc.integer({ min: 0, max: 48 }), (start, n) => {
        const months = generateMonths(start, addMonths(start, n));
        expect(months).toHaveLength(n + 1);
        for (let i = 1; i < months.length; i++) {
          expect(isSameMonth(months[i], addMonths(months[i - 1], 1))).toBe(true);
          expect(months[i].getDate()).toBe(1);
        }
      })
    );
  });
});
