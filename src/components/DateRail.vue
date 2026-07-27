<template>
  <div class="vdr" role="group" :aria-label="ariaLabel">
    <div
      ref="containerRef"
      class="vdr__scroller"
      @scroll.passive="handleScroll"
      @keydown="onKeydown"
      @wheel="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click.capture="onClickCapture"
    >
      <button
        v-for="date in dates"
        :key="dateKey(date)"
        type="button"
        :class="cellClasses(date)"
        :data-vdr-key="dateKey(date)"
        :data-selected="isSelected(date) || undefined"
        :data-today="isToday(date) || undefined"
        :data-disabled="isDisabled(date) || undefined"
        :disabled="isDisabled(date)"
        :aria-pressed="isSelected(date)"
        :aria-current="isToday(date) ? 'date' : undefined"
        :aria-label="fmt.cellAriaLabel(date, isToday(date))"
        @click="select(date)"
      >
        <slot
          name="cell"
          :date="date"
          :selected="isSelected(date)"
          :today="isToday(date)"
          :disabled="isDisabled(date)"
        >
          <span v-if="showMonth" class="vdr__month">{{ fmt.month(date) }}</span>
          <span v-if="showWeekday" class="vdr__weekday">{{ fmt.weekday(date) }}</span>
          <span class="vdr__day">{{ fmt.day(date) }}</span>
          <span class="vdr__marker">
            <slot name="marker" :date="date" />
          </span>
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import type { DateRailProps, RailCellContext } from '../types';
import { createFormatters } from '../formatters';
import { useDateRail } from '../composables/useDateRail';
import { useDragScroll } from '../composables/useDragScroll';
import { addDays, clampDate, dateKey, isSameDay, startOfDay } from '../utils';

const props = withDefaults(defineProps<DateRailProps>(), {
  locale: 'en',
  initialPastDays: 30,
  initialFutureDays: 30,
  loadMoreDays: 14,
  autoScroll: true,
  showMonth: true,
  showWeekday: true,
  ariaLabel: 'Select date',
});

const emit = defineEmits<{
  'update:modelValue': [date: Date];
  change: [date: Date];
}>();

const fmt = computed(() => createFormatters(props.locale, props.formatters));

const {
  containerRef,
  dates,
  initialize,
  handleScroll,
  ensureInRange,
  scrollToDate,
  reset: resetRail,
} = useDateRail({
  initialPastDays: props.initialPastDays,
  initialFutureDays: props.initialFutureDays,
  loadMoreDays: props.loadMoreDays,
  minDate: props.minDate,
  maxDate: props.maxDate,
});

const isSelected = (date: Date) => isSameDay(date, props.modelValue);
const isToday = (date: Date) => isSameDay(date, new Date());

const isDisabled = (date: Date) => {
  if (props.minDate && startOfDay(date) < startOfDay(props.minDate)) return true;
  if (props.maxDate && startOfDay(date) > startOfDay(props.maxDate)) return true;
  return props.disabledDate ? props.disabledDate(date) : false;
};

const { onWheel, onPointerDown, onPointerMove, onPointerUp, onClickCapture } =
  useDragScroll(containerRef);

const cellClasses = (date: Date) => {
  const ctx: RailCellContext = {
    date,
    selected: isSelected(date),
    today: isToday(date),
    disabled: isDisabled(date),
  };
  const extra = typeof props.cellClass === 'function' ? props.cellClass(ctx) : props.cellClass;
  if (props.unstyled) return extra;
  return [
    'vdr__cell',
    {
      'vdr__cell--selected': ctx.selected,
      'vdr__cell--today': ctx.today,
    },
    extra,
  ];
};

const select = (date: Date) => {
  if (isDisabled(date)) return;
  const normalized = startOfDay(date);
  emit('update:modelValue', normalized);
  emit('change', normalized);
};

const onKeydown = (event: KeyboardEvent) => {
  let next: Date | null = null;
  if (event.key === 'ArrowLeft') next = addDays(props.modelValue, -1);
  else if (event.key === 'ArrowRight') next = addDays(props.modelValue, 1);
  else if (event.key === 'Home') next = new Date();
  if (!next) return;

  event.preventDefault();
  next = clampDate(startOfDay(next), props.minDate && startOfDay(props.minDate), props.maxDate && startOfDay(props.maxDate));
  if (!isDisabled(next)) select(next);
};

/** 선택된 날짜 셀을 중앙으로 스크롤 */
const scrollToSelected = async (behavior: ScrollBehavior = 'smooth') => {
  ensureInRange(props.modelValue);
  await scrollToDate(startOfDay(props.modelValue), behavior);
};

/** 오늘을 선택하고 중앙으로 스크롤 */
const scrollToToday = () => {
  select(new Date());
};

/** 오늘 기준으로 날짜 범위를 재생성하고 선택 셀로 스크롤 */
const reset = async () => {
  await resetRail(props.modelValue);
};

watch(
  () => props.modelValue,
  async () => {
    if (!props.autoScroll) return;
    await scrollToSelected();
  }
);

// 날짜 생성은 DOM이 필요 없으므로 setup에서 즉시 실행 (초기 렌더부터 셀이 존재)
initialize(props.modelValue);
ensureInRange(props.modelValue);

onMounted(async () => {
  await scrollToDate(startOfDay(props.modelValue), 'auto');
});

defineExpose({ scrollToSelected, scrollToToday, reset });
</script>

<style scoped>
.vdr {
  width: 100%;
}

.vdr__scroller {
  display: flex;
  gap: var(--vdr-gap, 8px);
  overflow-x: auto;
  padding: var(--vdr-padding, 8px 4px);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vdr__scroller::-webkit-scrollbar {
  display: none;
}

.vdr__cell {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: var(--vdr-cell-min-width, 56px);
  padding: var(--vdr-cell-padding, 8px 6px);
  border: 2px solid var(--vdr-cell-border, transparent);
  border-radius: var(--vdr-radius, 12px);
  background: var(--vdr-cell-bg, #f4f5f7);
  color: var(--vdr-text, #1f2937);
  font: inherit;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.vdr__cell:hover:not(:disabled):not(.vdr__cell--selected) {
  background: var(--vdr-cell-hover-bg, #e8eaee);
}

.vdr__cell:focus-visible {
  outline: 2px solid var(--vdr-accent, #3b82f6);
  outline-offset: 2px;
}

.vdr__cell:disabled {
  opacity: 0.35;
  cursor: default;
}

.vdr__cell--today {
  border-color: var(--vdr-accent, #3b82f6);
  background: var(--vdr-today-bg, var(--vdr-cell-bg, #f4f5f7));
}

.vdr__cell--selected {
  background: var(--vdr-accent, #3b82f6);
  color: var(--vdr-text-selected, #ffffff);
}

.vdr__cell--selected:hover {
  background: var(--vdr-accent-hover, var(--vdr-accent, #3b82f6));
}

.vdr__month {
  font-size: var(--vdr-fs-month, 0.625rem);
  opacity: 0.7;
}

.vdr__weekday {
  font-size: var(--vdr-fs-weekday, 0.75rem);
  font-weight: 500;
}

.vdr__day {
  font-size: var(--vdr-fs-day, 1.25rem);
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.vdr__marker {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 6px;
}
</style>
