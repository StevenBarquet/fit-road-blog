'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Components
import { DayCell } from './DayCell/DayCell';
import { WeekSummaryBar } from './WeekSummaryBar/WeekSummaryBar';
// ---Config
import { buildWeeks, DAY_LABELS } from './calendarUtils';
import style from './WeeklyCalendar.module.scss';

export function WeeklyCalendar(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { dateRange, entries, getEntriesByDate } = useBitacoraStore();
  const entriesMap = getEntriesByDate();
  const weeks = buildWeeks(dateRange.from, dateRange.to, entries);

  // -----------------------RENDER
  return (
    <div className={style.WeeklyCalendar}>
      <div className="day-headers">
        {DAY_LABELS.map((label) => (
          <span key={label} className="day-label">{label}</span>
        ))}
      </div>

      {weeks.map((week) => (
        <div key={week.weekNumber} className="week-block">
          <div className="week-grid">
            {week.days.map((day) => (
              <DayCell
                key={day.format('YYYY-MM-DD')}
                date={day}
                entry={entriesMap.get(day.format('YYYY-MM-DD'))}
              />
            ))}
          </div>
          <WeekSummaryBar
            weekNumber={week.weekNumber}
            avgPeso={week.avgPeso}
            prevAvgPeso={week.prevAvgPeso}
          />
        </div>
      ))}
    </div>
  );
}
