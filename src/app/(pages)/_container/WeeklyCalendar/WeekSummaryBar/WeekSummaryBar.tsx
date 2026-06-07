'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Config
import style from './WeekSummaryBar.module.scss';

interface Props {
  weekNumber: number;
  avgPeso: number | null;
  prevAvgPeso: number | null;
}

export function WeekSummaryBar({ weekNumber, avgPeso, prevAvgPeso }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const hasTrend = avgPeso !== null && prevAvgPeso !== null;
  const delta = hasTrend ? avgPeso - prevAvgPeso : 0;
  const trendArrow = delta < 0 ? '↓' : delta > 0 ? '↑' : '→';
  const trendClass = delta < 0 ? 'trend-down' : delta > 0 ? 'trend-up' : 'trend-flat';

  // -----------------------RENDER
  return (
    <div className={style.WeekSummaryBar}>
      <span className="label">Sem {weekNumber}</span>
      {avgPeso !== null ? (
        <span className="avg">
          Prom: {avgPeso} kg
          {hasTrend && <span className={trendClass}> {trendArrow}</span>}
        </span>
      ) : (
        <span className="avg no-data">—</span>
      )}
    </div>
  );
}
