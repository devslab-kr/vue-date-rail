<template>
  <main class="demo" :data-theme="dark ? 'dark' : 'light'">
    <header class="demo__header">
      <div>
        <h1>@devslab/vue-date-rail</h1>
        <p class="demo__tagline">
          Horizontal infinite-scroll date rail picker for Vue 3
          · <a href="https://github.com/devslab-kr/vue-date-rail" target="_blank" rel="noopener">GitHub</a>
          · <a href="https://www.npmjs.com/package/@devslab/vue-date-rail" target="_blank" rel="noopener">npm</a>
        </p>
        <code class="demo__install">npm install @devslab/vue-date-rail</code>
      </div>
      <div class="demo__controls">
        <label>
          Locale
          <select v-model="locale">
            <option value="ko">ko</option>
            <option value="en">en</option>
            <option value="ja">ja</option>
            <option value="de">de</option>
            <option value="ar">ar</option>
          </select>
        </label>
        <label>
          <input v-model="dark" type="checkbox" />
          Dark
        </label>
      </div>
    </header>

    <section class="demo__section">
      <h2>DateRail — 기본</h2>
      <DateRail ref="railRef" v-model="selectedDate" :locale="locale" />
      <p class="demo__value">선택: {{ selectedDate.toDateString() }}</p>
      <button class="demo__btn" @click="railRef?.scrollToToday()">오늘로</button>
    </section>

    <section class="demo__section">
      <h2>DateRail — 마커 슬롯 + min/max</h2>
      <DateRail
        v-model="boundedDate"
        :locale="locale"
        :min-date="minDate"
        :max-date="maxDate"
      >
        <template #marker="{ date }">
          <span v-if="hasEvent(date)" class="demo__dot" />
        </template>
      </DateRail>
      <p class="demo__value">±10일 범위 제한, 3의 배수 날짜에 이벤트 dot</p>
    </section>

    <section class="demo__section">
      <h2>DateRail — 표시 옵션 (showMonth / showWeekday)</h2>
      <div class="demo__controls demo__controls--inline">
        <label>
          <input v-model="showMonth" type="checkbox" />
          월 표시
        </label>
        <label>
          <input v-model="showWeekday" type="checkbox" />
          요일 표시
        </label>
      </div>
      <DateRail
        v-model="compactDate"
        :locale="locale"
        :show-month="showMonth"
        :show-weekday="showWeekday"
      />
      <p class="demo__value">둘 다 끄면 날짜 숫자만 남는 컴팩트 레일</p>
    </section>

    <section class="demo__section">
      <h2>MonthRail</h2>
      <MonthRail v-model="selectedMonth" :locale="locale" />
      <p class="demo__value">선택: {{ selectedMonth.getFullYear() }}-{{ selectedMonth.getMonth() + 1 }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DateRail, MonthRail, addDays, startOfDay, startOfMonth } from '@devslab/vue-date-rail';

const locale = ref('ko');
const dark = ref(false);

const selectedDate = ref(startOfDay(new Date()));
const boundedDate = ref(startOfDay(new Date()));
const compactDate = ref(startOfDay(new Date()));
const showMonth = ref(true);
const showWeekday = ref(false);
const selectedMonth = ref(startOfMonth(new Date()));

const minDate = addDays(new Date(), -10);
const maxDate = addDays(new Date(), 10);

const railRef = ref<InstanceType<typeof DateRail> | null>(null);

const hasEvent = (date: Date) => date.getDate() % 3 === 0;
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.demo {
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: #f8f9fb;
  color: #1f2937;
}

.demo[data-theme='dark'] {
  background: #111827;
  color: #f3f4f6;
  /* 다크 테마: 라이브러리 CSS 변수 오버라이드 */
  --vdr-cell-bg: #1f2937;
  --vdr-cell-hover-bg: #374151;
  --vdr-text: #f3f4f6;
  --vdr-accent: #60a5fa;
  --vdr-text-selected: #111827;
  --vdr-month-border: #374151;
}

.demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.demo__header h1 {
  font-size: 20px;
  margin: 0;
}

.demo__tagline {
  margin: 4px 0 8px;
  font-size: 13px;
  opacity: 0.75;
}

.demo__tagline a {
  color: inherit;
}

.demo__install {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(127, 127, 127, 0.15);
}

.demo__controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.demo__section {
  margin-top: 28px;
}

.demo__controls--inline {
  margin-bottom: 8px;
  font-size: 13px;
}

.demo__section h2 {
  font-size: 15px;
  margin: 0 0 8px;
  opacity: 0.8;
}

.demo__value {
  font-size: 13px;
  opacity: 0.7;
}

.demo__btn {
  padding: 6px 14px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.demo__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
</style>
