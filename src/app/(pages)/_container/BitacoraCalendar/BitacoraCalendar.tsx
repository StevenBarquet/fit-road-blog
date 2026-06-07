'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Calendar } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import { CALIFICACION_COLORS } from './calendarUtils';
import style from './BitacoraCalendar.module.scss';

export function BitacoraCalendar(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { entries, selectedDate, setSelectedDate, setCurrentMonth } = useBitacoraStore();

  const entriesByDate = new Map(entries.map((e) => [e.fecha, e]));

  // -----------------------MAIN METHODS
  function onSelect(date: Dayjs) {
    setSelectedDate(date.format('YYYY-MM-DD'));
  }

  function onPanelChange(date: Dayjs) {
    setCurrentMonth(date.month(), date.year());
  }

  function cellRender(date: Dayjs) {
    const dateStr = date.format('YYYY-MM-DD');
    const entry = entriesByDate.get(dateStr);
    const isSelected = dateStr === selectedDate;

    return (
      <div className={`day-cell ${isSelected ? 'selected' : ''}`}>
        {entry && (
          <span
            className="dot"
            style={{ backgroundColor: CALIFICACION_COLORS[entry.calificacion] }}
          />
        )}
      </div>
    );
  }

  // -----------------------RENDER
  return (
    <div className={style.BitacoraCalendar}>
      <Calendar
        fullscreen={false}
        value={selectedDate ? dayjs(selectedDate) : dayjs()}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        cellRender={cellRender}
      />
    </div>
  );
}
