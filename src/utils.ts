/** 로컬 자정으로 정규화한 새 Date를 반환한다 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 해당 월 1일 자정으로 정규화한 새 Date를 반환한다 */
export function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

/** 월 시작 기준 월 산술 — 1/31 + 1개월 = 3/3 이 되는 오버플로를 피한다 */
export function addMonths(date: Date, amount: number): Date {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** YYYY-MM-DD (로컬 기준) */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** YYYY-MM (로컬 기준) */
export function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return new Date(min);
  if (max && date > max) return new Date(max);
  return date;
}

/** start ~ end(포함)의 일 단위 Date 배열. 각 항목은 자정으로 정규화된다 */
export function generateDates(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);

  while (current <= last) {
    result.push(current);
    current = startOfDay(addDays(current, 1));
  }

  return result;
}

/** start ~ end(포함)의 월 단위 Date 배열. 각 항목은 월 1일 자정으로 정규화된다 */
export function generateMonths(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  let current = startOfMonth(start);
  const last = startOfMonth(end);

  while (current <= last) {
    result.push(current);
    current = addMonths(current, 1);
  }

  return result;
}
