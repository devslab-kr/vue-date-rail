# @devslab/vue-date-rail

[![npm](https://img.shields.io/npm/v/%40devslab%2Fvue-date-rail)](https://www.npmjs.com/package/@devslab/vue-date-rail)
[![CI](https://github.com/devslab-kr/vue-date-rail/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/vue-date-rail/actions/workflows/ci.yml)
![Vue 3](https://img.shields.io/badge/Vue-3.3+-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue)](./LICENSE)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/devslab-kr/vue-date-rail?file=demo%2FApp.vue&startScript=dev:demo)

**[Live demo](https://devslab-kr.github.io/vue-date-rail/)** · **[Edit on StackBlitz](https://stackblitz.com/github/devslab-kr/vue-date-rail?file=demo%2FApp.vue&startScript=dev:demo)**

Horizontal **infinite-scroll date rail** (day / month strip) picker for Vue 3. Built for mobile-first apps — delivery tracking, booking, scheduling — where a horizontally scrollable strip of days beats a calendar popup.

[한국어 README](./README.ko.md)

## Features

- **Infinite scroll** — days load on demand as you scroll toward either end, with scroll-position compensation (no visual jump when past dates are prepended)
- **`<DateRail>` + `<MonthRail>`** — day strip and month strip, sharing one theming system
- **Headless core** — the infinite-scroll logic is exposed as a `useDateRail()` composable; bring your own markup if the default cells don't fit
- **i18n via `Intl`** — pass any BCP 47 locale (`ko`, `en`, `ja`, `de`, `ar`, …); no locale files to import
- **min/max dates & disabled dates** — range clamping stops the infinite scroll at the boundary
- **Marker slot** — render event dots/badges under any date cell
- **Keyboard navigation** — `←` / `→` move a day (month), `Home` jumps to today
- **Desktop-friendly scrolling** — vertical mouse wheel is translated to horizontal scroll, and mouse drag-to-scroll works out of the box (touch uses native scrolling)
- **Themeable** — plain CSS custom properties (`--vdr-*`), no preprocessor, dark-mode friendly
- **Tailwind-ready** — `unstyled` + `cellClass` props and `data-selected` / `data-today` / `data-disabled` attributes for utility-CSS styling
- **Zero dependencies** — only `vue` as a peer dependency

## Install

```bash
npm install @devslab/vue-date-rail
```

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DateRail } from '@devslab/vue-date-rail';
import '@devslab/vue-date-rail/style.css';

const date = ref(new Date());
</script>

<template>
  <DateRail v-model="date" locale="ko" />
</template>
```

Or register globally:

```ts
import { DateRailPlugin } from '@devslab/vue-date-rail';
app.use(DateRailPlugin); // registers <DateRail> and <MonthRail>
```

## `<DateRail>`

```vue
<DateRail
  v-model="date"
  locale="en"
  :initial-past-days="30"
  :initial-future-days="30"
  :load-more-days="14"
  :min-date="minDate"
  :max-date="maxDate"
  :disabled-date="(d) => d.getDay() === 0"
>
  <template #marker="{ date }">
    <span v-if="hasEvent(date)" class="dot" />
  </template>
</DateRail>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `Date` | — (required) | Selected date (`v-model`). Emitted normalized to local midnight. |
| `locale` | `string` | `'en'` | BCP 47 locale for `Intl`-based labels. |
| `formatters` | `Partial<RailFormatters>` | — | Override individual label formatters. |
| `initialPastDays` | `number` | `30` | Days rendered before today on init. |
| `initialFutureDays` | `number` | `30` | Days rendered after today on init. |
| `loadMoreDays` | `number` | `14` | Days appended per infinite-scroll load. |
| `minDate` / `maxDate` | `Date` | — | Clamp the scrollable/selectable range. |
| `disabledDate` | `(date: Date) => boolean` | — | Disable individual dates. |
| `autoScroll` | `boolean` | `true` | Auto-center the selected cell when `modelValue` changes. |
| `showMonth` | `boolean` | `true` | Show the month line in each cell (e.g. "Jul"). |
| `showWeekday` | `boolean` | `true` | Show the weekday line in each cell (e.g. "Tue"). |
| `ariaLabel` | `string` | `'Select date'` | Accessible label for the rail. |
| `unstyled` | `boolean` | `false` | Skip default visual styles (structure only) for utility-CSS styling. |
| `cellClass` | `string \| (ctx) => string` | — | Extra classes per cell; the function receives `{ date, selected, today, disabled }`. |

### Events

| Event | Payload | |
|---|---|---|
| `update:modelValue` | `Date` | `v-model` update (local midnight) |
| `change` | `Date` | Fired alongside `update:modelValue` |

### Slots

| Slot | Props | Description |
|---|---|---|
| `cell` | `{ date, selected, today, disabled }` | Replace the entire cell content. |
| `marker` | `{ date }` | Rendered under the day number — event dots, badges. |

### Exposed methods

| Method | Description |
|---|---|
| `scrollToSelected(behavior?)` | Center the selected cell. |
| `scrollToToday()` | Select today (emits `update:modelValue`) and center it. |
| `reset()` | Regenerate the range around the current `modelValue`. |

## `<MonthRail>`

```vue
<MonthRail
  v-model="month"
  locale="ko"
  :past-months="12"
  :future-months="12"
/>
```

`modelValue` is always emitted normalized to the first of the month. If `modelValue` falls outside the `pastMonths`/`futureMonths` window, the range extends automatically. Slot `item` (`{ month, selected, current }`) replaces the pill content.

## Headless: `useDateRail()`

All the infinite-scroll mechanics without the default markup:

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useDateRail, dateKey } from '@devslab/vue-date-rail';

const { containerRef, dates, handleScroll, initialize } =
  useDateRail({ initialPastDays: 14, loadMoreDays: 7 });

onMounted(() => initialize());
</script>

<template>
  <div
    ref="containerRef"
    style="display: flex; overflow-x: auto"
    @scroll.passive="handleScroll"
  >
    <button v-for="d in dates" :key="dateKey(d)" :data-vdr-key="dateKey(d)">
      {{ d.getDate() }}
    </button>
  </div>
</template>
```

> Cells must carry `data-vdr-key="YYYY-MM-DD"` (use the exported `dateKey`) for `scrollToDate` to find them.

## Theming

Override CSS custom properties on any ancestor (all have built-in fallbacks):

```css
.my-app {
  --vdr-accent: #4f82b5; /* selected / today / focus */
  --vdr-accent-hover: #416d99;
  --vdr-cell-bg: #f4f5f7;
  --vdr-cell-hover-bg: #e8eaee;
  --vdr-text: #1f2937;
  --vdr-text-selected: #ffffff;
  --vdr-today-bg: #eef4fa;
  --vdr-radius: 12px;
  --vdr-gap: 8px;
  --vdr-cell-min-width: 56px;
  --vdr-fs-day: 1.25rem;
  --vdr-month-border: #d6d9de; /* MonthRail pill */
}
```

Dark mode is just another set of overrides — see [demo/App.vue](./demo/App.vue).

### Tailwind CSS (and friends)

Every cell exposes `data-selected` / `data-today` / `data-disabled` attributes, so you can style states with Tailwind's `data-*` variants. Combine with `unstyled` to drop the default look entirely:

```vue
<DateRail
  v-model="date"
  unstyled
  cell-class="flex flex-col items-center min-w-14 rounded-xl px-2 py-2
    bg-gray-100 hover:bg-gray-200
    data-selected:bg-blue-600 data-selected:text-white
    data-today:ring-2 data-today:ring-blue-400
    data-disabled:opacity-30"
/>
```

Or compute classes per state with a function: `:cell-class="({ selected }) => selected ? '...' : '...'"`. `<MonthRail>` offers the same via `unstyled` + `item-class` and `data-selected` / `data-current`. This works the same way with UnoCSS or any attribute-variant utility framework.

## Family

- [vue-month-spinner-picker](https://github.com/jlc488/vue-month-spinner-picker) — iOS-style drum-roll month picker (bottom sheet), the modal sibling of `<MonthRail>`
- More open source from [devslab](https://github.com/devslab-kr)

## License

[Apache-2.0](./LICENSE)
