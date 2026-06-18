'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Icon } from '@iconify/react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import locale from 'antd/locale/es_ES';
// ---Custom Hooks
import { useBitacoraStore, getDefaultDateRange } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import style from './TimeNav.module.scss';

export function TimeNav(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { dateRange, setDateRange } = useBitacoraStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const from = dayjs(dateRange.from);
  const to = dayjs(dateRange.to);
  const defaultRange = getDefaultDateRange();
  const isDefault = dateRange.from === defaultRange.from && dateRange.to === defaultRange.to;

  const today = dayjs();
  const currentWeekMonday = today.isoWeekday(1);
  const maxSelectableMonday = currentWeekMonday.subtract(3, 'week');

  // -----------------------MAIN METHODS
  function goBack(): void {
    const newFrom = from.subtract(4, 'week');
    const newTo = newFrom.add(4, 'week').subtract(1, 'day');
    setDateRange({ from: newFrom.format('YYYY-MM-DD'), to: newTo.format('YYYY-MM-DD') });
  }

  function goForward(): void {
    const newFrom = from.add(4, 'week');
    if (newFrom.isAfter(maxSelectableMonday, 'day')) return;
    const newTo = newFrom.add(4, 'week').subtract(1, 'day');
    setDateRange({ from: newFrom.format('YYYY-MM-DD'), to: newTo.format('YYYY-MM-DD') });
  }

  function goToday(): void {
    setDateRange(defaultRange);
  }

  function handleWeekSelect(date: Dayjs | null): void {
    if (!date) return;
    const selectedMonday = date.isoWeekday(1);
    const newTo = selectedMonday.add(4, 'week').subtract(1, 'day');
    setDateRange({ from: selectedMonday.format('YYYY-MM-DD'), to: newTo.format('YYYY-MM-DD') });
    setPickerOpen(false);
  }

  // -----------------------AUX METHODS
  function formatRange(): string {
    const fromStr = from.format('D MMM');
    const toStr = to.format('D MMM');
    return `${fromStr} – ${toStr}`;
  }

  function disabledDate(current: Dayjs): boolean {
    return current.isoWeekday(1).isAfter(maxSelectableMonday, 'day');
  }

  function isForwardDisabled(): boolean {
    const nextFrom = from.add(4, 'week');
    return nextFrom.isAfter(maxSelectableMonday, 'day');
  }

  // -----------------------RENDER
  return (
    <div className={style.TimeNav}>
      <button className="nav-btn" onClick={goBack} type="button">
        <Icon icon="mdi:chevron-left" width={20} />
      </button>

      <button className="range-label" onClick={() => setPickerOpen(true)} type="button">
        <span>{formatRange().toUpperCase()}</span>
        <Icon icon="mdi:chevron-down" width={14} />
      </button>

      <button
        className="nav-btn"
        onClick={goForward}
        disabled={isForwardDisabled()}
        type="button"
      >
        <Icon icon="mdi:chevron-right" width={20} />
      </button>

      <button
        className="today-btn"
        onClick={goToday}
        disabled={isDefault}
        type="button"
      >
        <Icon icon="mdi:calendar-today" width={18} />
      </button>

      <div className="picker-wrapper">
        <ConfigProvider locale={locale}>
          <DatePicker
            picker="week"
            popupClassName="week-picker-popup"
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onChange={handleWeekSelect}
            disabledDate={disabledDate}
            value={from}
            allowClear={false}
            suffixIcon={null}
            inputReadOnly
          />
        </ConfigProvider>
      </div>
    </div>
  );
}
