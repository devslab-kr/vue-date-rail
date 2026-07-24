import type { App } from 'vue';
import DateRail from './components/DateRail.vue';
import MonthRail from './components/MonthRail.vue';

// Component exports
export { DateRail, MonthRail };
export default DateRail;

// Composable exports
export { useDateRail } from './composables/useDateRail';
export type { UseDateRailReturn } from './composables/useDateRail';
export { useDragScroll } from './composables/useDragScroll';

// Formatter exports
export { createFormatters } from './formatters';

// Type re-exports
export type {
  RailFormatters,
  DateRailProps,
  MonthRailProps,
  RailCellContext,
  MonthItemContext,
  UseDateRailOptions,
} from './types';

// Utility function exports
export {
  startOfDay,
  startOfMonth,
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  dateKey,
  monthKey,
  clampDate,
  generateDates,
  generateMonths,
} from './utils';

// Vue plugin
export const DateRailPlugin = {
  install(app: App) {
    app.component('DateRail', DateRail);
    app.component('MonthRail', MonthRail);
  },
};
