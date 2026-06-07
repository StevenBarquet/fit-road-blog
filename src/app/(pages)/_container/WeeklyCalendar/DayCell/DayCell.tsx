'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { type Dayjs } from 'dayjs';
import dayjs from 'dayjs';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../calendarUtils';
import style from './DayCell.module.scss';

interface Props {
  date: Dayjs;
  entry: BitacoraFromDB | undefined;
}

export function DayCell({ date, entry }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { selectedDate, openDay } = useBitacoraStore();
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = dateStr === dayjs().format('YYYY-MM-DD');
  const isSelected = dateStr === selectedDate;
  const isFuture = date.isAfter(dayjs(), 'day');

  // -----------------------MAIN METHODS
  function handleClick() {
    openDay(dateStr);
  }

  // -----------------------RENDER
  const rootClasses = [
    style.DayCell,
    isToday ? style.today : '',
    isSelected ? style.selected : '',
    isFuture ? style.future : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={rootClasses} onClick={handleClick} type="button">
      <span className="day-number">{date.date()}</span>
      {entry?.calificacion && (
        <span
          className="badge"
          style={{ backgroundColor: CALIFICACION_COLORS[entry.calificacion] }}
        >
          {entry.calificacion}{entry.nivel ?? ''}
        </span>
      )}
      {entry?.peso && <span className="peso">{entry.peso}</span>}
      {entry?.nota && <span className="note-icon">●</span>}
    </button>
  );
}
