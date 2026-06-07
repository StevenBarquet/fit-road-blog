import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { type BitacoraFromDB, type Calificacion } from 'src/server/entities/bitacora/bitacoraTypes';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

export const CALIFICACION_COLORS: Record<Calificacion, string> = {
  A: '#4ade80',
  B: '#60a5fa',
  C: '#fbbf24',
  D: '#f87171',
};

export const CALIFICACION_LABELS: Record<Calificacion, string> = {
  A: 'Excelente',
  B: 'Bien',
  C: 'Regular',
  D: 'Mal',
};

export const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export interface WeekData {
  weekNumber: number;
  days: Dayjs[];
  avgPeso: number | null;
  prevAvgPeso: number | null;
}

export function buildWeeks(from: string, to: string, entries: BitacoraFromDB[]): WeekData[] {
  const entriesMap = new Map(entries.map((e) => [e.id, e]));
  const start = dayjs(from);
  const end = dayjs(to);

  const weeks: WeekData[] = [];
  let cursor = start;

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const weekDays: Dayjs[] = [];
    for (let i = 0; i < 7; i++) {
      const day = cursor.add(i, 'day');
      if (day.isAfter(end)) break;
      weekDays.push(day);
    }

    const weekPesos = weekDays
      .map((d) => entriesMap.get(d.format('YYYY-MM-DD'))?.peso)
      .filter((p): p is number => p !== null && p !== undefined);

    const avgPeso = weekPesos.length >= 2
      ? Math.round((weekPesos.reduce((a, b) => a + b, 0) / weekPesos.length) * 10) / 10
      : null;

    weeks.push({
      weekNumber: cursor.isoWeek(),
      days: weekDays,
      avgPeso,
      prevAvgPeso: null,
    });

    cursor = cursor.add(7, 'day');
  }

  for (let i = 1; i < weeks.length; i++) {
    weeks[i]!.prevAvgPeso = weeks[i - 1]!.avgPeso;
  }

  return weeks;
}
