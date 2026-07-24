import { computed, nextTick, ref, type Ref } from 'vue';
import type { UseDateRailOptions } from '../types';
import { addDays, clampDate, dateKey, generateDates, startOfDay } from '../utils';

export interface UseDateRailReturn {
  /** 가로 스크롤 컨테이너에 바인딩할 ref */
  containerRef: Ref<HTMLElement | null>;
  /** 현재 렌더 범위의 날짜 배열 (자정 정규화) */
  dates: Ref<Date[]>;
  rangeStart: Ref<Date>;
  rangeEnd: Ref<Date>;
  canLoadPast: Ref<boolean>;
  canLoadFuture: Ref<boolean>;
  /** center 기준으로 범위를 (재)생성한다 */
  initialize: (center?: Date) => void;
  loadPast: () => Promise<void>;
  loadFuture: () => Promise<void>;
  /** 컨테이너의 scroll 이벤트에 바인딩할 핸들러 (무한 스크롤 트리거) */
  handleScroll: () => void;
  /** 해당 날짜 셀이 범위 밖이면 범위를 확장한다 */
  ensureInRange: (date: Date) => void;
  /** 해당 날짜 셀을 컨테이너 중앙으로 스크롤한다 */
  scrollToDate: (date: Date, behavior?: ScrollBehavior) => Promise<void>;
  /** center 기준으로 리셋 후 해당 셀로 스크롤한다 */
  reset: (center?: Date) => Promise<void>;
}

export function useDateRail(options: UseDateRailOptions = {}): UseDateRailReturn {
  const {
    initialPastDays = 30,
    initialFutureDays = 30,
    loadMoreDays = 14,
    scrollThreshold = 100,
    cooldownMs = 300,
  } = options;
  const minDate = options.minDate ? startOfDay(options.minDate) : undefined;
  const maxDate = options.maxDate ? startOfDay(options.maxDate) : undefined;

  const containerRef = ref<HTMLElement | null>(null);
  const dates = ref<Date[]>([]);
  const rangeStart = ref<Date>(startOfDay(new Date()));
  const rangeEnd = ref<Date>(startOfDay(new Date()));

  const isLoading = ref(false);
  const cooldown = ref(false);

  const canLoadPast = computed(() => !minDate || rangeStart.value > minDate);
  const canLoadFuture = computed(() => !maxDate || rangeEnd.value < maxDate);

  function initialize(center: Date = new Date()) {
    const c = startOfDay(center);
    rangeStart.value = clampDate(addDays(c, -initialPastDays), minDate, maxDate);
    rangeEnd.value = clampDate(addDays(c, initialFutureDays), minDate, maxDate);
    dates.value = generateDates(rangeStart.value, rangeEnd.value);
  }

  async function loadPast() {
    if (isLoading.value || !canLoadPast.value) return;
    isLoading.value = true;

    // 왼쪽에 셀이 추가되면 그만큼 스크롤 위치를 보정해야 화면이 튀지 않는다
    const el = containerRef.value;
    const oldScrollLeft = el?.scrollLeft ?? 0;
    const oldScrollWidth = el?.scrollWidth ?? 0;

    const newStart = clampDate(addDays(rangeStart.value, -loadMoreDays), minDate, undefined);
    const prepended = generateDates(newStart, addDays(rangeStart.value, -1));
    dates.value = [...prepended, ...dates.value];
    rangeStart.value = startOfDay(newStart);

    await nextTick();
    if (el) {
      el.scrollLeft = oldScrollLeft + (el.scrollWidth - oldScrollWidth);
    }
    isLoading.value = false;
  }

  async function loadFuture() {
    if (isLoading.value || !canLoadFuture.value) return;
    isLoading.value = true;

    const newEnd = clampDate(addDays(rangeEnd.value, loadMoreDays), undefined, maxDate);
    dates.value = [...dates.value, ...generateDates(addDays(rangeEnd.value, 1), newEnd)];
    rangeEnd.value = startOfDay(newEnd);

    await nextTick();
    isLoading.value = false;
  }

  function handleScroll() {
    if (cooldown.value) return;
    const el = containerRef.value;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const nearStart = scrollLeft < scrollThreshold;
    const nearEnd = scrollLeft + clientWidth > scrollWidth - scrollThreshold;
    if (!nearStart && !nearEnd) return;

    cooldown.value = true;
    const job = nearStart ? loadPast() : loadFuture();
    job.finally(() => {
      setTimeout(() => {
        cooldown.value = false;
      }, cooldownMs);
    });
  }

  function ensureInRange(date: Date) {
    const d = startOfDay(clampDate(date, minDate, maxDate));
    if (d < rangeStart.value) {
      dates.value = [...generateDates(d, addDays(rangeStart.value, -1)), ...dates.value];
      rangeStart.value = d;
    } else if (d > rangeEnd.value) {
      dates.value = [...dates.value, ...generateDates(addDays(rangeEnd.value, 1), d)];
      rangeEnd.value = d;
    }
  }

  async function scrollToDate(date: Date, behavior: ScrollBehavior = 'smooth') {
    await nextTick();
    const el = containerRef.value;
    if (!el || typeof el.scrollTo !== 'function') return;

    const target = el.querySelector<HTMLElement>(`[data-vdr-key="${dateKey(date)}"]`);
    if (!target) return;

    const left = target.offsetLeft - el.clientWidth / 2 + target.offsetWidth / 2;
    el.scrollTo({ left, behavior });
  }

  async function reset(center: Date = new Date()) {
    initialize(center);
    await nextTick();
    await scrollToDate(startOfDay(clampDate(center, minDate, maxDate)), 'auto');
  }

  return {
    containerRef,
    dates,
    rangeStart,
    rangeEnd,
    canLoadPast,
    canLoadFuture,
    initialize,
    loadPast,
    loadFuture,
    handleScroll,
    ensureInRange,
    scrollToDate,
    reset,
  };
}
