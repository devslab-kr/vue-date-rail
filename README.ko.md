# @devslab/vue-date-rail

[![npm](https://img.shields.io/npm/v/%40devslab%2Fvue-date-rail)](https://www.npmjs.com/package/@devslab/vue-date-rail)
[![CI](https://github.com/devslab-kr/vue-date-rail/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/vue-date-rail/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

Vue 3용 가로 **무한 스크롤 날짜 레일**(일/월 스트립) 피커. 배송 추적·예약·스케줄처럼 달력 팝업보다 가로로 스크롤하는 날짜 띠가 어울리는 모바일 퍼스트 앱을 위해 만들었습니다.

[English README](./README.md)

## 특징

- **무한 스크롤** — 양쪽 끝으로 스크롤하면 날짜가 이어서 로드되고, 과거 날짜가 앞에 붙을 때 스크롤 위치를 보정해 화면이 튀지 않습니다
- **`<DateRail>` + `<MonthRail>`** — 일 스트립과 월 스트립, 하나의 테마 시스템 공유
- **Headless 코어** — 무한 스크롤 로직을 `useDateRail()` composable로 노출, 기본 셀이 안 맞으면 마크업을 직접 구성 가능
- **`Intl` 기반 i18n** — BCP 47 로케일 문자열(`ko`, `en`, `ja`, `de`, `ar`, …)만 넘기면 끝, 로케일 파일 불필요
- **min/max·비활성 날짜** — 경계에 도달하면 무한 스크롤도 그 지점에서 멈춤
- **마커 슬롯** — 날짜 셀 아래에 이벤트 dot/뱃지 렌더링
- **키보드 내비게이션** — `←`/`→` 하루(한 달) 이동, `Home` 오늘로
- **데스크톱 스크롤 지원** — 세로 마우스 휠을 가로 스크롤로 변환, 마우스 드래그 스크롤 기본 제공 (터치는 네이티브 스크롤)
- **테마** — 순수 CSS 커스텀 속성(`--vdr-*`), 다크모드 친화적
- **Tailwind 대응** — `unstyled` + `cellClass` prop과 `data-selected`/`data-today`/`data-disabled` 속성으로 유틸리티 CSS 스타일링
- **의존성 제로** — peer dependency는 `vue`뿐

## 설치

```bash
npm install @devslab/vue-date-rail
```

## 빠른 시작

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

전역 등록:

```ts
import { DateRailPlugin } from '@devslab/vue-date-rail';
app.use(DateRailPlugin); // <DateRail>, <MonthRail> 등록
```

## `<DateRail>`

```vue
<DateRail
  v-model="date"
  locale="ko"
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

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `modelValue` | `Date` | — (필수) | 선택된 날짜(`v-model`). 로컬 자정으로 정규화되어 emit됩니다. |
| `locale` | `string` | `'en'` | `Intl` 라벨용 BCP 47 로케일. |
| `formatters` | `Partial<RailFormatters>` | — | 개별 라벨 포매터 오버라이드. |
| `initialPastDays` | `number` | `30` | 초기 렌더할 과거 일수. |
| `initialFutureDays` | `number` | `30` | 초기 렌더할 미래 일수. |
| `loadMoreDays` | `number` | `14` | 무한 스크롤 1회당 추가 일수. |
| `minDate` / `maxDate` | `Date` | — | 스크롤/선택 가능 범위 제한. |
| `disabledDate` | `(date: Date) => boolean` | — | 개별 날짜 비활성화. |
| `autoScroll` | `boolean` | `true` | `modelValue` 변경 시 선택 셀 자동 센터링. |
| `ariaLabel` | `string` | `'Select date'` | 레일의 접근성 라벨. |
| `unstyled` | `boolean` | `false` | 기본 비주얼 스타일을 끄고 구조만 남김 — 유틸리티 CSS용. |
| `cellClass` | `string \| (ctx) => string` | — | 셀에 추가할 클래스. 함수면 `{ date, selected, today, disabled }`를 받음. |

### 이벤트

| 이벤트 | 페이로드 | |
|---|---|---|
| `update:modelValue` | `Date` | `v-model` 갱신 (로컬 자정) |
| `change` | `Date` | `update:modelValue`와 함께 발생 |

### 슬롯

| 슬롯 | Props | 설명 |
|---|---|---|
| `cell` | `{ date, selected, today, disabled }` | 셀 내용 전체 교체. |
| `marker` | `{ date }` | 날짜 숫자 아래 렌더 — 이벤트 dot, 뱃지. |

### 노출 메서드

| 메서드 | 설명 |
|---|---|
| `scrollToSelected(behavior?)` | 선택 셀 센터링. |
| `scrollToToday()` | 오늘 선택(`update:modelValue` emit) 후 센터링. |
| `reset()` | 현재 `modelValue` 중심으로 범위 재생성. |

## `<MonthRail>`

```vue
<MonthRail v-model="month" locale="ko" :past-months="12" :future-months="12" />
```

`modelValue`는 항상 월 1일로 정규화되어 emit됩니다. `pastMonths`/`futureMonths` 범위 밖 값이 오면 범위가 자동 확장됩니다. `item` 슬롯(`{ month, selected, current }`)으로 pill 내용을 교체할 수 있습니다.

## Headless: `useDateRail()`

기본 마크업 없이 무한 스크롤 메커니즘만 사용:

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useDateRail, dateKey } from '@devslab/vue-date-rail';

const { containerRef, dates, handleScroll, scrollToDate, initialize } = useDateRail({
  initialPastDays: 14,
  loadMoreDays: 7,
});

onMounted(() => initialize());
</script>

<template>
  <div ref="containerRef" style="display: flex; overflow-x: auto" @scroll.passive="handleScroll">
    <button v-for="d in dates" :key="dateKey(d)" :data-vdr-key="dateKey(d)">
      {{ d.getDate() }}
    </button>
  </div>
</template>
```

> `scrollToDate`가 셀을 찾으려면 셀에 `data-vdr-key="YYYY-MM-DD"`(export된 `dateKey` 사용)가 있어야 합니다.

## 테마

상위 요소 어디서든 CSS 커스텀 속성을 오버라이드하면 됩니다 (전부 기본값 내장):

```css
.my-app {
  --vdr-accent: #4f82b5;          /* 선택 배경 / 오늘 테두리 / 포커스 링 */
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
  --vdr-month-border: #d6d9de;    /* MonthRail pill 테두리 */
}
```

다크모드도 오버라이드 한 세트일 뿐입니다 — [demo/App.vue](./demo/App.vue) 참고.

### Tailwind CSS (그리고 비슷한 것들)

모든 셀이 `data-selected`/`data-today`/`data-disabled` 속성을 노출하므로 Tailwind의 `data-*` variant로 상태를 스타일링할 수 있습니다. `unstyled`와 조합하면 기본 룩을 완전히 걷어냅니다:

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

상태별로 계산하려면 함수도 됩니다: `:cell-class="({ selected }) => selected ? '...' : '...'"`. `<MonthRail>`도 `unstyled` + `item-class`와 `data-selected`/`data-current`로 동일하게 지원합니다. UnoCSS 등 속성 variant를 지원하는 유틸리티 프레임워크라면 모두 같은 방식으로 동작합니다.

## Family

- [vue-month-spinner-picker](https://github.com/jlc488/vue-month-spinner-picker) — iOS 스타일 드럼롤 월 피커(바텀 시트), `<MonthRail>`의 모달 형제
- [devslab](https://github.com/devslab-kr)의 다른 오픈소스

## 라이선스

[Apache-2.0](./LICENSE)
