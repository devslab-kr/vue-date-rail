/** 셀에 표시되는 텍스트 포매터. 기본 구현은 Intl 기반(createFormatters) */
export interface RailFormatters {
  /** 일 셀 상단의 월 표기 (예: "7월", "Jul") */
  month: (date: Date) => string;
  /** 일 셀의 요일 표기 (예: "금", "Fri") */
  weekday: (date: Date) => string;
  /** 일 셀의 날짜 숫자 표기 (예: "25") */
  day: (date: Date) => string;
  /** 월 셀의 라벨 (예: "2026년 7월", "July 2026") */
  monthLabel: (date: Date) => string;
  /** 일 셀의 접근성 라벨 */
  cellAriaLabel: (date: Date, isToday: boolean) => string;
}

export interface DateRailProps {
  /** 선택된 날짜 (v-model) */
  modelValue: Date;
  /** BCP 47 로케일 (기본: 'en') — Intl 기반 포매팅에 사용 */
  locale?: string;
  /** 개별 포매터 오버라이드 */
  formatters?: Partial<RailFormatters>;
  /** 초기 로드할 과거 일수 (기본: 30) */
  initialPastDays?: number;
  /** 초기 로드할 미래 일수 (기본: 30) */
  initialFutureDays?: number;
  /** 무한 스크롤 시 추가 로드할 일수 (기본: 14) */
  loadMoreDays?: number;
  /** 이 날짜 이전으로는 스크롤/선택 불가 */
  minDate?: Date;
  /** 이 날짜 이후로는 스크롤/선택 불가 */
  maxDate?: Date;
  /** true를 반환한 날짜는 선택 불가 처리 */
  disabledDate?: (date: Date) => boolean;
  /** modelValue 변경 시 자동으로 해당 셀로 스크롤 (기본: true) */
  autoScroll?: boolean;
  /** 레일 전체의 접근성 라벨 (기본: 'Select date') */
  ariaLabel?: string;
  /** true면 기본 비주얼 스타일을 끄고 구조(flex/스크롤)만 남긴다 — Tailwind 등 유틸리티 CSS용 */
  unstyled?: boolean;
  /** 셀에 추가할 클래스. 함수면 상태를 받아 동적으로 결정 */
  cellClass?: string | ((ctx: RailCellContext) => string);
}

/** cellClass 함수와 cell 슬롯에 전달되는 셀 상태 */
export interface RailCellContext {
  date: Date;
  selected: boolean;
  today: boolean;
  disabled: boolean;
}

export interface MonthRailProps {
  /** 선택된 월 (v-model) — 항상 월 1일 자정으로 정규화되어 emit된다 */
  modelValue: Date;
  /** BCP 47 로케일 (기본: 'en') */
  locale?: string;
  /** 개별 포매터 오버라이드 */
  formatters?: Partial<RailFormatters>;
  /** 오늘 기준 과거 개월 수 (기본: 12) */
  pastMonths?: number;
  /** 오늘 기준 미래 개월 수 (기본: 12) */
  futureMonths?: number;
  /** modelValue 변경 시 자동으로 해당 셀로 스크롤 (기본: true) */
  autoScroll?: boolean;
  /** 레일 전체의 접근성 라벨 (기본: 'Select month') */
  ariaLabel?: string;
  /** true면 기본 비주얼 스타일을 끄고 구조(flex/스크롤)만 남긴다 — Tailwind 등 유틸리티 CSS용 */
  unstyled?: boolean;
  /** 월 pill에 추가할 클래스. 함수면 상태를 받아 동적으로 결정 */
  itemClass?: string | ((ctx: MonthItemContext) => string);
}

/** itemClass 함수와 item 슬롯에 전달되는 월 상태 */
export interface MonthItemContext {
  month: Date;
  selected: boolean;
  current: boolean;
}

export interface UseDateRailOptions {
  initialPastDays?: number;
  initialFutureDays?: number;
  loadMoreDays?: number;
  minDate?: Date;
  maxDate?: Date;
  /** 무한 스크롤 트리거 임계값 px (기본: 100) */
  scrollThreshold?: number;
  /** 연속 로드 방지 쿨다운 ms (기본: 300) */
  cooldownMs?: number;
}
