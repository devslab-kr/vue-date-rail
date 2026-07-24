import { describe, expect, it } from 'vitest';
import { useDateRail } from './useDateRail';
import { addDays, dateKey, isSameDay, startOfDay } from '../utils';

describe('useDateRail', () => {
  it('기본 옵션으로 오늘 중심 61일을 생성한다', () => {
    const rail = useDateRail();
    rail.initialize();

    expect(rail.dates.value).toHaveLength(61);
    const today = startOfDay(new Date());
    expect(isSameDay(rail.dates.value[30], today)).toBe(true);
    expect(isSameDay(rail.rangeStart.value, addDays(today, -30))).toBe(true);
    expect(isSameDay(rail.rangeEnd.value, addDays(today, 30))).toBe(true);
  });

  it('loadPast는 loadMoreDays만큼 앞에 추가한다', async () => {
    const rail = useDateRail({ loadMoreDays: 14 });
    rail.initialize();
    const oldStart = rail.rangeStart.value;

    await rail.loadPast();

    expect(rail.dates.value).toHaveLength(61 + 14);
    expect(isSameDay(rail.rangeStart.value, addDays(oldStart, -14))).toBe(true);
    expect(isSameDay(rail.dates.value[0], rail.rangeStart.value)).toBe(true);
  });

  it('loadFuture는 loadMoreDays만큼 뒤에 추가한다', async () => {
    const rail = useDateRail({ loadMoreDays: 7 });
    rail.initialize();
    const oldEnd = rail.rangeEnd.value;

    await rail.loadFuture();

    expect(rail.dates.value).toHaveLength(61 + 7);
    expect(isSameDay(rail.rangeEnd.value, addDays(oldEnd, 7))).toBe(true);
  });

  it('minDate에 도달하면 더 이상 과거를 로드하지 않는다', async () => {
    const today = startOfDay(new Date());
    const min = addDays(today, -5);
    const rail = useDateRail({ minDate: min, loadMoreDays: 14 });
    rail.initialize();

    // 초기 범위부터 minDate로 잘려 있어야 한다
    expect(isSameDay(rail.rangeStart.value, min)).toBe(true);
    expect(rail.canLoadPast.value).toBe(false);

    const before = rail.dates.value.length;
    await rail.loadPast();
    expect(rail.dates.value).toHaveLength(before);
  });

  it('maxDate에 도달하면 더 이상 미래를 로드하지 않는다', async () => {
    const today = startOfDay(new Date());
    const max = addDays(today, 3);
    const rail = useDateRail({ maxDate: max });
    rail.initialize();

    expect(isSameDay(rail.rangeEnd.value, max)).toBe(true);
    expect(rail.canLoadFuture.value).toBe(false);
  });

  it('loadPast는 minDate를 넘어가지 않게 잘라서 로드한다', async () => {
    const today = startOfDay(new Date());
    const min = addDays(today, -35);
    const rail = useDateRail({ minDate: min, loadMoreDays: 14 });
    rail.initialize();

    // 오늘-30 시작 → 14일 더 로드하면 -44지만 min(-35)에서 잘린다
    await rail.loadPast();
    expect(isSameDay(rail.rangeStart.value, min)).toBe(true);
    expect(rail.canLoadPast.value).toBe(false);
  });

  it('ensureInRange는 범위 밖 날짜까지 확장한다', () => {
    const rail = useDateRail();
    rail.initialize();

    const far = addDays(startOfDay(new Date()), 90);
    rail.ensureInRange(far);

    expect(isSameDay(rail.rangeEnd.value, far)).toBe(true);
    expect(rail.dates.value.map(dateKey)).toContain(dateKey(far));

    const past = addDays(startOfDay(new Date()), -90);
    rail.ensureInRange(past);
    expect(isSameDay(rail.rangeStart.value, past)).toBe(true);
    expect(rail.dates.value[0].getTime()).toBe(past.getTime());
  });

  it('reset은 지정한 날짜 중심으로 범위를 재생성한다', async () => {
    const rail = useDateRail({ initialPastDays: 10, initialFutureDays: 10 });
    rail.initialize();
    await rail.loadFuture();

    const center = addDays(startOfDay(new Date()), 100);
    await rail.reset(center);

    expect(rail.dates.value).toHaveLength(21);
    expect(isSameDay(rail.dates.value[10], center)).toBe(true);
  });
});
