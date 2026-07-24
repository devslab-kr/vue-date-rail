import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DateRail from './DateRail.vue';
import { addDays, dateKey, isSameDay, startOfDay } from '../utils';

const today = startOfDay(new Date());

describe('DateRail', () => {
  it('기본 61개 셀을 렌더링한다', () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today },
    });
    expect(wrapper.findAll('.vdr__cell')).toHaveLength(61);
  });

  it('셀 클릭 시 자정 정규화된 날짜로 update:modelValue를 emit한다', async () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today },
    });

    const tomorrow = addDays(today, 1);
    await wrapper.find(`[data-vdr-key="${dateKey(tomorrow)}"]`).trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    const value = emitted![0][0] as Date;
    expect(isSameDay(value, tomorrow)).toBe(true);
    expect(value.getHours()).toBe(0);
    expect(wrapper.emitted('change')).toHaveLength(1);
  });

  it('선택된 셀과 오늘 셀에 상태 클래스를 붙인다', () => {
    const selected = addDays(today, 2);
    const wrapper = mount(DateRail, {
      props: { modelValue: selected },
    });

    expect(wrapper.find(`[data-vdr-key="${dateKey(selected)}"]`).classes()).toContain(
      'vdr__cell--selected'
    );
    expect(wrapper.find(`[data-vdr-key="${dateKey(today)}"]`).classes()).toContain(
      'vdr__cell--today'
    );
  });

  it('minDate/maxDate 밖 셀은 비활성화된다', () => {
    const wrapper = mount(DateRail, {
      props: {
        modelValue: today,
        minDate: addDays(today, -2),
        maxDate: addDays(today, 2),
        initialPastDays: 5,
        initialFutureDays: 5,
      },
    });

    // 범위 생성 자체가 min/max로 잘리므로 5개 셀만 남는다
    expect(wrapper.findAll('.vdr__cell')).toHaveLength(5);
  });

  it('disabledDate 콜백으로 개별 날짜를 비활성화한다', async () => {
    const target = addDays(today, 1);
    const wrapper = mount(DateRail, {
      props: {
        modelValue: today,
        disabledDate: (d: Date) => isSameDay(d, target),
      },
    });

    const cell = wrapper.find(`[data-vdr-key="${dateKey(target)}"]`);
    expect(cell.attributes('disabled')).toBeDefined();

    await cell.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('locale에 따라 요일/월 표기가 바뀐다', () => {
    const ko = mount(DateRail, { props: { modelValue: today, locale: 'ko' } });
    const koCell = ko.find(`[data-vdr-key="${dateKey(today)}"]`);
    expect(koCell.find('.vdr__month').text()).toMatch(/월$/);

    const en = mount(DateRail, { props: { modelValue: today, locale: 'en' } });
    const enCell = en.find(`[data-vdr-key="${dateKey(today)}"]`);
    expect(enCell.find('.vdr__month').text()).toMatch(/^[A-Z][a-z]{2}$/);
  });

  it('formatters 오버라이드가 Intl 기본값보다 우선한다', () => {
    const wrapper = mount(DateRail, {
      props: {
        modelValue: today,
        formatters: { weekday: () => 'X' },
      },
    });
    expect(
      wrapper.find(`[data-vdr-key="${dateKey(today)}"]`).find('.vdr__weekday').text()
    ).toBe('X');
  });

  it('ArrowRight 키로 다음 날을 선택한다', async () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today },
    });

    await wrapper.find('.vdr__scroller').trigger('keydown', { key: 'ArrowRight' });

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(isSameDay(emitted![0][0] as Date, addDays(today, 1))).toBe(true);
  });

  it('cell 슬롯으로 셀 전체를 교체할 수 있다', () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today },
      slots: {
        cell: `<template #cell="{ date }"><em class="custom">{{ date.getDate() }}</em></template>`,
      },
    });
    expect(wrapper.findAll('.custom')).toHaveLength(61);
  });

  it('data-selected/data-today/data-disabled 속성을 노출한다', () => {
    const wrapper = mount(DateRail, {
      props: {
        modelValue: today,
        disabledDate: (d: Date) => isSameDay(d, addDays(today, 1)),
      },
    });

    const selectedCell = wrapper.find(`[data-vdr-key="${dateKey(today)}"]`);
    expect(selectedCell.attributes('data-selected')).toBe('true');
    expect(selectedCell.attributes('data-today')).toBe('true');

    const disabledCell = wrapper.find(`[data-vdr-key="${dateKey(addDays(today, 1))}"]`);
    expect(disabledCell.attributes('data-disabled')).toBe('true');
    expect(disabledCell.attributes('data-selected')).toBeUndefined();
  });

  it('unstyled + cellClass로 기본 스타일 없이 Tailwind식 클래스를 입힌다', () => {
    const wrapper = mount(DateRail, {
      props: {
        modelValue: today,
        unstyled: true,
        cellClass: ({ selected }: { selected: boolean }) =>
          selected ? 'rounded bg-blue-500' : 'rounded',
      },
    });

    const cell = wrapper.find(`[data-vdr-key="${dateKey(today)}"]`);
    expect(cell.classes()).not.toContain('vdr__cell');
    expect(cell.classes()).toContain('bg-blue-500');
    expect(
      wrapper.find(`[data-vdr-key="${dateKey(addDays(today, 1))}"]`).classes()
    ).not.toContain('bg-blue-500');
  });

  it('세로 휠을 가로 스크롤로 변환한다', async () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today },
    });
    const scroller = wrapper.find('.vdr__scroller');
    const el = scroller.element as HTMLElement;
    el.scrollLeft = 0;

    await scroller.trigger('wheel', { deltaY: 120, deltaX: 0 });
    expect(el.scrollLeft).toBe(120);
  });

  it('modelValue가 현재 범위 밖이면 범위를 확장해 렌더링한다', async () => {
    const wrapper = mount(DateRail, {
      props: { modelValue: today, initialPastDays: 5, initialFutureDays: 5 },
    });
    expect(wrapper.findAll('.vdr__cell')).toHaveLength(11);

    const far = addDays(today, 50);
    await wrapper.setProps({ modelValue: far });
    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.find(`[data-vdr-key="${dateKey(far)}"]`).exists()).toBe(true);
  });
});
