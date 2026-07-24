<template>
  <div class="vmr" role="group" :aria-label="ariaLabel">
    <div
      ref="containerRef"
      class="vmr__scroller"
      @keydown="onKeydown"
      @wheel="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click.capture="onClickCapture"
    >
      <button
        v-for="month in months"
        :key="monthKey(month)"
        type="button"
        :class="itemClasses(month)"
        :data-vmr-key="monthKey(month)"
        :data-selected="isSelected(month) || undefined"
        :data-current="isCurrent(month) || undefined"
        :aria-pressed="isSelected(month)"
        :aria-current="isCurrent(month) ? 'date' : undefined"
        @click="select(month)"
      >
        <slot name="item" :month="month" :selected="isSelected(month)" :current="isCurrent(month)">
          {{ fmt.monthLabel(month) }}
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { MonthItemContext, MonthRailProps } from '../types';
import { createFormatters } from '../formatters';
import { useDragScroll } from '../composables/useDragScroll';
import { addMonths, generateMonths, isSameMonth, monthKey, startOfMonth } from '../utils';

const props = withDefaults(defineProps<MonthRailProps>(), {
  locale: 'en',
  pastMonths: 12,
  futureMonths: 12,
  autoScroll: true,
  ariaLabel: 'Select month',
});

const emit = defineEmits<{
  'update:modelValue': [month: Date];
  change: [month: Date];
}>();

const fmt = computed(() => createFormatters(props.locale, props.formatters));

const containerRef = ref<HTMLElement | null>(null);

/** 오늘 기준 past/future 범위에 modelValue가 밖이면 그쪽으로 범위를 확장한다 */
const months = computed(() => {
  const currentMonth = startOfMonth(new Date());
  const selectedMonth = startOfMonth(props.modelValue);
  let start = addMonths(currentMonth, -props.pastMonths);
  let end = addMonths(currentMonth, props.futureMonths);
  if (selectedMonth < start) start = selectedMonth;
  if (selectedMonth > end) end = selectedMonth;
  return generateMonths(start, end);
});

const isSelected = (month: Date) => isSameMonth(month, props.modelValue);
const isCurrent = (month: Date) => isSameMonth(month, new Date());

const { onWheel, onPointerDown, onPointerMove, onPointerUp, onClickCapture } =
  useDragScroll(containerRef);

const itemClasses = (month: Date) => {
  const ctx: MonthItemContext = {
    month,
    selected: isSelected(month),
    current: isCurrent(month),
  };
  const extra = typeof props.itemClass === 'function' ? props.itemClass(ctx) : props.itemClass;
  if (props.unstyled) return extra;
  return [
    'vmr__item',
    {
      'vmr__item--selected': ctx.selected,
      'vmr__item--current': ctx.current,
    },
    extra,
  ];
};

const select = (month: Date) => {
  const normalized = startOfMonth(month);
  emit('update:modelValue', normalized);
  emit('change', normalized);
};

const onKeydown = (event: KeyboardEvent) => {
  let next: Date | null = null;
  if (event.key === 'ArrowLeft') next = addMonths(props.modelValue, -1);
  else if (event.key === 'ArrowRight') next = addMonths(props.modelValue, 1);
  else if (event.key === 'Home') next = startOfMonth(new Date());
  if (!next) return;

  event.preventDefault();
  select(next);
};

const scrollToSelected = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick();
  const el = containerRef.value;
  if (!el || typeof el.scrollTo !== 'function') return;

  const target = el.querySelector<HTMLElement>(
    `[data-vmr-key="${monthKey(props.modelValue)}"]`
  );
  if (!target) return;

  const left = target.offsetLeft - el.clientWidth / 2 + target.offsetWidth / 2;
  el.scrollTo({ left, behavior });
};

watch(
  () => props.modelValue,
  async () => {
    if (!props.autoScroll) return;
    await scrollToSelected();
  }
);

onMounted(async () => {
  await scrollToSelected('auto');
});

defineExpose({ scrollToSelected });
</script>

<style scoped>
.vmr {
  width: 100%;
}

.vmr__scroller {
  display: flex;
  gap: var(--vdr-gap, 8px);
  overflow-x: auto;
  padding: var(--vdr-padding, 4px 4px);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vmr__scroller::-webkit-scrollbar {
  display: none;
}

.vmr__item {
  flex: 0 0 auto;
  padding: var(--vdr-month-padding, 10px 18px);
  border: 1px solid var(--vdr-month-border, #d6d9de);
  border-radius: var(--vdr-month-radius, 999px);
  background: var(--vdr-cell-bg, #ffffff);
  color: var(--vdr-text, #1f2937);
  font: inherit;
  font-size: var(--vdr-fs-month-item, 0.875rem);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.vmr__item:hover:not(.vmr__item--selected) {
  background: var(--vdr-cell-hover-bg, #e8eaee);
}

.vmr__item:focus-visible {
  outline: 2px solid var(--vdr-accent, #3b82f6);
  outline-offset: 2px;
}

.vmr__item--current {
  border-color: var(--vdr-accent, #3b82f6);
}

.vmr__item--selected {
  background: var(--vdr-accent, #3b82f6);
  color: var(--vdr-text-selected, #ffffff);
  border-color: var(--vdr-accent, #3b82f6);
}

.vmr__item--selected:hover {
  background: var(--vdr-accent-hover, var(--vdr-accent, #3b82f6));
}
</style>
