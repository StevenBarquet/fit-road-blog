'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import { CALIFICACION_COLORS, CALIFICACION_LABELS } from '../BitacoraCalendar/calendarUtils';
import style from './DaySummary.module.scss';

dayjs.locale('es');

export function DaySummary(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { selectedDate, getSelectedEntry } = useBitacoraStore();
  const entry = getSelectedEntry();

  // -----------------------RENDER
  if (!selectedDate) {
    return (
      <div className={style.DaySummary}>
        <p className="empty">Selecciona un día en el calendario</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={style.DaySummary}>
        <header>
          <span>{dayjs(selectedDate).format('dddd D [de] MMMM')}</span>
        </header>
        <p className="empty">Sin registro para este día</p>
      </div>
    );
  }

  return (
    <div className={style.DaySummary}>
      <header>
        <span>{dayjs(entry.id).format('dddd D [de] MMMM')}</span>
        {entry.calificacion && (
          <span
            className="badge"
            style={{ backgroundColor: CALIFICACION_COLORS[entry.calificacion] }}
          >
            {entry.calificacion} — {CALIFICACION_LABELS[entry.calificacion]}
          </span>
        )}
      </header>

      <ul>
        <li>
          <strong>{entry.peso ?? '—'}</strong>
          <small>kg</small>
        </li>
        <li>
          <strong>{entry.nivel ?? '—'}</strong>
          <small>nivel</small>
        </li>
      </ul>

      {entry.nota && <blockquote>{entry.nota}</blockquote>}
    </div>
  );
}
