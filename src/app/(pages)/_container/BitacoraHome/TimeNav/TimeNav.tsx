'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Icon } from '@iconify/react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import locale from 'antd/locale/es_ES';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import style from './TimeNav.module.scss';

export function TimeNav(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { setDateRange } = useBitacoraStore();
  const [offset, setOffset] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const today = dayjs();
  const currentWeekMonday = today.isoWeekday(1);
  const from = currentWeekMonday.subtract(3 + (offset * 4), 'week');
  const to = from.add(4, 'week').subtract(1, 'day');

  const isDefault = offset === 0;

  // -----------------------MAIN METHODS
  function navigate(newOffset: number): void {
    setOffset(newOffset);
    const newFrom = currentWeekMonday.subtract(3 + (newOffset * 4), 'week');
    const newTo = newFrom.add(4, 'week').subtract(1, 'day');
    setDateRange({
      from: newFrom.format('YYYY-MM-DD'),
      to: newTo.format('YYYY-MM-DD'),
    });
  }

  function goBack(): void {
    navigate(offset + 1);
  }

  function goForward(): void {
    navigate(Math.max(0, offset - 1));
  }

  function goToday(): void {
    navigate(0);
  }

  function handleWeekSelect(date: Dayjs | null): void {
    if (!date) return;
    const selectedMonday = date.isoWeekday(1);
    const defaultFrom = currentWeekMonday.subtract(3, 'week');
    const diffWeeks = defaultFrom.diff(selectedMonday, 'week');
    const newOffset = Math.max(0, Math.floor(diffWeeks / 4));
    navigate(newOffset);
    setPickerOpen(false);
  }

  // -----------------------AUX METHODS
  function formatRange(): string {
    const fromStr = from.format('D MMM');
    const toStr = to.format('D MMM');
    return `${fromStr} – ${toStr}`;
  }

  function disabledDate(current: Dayjs): boolean {
    return current.isAfter(today, 'day');
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
        disabled={isDefault}
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
            allowClear={false}
            suffixIcon={null}
            inputReadOnly
          />
        </ConfigProvider>
      </div>
    </div>
  );
}
