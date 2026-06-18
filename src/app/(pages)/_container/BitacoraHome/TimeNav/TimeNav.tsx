'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
// ---Config
import style from './TimeNav.module.scss';

export function TimeNav(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const [offset, setOffset] = useState(0);

  const today = dayjs();
  const currentWeekMonday = today.isoWeekday(1);
  const from = currentWeekMonday.subtract(3 + (offset * 4), 'week');
  const to = from.add(4, 'week').subtract(1, 'day');

  const isDefault = offset === 0;

  // -----------------------MAIN METHODS
  function goBack(): void {
    setOffset((prev) => prev + 1);
  }

  function goForward(): void {
    setOffset((prev) => Math.max(0, prev - 1));
  }

  function goToday(): void {
    setOffset(0);
  }

  // -----------------------AUX METHODS
  function formatRange(): string {
    const fromStr = from.format('D MMM');
    const toStr = to.format('D MMM');
    return `${fromStr} – ${toStr}`;
  }

  // -----------------------RENDER
  return (
    <div className={style.TimeNav}>
      <button className="nav-btn" onClick={goBack} type="button">
        <Icon icon="mdi:chevron-left" width={20} />
      </button>

      <button className="range-label" type="button">
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
    </div>
  );
}
