import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MonthRail from './MonthRail.vue';
import { addMonths, isSameMonth, monthKey, startOfMonth } from '../utils';

const thisMonth = startOfMonth(new Date());

describe('MonthRail', () => {
  it('기본 25개(과거 12 + 현재 + 미래 12) 셀을 렌더링한다', () => {
    const wrapper = mount(MonthRail, {
      props: { modelValue: thisMonth },
    });
    expect(wrapper.findAll('.vmr__item')).toHaveLength(25);
  });

  it('클릭 시 월 1일로 정규화된 값을 emit한다', async () => {
    const wrapper = mount(MonthRail, {
      props: { modelValue: thisMonth },
    });

    const nextMonth = addMonths(thisMonth, 1);
    await wrapper.find(`[data-vmr-key="${monthKey(nextMonth)}"]`).trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    const value = emitted![0][0] as Date;
    expect(isSameMonth(value, nextMonth)).toBe(true);
    expect(value.getDate()).toBe(1);
  });

  it('선택된 월과 현재 월에 상태 클래스를 붙인다', () => {
    const selected = addMonths(thisMonth, 2);
    const wrapper = mount(MonthRail, {
      props: { modelValue: selected },
    });

    expect(wrapper.find(`[data-vmr-key="${monthKey(selected)}"]`).classes()).toContain(
      'vmr__item--selected'
    );
    expect(wrapper.find(`[data-vmr-key="${monthKey(thisMonth)}"]`).classes()).toContain(
      'vmr__item--current'
    );
  });

  it('modelValue가 기본 범위 밖이면 범위를 확장한다', () => {
    const far = addMonths(thisMonth, 20);
    const wrapper = mount(MonthRail, {
      props: { modelValue: far },
    });
    // 과거 12 + 현재 + 미래 20
    expect(wrapper.findAll('.vmr__item')).toHaveLength(33);
    expect(wrapper.find(`[data-vmr-key="${monthKey(far)}"]`).exists()).toBe(true);
  });

  it('locale에 따라 라벨이 바뀐다', () => {
    const ko = mount(MonthRail, { props: { modelValue: thisMonth, locale: 'ko' } });
    expect(ko.find(`[data-vmr-key="${monthKey(thisMonth)}"]`).text()).toMatch(/\d+년 \d+월/);

    const en = mount(MonthRail, { props: { modelValue: thisMonth, locale: 'en' } });
    expect(en.find(`[data-vmr-key="${monthKey(thisMonth)}"]`).text()).toMatch(/[A-Z][a-z]+ \d{4}/);
  });

  it('ArrowLeft 키로 이전 월을 선택한다', async () => {
    const wrapper = mount(MonthRail, {
      props: { modelValue: thisMonth },
    });

    await wrapper.find('.vmr__scroller').trigger('keydown', { key: 'ArrowLeft' });

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(isSameMonth(emitted![0][0] as Date, addMonths(thisMonth, -1))).toBe(true);
  });
});
