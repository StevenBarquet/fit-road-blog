# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ant Design monthly calendar with a custom dark-mode weekly grid (4 weeks), inline day data, dual-mode drawer, and weekly weight averages.

**Architecture:** Custom `WeeklyCalendar` grid component replaces Ant Calendar. Store shifts from month-based to date-range-based fetching. Drawer gains read-only mode with edit toggle. Dark theme applied globally via SCSS variables.

**Tech Stack:** Next.js 14, tRPC, SCSS Modules, Zustand, Formik, Ant Design (Drawer + Input only), dayjs, Iconify.

**Important:** NEVER run git commands. The user handles all git operations.

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.tsx` | Grid layout: 4 weeks of DayCells + WeekSummaryBars |
| `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.module.scss` | Grid styles, day-of-week header |
| `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.tsx` | Individual day cell: number, badge, peso, note icon |
| `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.module.scss` | Cell sizing, states (today, selected, empty) |
| `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.tsx` | Week average bar between rows |
| `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.module.scss` | Bar styling |
| `src/app/(pages)/_container/WeeklyCalendar/calendarUtils.ts` | Date range calculation, week grouping, average computation |
| `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx` | Read-only entry display inside drawer |
| `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.module.scss` | Read view styling |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/_styles/_variables.scss` | Add dark theme vars + calificacion colors |
| `src/app/_styles/global.scss` | Dark background on body/main |
| `src/app/_store/bitacoraData/bitacoraStore.ts` | Remove month/year, add dateRange, add drawerMode |
| `src/app/_querys/bitacora/useFetchBitacora.ts` | New `useFetchBitacoraRange` hook |
| `src/server/entities/bitacora/validations/model.ts` | Add `bitacoraGetByRangeSchema` |
| `src/server/api/routers/bitacoraRouter.ts` | Add `getByRange` endpoint |
| `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx` | Replace calendar + remove DaySummary |
| `src/app/(pages)/_container/BitacoraHome/BitacoraHome.module.scss` | Dark theme |
| `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx` | Dual mode (read/form) logic |
| `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss` | Dark styling |
| `src/app/(pages)/_container/DayForm/DayForm.module.scss` | Dark inputs |
| `src/app/(pages)/_container/DayForm/DayForm.tsx` | Remove delete button (moves to DayReadView) |
| `src/app/(pages)/_container/DayForm/useDayForm.ts` | Remove handleDelete (moves to DayReadView) |
| `src/app/_providers/AntdProv/AntdProv.tsx` | Dark theme token for Ant components |

### Files to Delete
| File | Reason |
|------|--------|
| `src/app/(pages)/_container/DaySummary/` (folder) | Replaced by DayReadView inside drawer |
| `src/app/(pages)/_container/BitacoraCalendar/` (folder) | Replaced by WeeklyCalendar |

---

## Task 1: Color System & Global Dark Theme

**Files:**
- Modify: `src/app/_styles/_variables.scss`
- Modify: `src/app/_styles/global.scss`
- Modify: `src/app/_providers/AntdProv/AntdProv.tsx`

- [ ] **Step 1: Add dark theme + calificacion variables to `_variables.scss`**

Add after the existing `$light10` block (before `//----------------------Specials`):

```scss
//----------------------Dark Theme Base------------------
$bgBase: #0f0f1a;
$bgCard: #1a1a2e;
$bgCardHover: #22223a;
$borderSubtle: #2a2a3e;
$textPrimary: #e8e8f0;
$textSecondary: #8888a0;
$textMuted: #55556a;

//----------------------Calificacion Colors------------------
$calA: #4ade80;
$calB: #60a5fa;
$calC: #fbbf24;
$calD: #f87171;
```

- [ ] **Step 2: Apply dark background to global styles in `global.scss`**

Replace the `main` rule:

```scss
main {
  font-family: "Inter";
  font-size: 16px;
  background-color: $bgBase;
  color: $textPrimary;
  min-height: 100vh;
}
```

Remove the old `> div:first-child` nested rules (no longer needed — mobile-only app).

- [ ] **Step 3: Update Ant Design ConfigProvider for dark compatibility**

In `src/app/_providers/AntdProv/AntdProv.tsx`, update the theme token:

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: colors.primaryColor || undefined,
      colorBgContainer: '#1a1a2e',
      colorBgElevated: '#1a1a2e',
      colorText: '#e8e8f0',
      colorTextSecondary: '#8888a0',
      colorBorder: '#2a2a3e',
    },
  }}
>
  {children}
</ConfigProvider>
```

- [ ] **Step 4: Verify — run `npm run dev` and confirm dark background renders**

Run: `npm run dev`
Expected: App loads with dark `#0f0f1a` background, text is light. May look broken since components haven't been updated yet — that's fine.

---

## Task 2: Backend — `getByRange` Endpoint

**Files:**
- Modify: `src/server/entities/bitacora/validations/model.ts`
- Modify: `src/server/api/routers/bitacoraRouter.ts`

- [ ] **Step 1: Add validation schema for range query**

In `src/server/entities/bitacora/validations/model.ts`, add:

```typescript
export const bitacoraGetByRangeSchema = yup.object({
  from: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  to: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});
```

- [ ] **Step 2: Add `getByRange` procedure to bitacoraRouter**

In `src/server/api/routers/bitacoraRouter.ts`, add after the existing `getByMonth` procedure:

```typescript
getByRange: publicProcedure
  .input(async (raw) => await bitacoraGetByRangeSchema.validate(raw))
  .query(async ({ input }) => {
    const { from, to } = input;
    const result = await bitacoraRepo.find();
    const entries: BitacoraFromDB[] = result.results.filter(
      (entry) => entry.id >= from && entry.id <= to
    );
    return entries;
  }),
```

Also add `bitacoraGetByRangeSchema` to the import at top:

```typescript
import {
  bitacoraUpsertSchema,
  bitacoraDeleteSchema,
  bitacoraGetByMonthSchema,
  bitacoraGetByRangeSchema,
} from "src/server/entities/bitacora/validations/model";
```

- [ ] **Step 3: Verify — run dev server and confirm no TypeScript errors in terminal**

Run: `npm run dev`
Expected: Compiles without errors. The old `getByMonth` still works for now.

---

## Task 3: Store — Switch to Range-Based

**Files:**
- Modify: `src/app/_store/bitacoraData/bitacoraStore.ts`

- [ ] **Step 1: Rewrite the store**

Replace the entire file content:

```typescript
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

type DrawerMode = 'closed' | 'read' | 'form';

function computeDateRange() {
  const today = dayjs();
  const currentWeekMonday = today.isoWeekday(1);
  const from = currentWeekMonday.subtract(3, 'week').format('YYYY-MM-DD');
  const to = currentWeekMonday.add(1, 'week').subtract(1, 'day').format('YYYY-MM-DD');
  return { from, to };
}

interface State {
  entries: BitacoraFromDB[];
  selectedDate: string | null;
  dateRange: { from: string; to: string };
  drawerMode: DrawerMode;
}

const initialState: State = {
  entries: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  dateRange: computeDateRange(),
  drawerMode: 'closed',
};

export interface BitacoraStore extends State {
  setEntries: (entries: BitacoraFromDB[]) => void;
  setSelectedDate: (date: string | null) => void;
  setDrawerMode: (mode: DrawerMode) => void;
  openDay: (date: string) => void;
  getSelectedEntry: () => BitacoraFromDB | undefined;
  getEntriesByDate: () => Map<string, BitacoraFromDB>;
  reset: () => void;
}

const actions: StateCreator<BitacoraStore> = (set, get) => ({
  ...initialState,
  setEntries: (entries) => set({ entries }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDrawerMode: (drawerMode) => set({ drawerMode }),
  openDay: (date) => {
    const { entries } = get();
    const hasEntry = entries.some((e) => e.id === date);
    set({
      selectedDate: date,
      drawerMode: hasEntry ? 'read' : 'form',
    });
  },
  getSelectedEntry: () => {
    const { entries, selectedDate } = get();
    if (!selectedDate) return undefined;
    return entries.find((e) => e.id === selectedDate);
  },
  getEntriesByDate: () => {
    const { entries } = get();
    return new Map(entries.map((e) => [e.id, e]));
  },
  reset: () => set(initialState),
});

export const useBitacoraStore = create<BitacoraStore>()(
  devtools(actions, { name: 'BitacoraData' }),
);
```

---

## Task 4: Query Hook — Range-Based Fetch

**Files:**
- Modify: `src/app/_querys/bitacora/useFetchBitacora.ts`

- [ ] **Step 1: Replace `useFetchBitacoraMonth` with `useFetchBitacoraRange`**

Replace the entire file:

```typescript
import { useEffect } from 'react';
import { api } from 'src/app/_providers/_trpc/react';
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';

export function useFetchBitacoraRange() {
  const { dateRange, setEntries } = useBitacoraStore();

  const query = api.bitacora.getByRange.useQuery(dateRange);

  useEffect(() => {
    if (query.data) setEntries(query.data);
  }, [query.data, setEntries]);

  return query;
}

export function useUpsertBitacora() {
  const utils = api.useUtils();
  const { dateRange } = useBitacoraStore();

  return api.bitacora.upsert.useMutation({
    onSuccess: () => {
      utils.bitacora.getByRange.invalidate(dateRange);
    },
  });
}

export function useDeleteBitacora() {
  const utils = api.useUtils();
  const { dateRange } = useBitacoraStore();

  return api.bitacora.delete.useMutation({
    onSuccess: () => {
      utils.bitacora.getByRange.invalidate(dateRange);
    },
  });
}
```

---

## Task 5: Calendar Utilities

**Files:**
- Create: `src/app/(pages)/_container/WeeklyCalendar/calendarUtils.ts`

- [ ] **Step 1: Create the utility file**

```typescript
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
    weeks[i].prevAvgPeso = weeks[i - 1].avgPeso;
  }

  return weeks;
}
```

---

## Task 6: DayCell Component

**Files:**
- Create: `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.tsx`
- Create: `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.module.scss`

- [ ] **Step 1: Create DayCell component**

```tsx
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
```

- [ ] **Step 2: Create DayCell SCSS module**

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.DayCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 2px;
  min-height: 70px;
  background: $bgCard;
  border: 1px solid $borderSubtle;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;

  .day-number {
    font-size: 12px;
    font-weight: 600;
    color: $textSecondary;
  }

  .badge {
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    padding: 1px 5px;
    border-radius: 4px;
    line-height: 1.2;
  }

  .peso {
    font-size: 10px;
    color: $textMuted;
    font-weight: 500;
  }

  .note-icon {
    font-size: 6px;
    color: $primaryColor;
    line-height: 1;
  }
}

.DayCell.today {
  border-color: $primaryColor;
  box-shadow: 0 0 0 1px $primaryColor;

  .day-number {
    color: $primaryColor;
  }
}

.DayCell.selected {
  background: $bgCardHover;
}

.DayCell.future {
  opacity: 0.4;
}
```

---

## Task 7: WeekSummaryBar Component

**Files:**
- Create: `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.tsx`
- Create: `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.module.scss`

- [ ] **Step 1: Create WeekSummaryBar component**

```tsx
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
```

- [ ] **Step 2: Create WeekSummaryBar SCSS module**

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.WeekSummaryBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: $bgCard;
  border-radius: 6px;
  margin: 4px 0;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: $textMuted;
  }

  .avg {
    font-size: 11px;
    font-weight: 500;
    color: $textSecondary;
  }

  .avg.no-data {
    color: $textMuted;
  }

  .trend-down {
    color: $calA;
    font-weight: 700;
  }

  .trend-up {
    color: $calD;
    font-weight: 700;
  }

  .trend-flat {
    color: $textMuted;
  }
}
```

---

## Task 8: WeeklyCalendar Component

**Files:**
- Create: `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.tsx`
- Create: `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.module.scss`

- [ ] **Step 1: Create WeeklyCalendar component**

```tsx
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
```

- [ ] **Step 2: Create WeeklyCalendar SCSS module**

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.WeeklyCalendar {
  .day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .day-label {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: $textMuted;
    text-transform: uppercase;
  }

  .week-block {
    margin-bottom: 4px;
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
}
```

---

## Task 9: DayReadView Component

**Files:**
- Create: `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx`
- Create: `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.module.scss`

- [ ] **Step 1: Create DayReadView component**

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Button } from 'antd';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useDeleteBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Config
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS, CALIFICACION_LABELS } from '../../WeeklyCalendar/calendarUtils';
import { swalApiConfirm, swalApiError } from 'src/app/_utils/functions/alertUtils';
import style from './DayReadView.module.scss';

interface Props {
  entry: BitacoraFromDB;
  onEdit: () => void;
}

export function DayReadView({ entry, onEdit }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { setDrawerMode } = useBitacoraStore();
  const deleteMutation = useDeleteBitacora();

  // -----------------------MAIN METHODS
  async function handleDelete() {
    await swalApiConfirm({
      callback: async () => {
        try {
          await deleteMutation.mutateAsync({ id: entry.id });
          setDrawerMode('closed');
        } catch {
          await swalApiError('Error al eliminar el registro');
        }
      },
      confirmMsg: '¿Seguro que quieres eliminar el registro de este día?',
      successMsg: 'Registro eliminado',
    });
  }

  // -----------------------RENDER
  return (
    <div className={style.DayReadView}>
      {entry.calificacion && (
        <div className="calificacion-section">
          <span
            className="cal-badge"
            style={{ backgroundColor: CALIFICACION_COLORS[entry.calificacion] }}
          >
            {entry.calificacion}
          </span>
          <span className="cal-label">{CALIFICACION_LABELS[entry.calificacion]}</span>
          {entry.nivel && <span className="nivel">Nivel {entry.nivel}</span>}
        </div>
      )}

      {entry.peso && (
        <div className="peso-section">
          <span className="peso-value">{entry.peso}</span>
          <span className="peso-unit">kg</span>
        </div>
      )}

      {entry.nota && (
        <blockquote>{entry.nota}</blockquote>
      )}

      <div className="actions">
        <Button type="primary" block onClick={onEdit}>
          Editar
        </Button>
        <Button danger type="text" block onClick={handleDelete}>
          Eliminar registro
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create DayReadView SCSS module**

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.DayReadView {
  .calificacion-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .cal-badge {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
  }

  .cal-label {
    font-size: 18px;
    font-weight: 600;
    color: $textPrimary;
  }

  .nivel {
    font-size: 14px;
    color: $textSecondary;
    margin-left: auto;
    background: $bgCard;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .peso-section {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 20px;
    padding: 16px;
    background: $bgCard;
    border-radius: 10px;
  }

  .peso-value {
    font-size: 32px;
    font-weight: 800;
    color: $textPrimary;
  }

  .peso-unit {
    font-size: 16px;
    color: $textSecondary;
  }

  blockquote {
    font-size: 14px;
    color: $textSecondary;
    line-height: 1.5;
    padding: 12px;
    margin: 0 0 20px 0;
    background: $bgCard;
    border-radius: 8px;
    border-left: 3px solid $primaryColor;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
  }
}
```

---

## Task 10: Modify DayDrawer — Dual Mode

**Files:**
- Modify: `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx`
- Modify: `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss`

- [ ] **Step 1: Rewrite DayDrawer with dual mode logic**

```tsx
'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Drawer } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Components
import { DayReadView } from './DayReadView/DayReadView';
import { DayForm } from '../DayForm/DayForm';
// ---Config
import style from './DayDrawer.module.scss';

dayjs.locale('es');

export function DayDrawer(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { drawerMode, setDrawerMode, selectedDate, getSelectedEntry } = useBitacoraStore();
  const entry = getSelectedEntry();
  const [isEditing, setIsEditing] = useState(false);

  const isOpen = drawerMode !== 'closed';
  const showForm = drawerMode === 'form' || isEditing;

  const title = selectedDate
    ? dayjs(selectedDate).format('dddd D [de] MMMM')
    : '';

  // -----------------------MAIN METHODS
  function handleClose() {
    setDrawerMode('closed');
    setIsEditing(false);
  }

  function handleEdit() {
    setIsEditing(true);
  }

  // -----------------------RENDER
  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      placement="bottom"
      height={showForm ? '70vh' : 'auto'}
      title={title}
      className={style.DayDrawer}
      destroyOnClose
    >
      {showForm ? (
        <DayForm />
      ) : entry ? (
        <DayReadView entry={entry} onEdit={handleEdit} />
      ) : null}
    </Drawer>
  );
}
```

- [ ] **Step 2: Update DayDrawer SCSS for dark theme**

Replace entire file:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.DayDrawer {
  .ant-drawer-content {
    background: $bgBase;
    border-radius: 16px 16px 0 0;
  }

  .ant-drawer-header {
    background: $bgBase;
    border-bottom: 1px solid $borderSubtle;
  }

  .ant-drawer-header-title .ant-drawer-title {
    color: $textPrimary;
    font-weight: 600;
    text-transform: capitalize;
  }

  .ant-drawer-close {
    color: $textSecondary;
  }

  .ant-drawer-body {
    padding: 20px 16px;
  }
}
```

---

## Task 11: Modify DayForm — Remove Delete, Dark Theme

**Files:**
- Modify: `src/app/(pages)/_container/DayForm/DayForm.tsx`
- Modify: `src/app/(pages)/_container/DayForm/useDayForm.ts`
- Modify: `src/app/(pages)/_container/DayForm/DayForm.module.scss`

- [ ] **Step 1: Remove delete button from DayForm**

In `DayForm.tsx`, remove the delete button and `handleDelete` from the hook destructuring:

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Input, Button } from 'antd';
// ---Custom Hooks
import { useDayForm } from './useDayForm';
// ---Config
import { CALIFICACIONES, NIVELES } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../WeeklyCalendar/calendarUtils';
import style from './DayForm.module.scss';

export function DayForm(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { formik } = useDayForm();
  const { values, setFieldValue, isSubmitting, handleSubmit } = formik;

  // -----------------------RENDER
  return (
    <div className={style.DayForm}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Peso (kg)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="Ej: 78.5"
            value={values.peso ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFieldValue('peso', val === '' ? null : Number(val));
            }}
          />
        </div>

        <div className="field-group">
          <label>Calificación</label>
          <div className="radio-row">
            {CALIFICACIONES.map((cal) => (
              <button
                key={cal}
                type="button"
                className={`radio-btn ${values.calificacion === cal ? 'active' : ''}`}
                style={{
                  borderColor: CALIFICACION_COLORS[cal],
                  backgroundColor: values.calificacion === cal ? CALIFICACION_COLORS[cal] : 'transparent',
                }}
                onClick={() => setFieldValue('calificacion', values.calificacion === cal ? null : cal)}
              >
                {cal}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Nivel</label>
          <div className="radio-row">
            {NIVELES.map((niv) => (
              <button
                key={niv}
                type="button"
                className={`radio-btn nivel ${values.nivel === niv ? 'active' : ''}`}
                onClick={() => setFieldValue('nivel', values.nivel === niv ? null : niv)}
              >
                {niv}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Notas</label>
          <Input.TextArea
            rows={3}
            placeholder="Particularidades del día..."
            value={values.nota}
            onChange={(e) => setFieldValue('nota', e.target.value)}
          />
        </div>

        <div className="actions">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Simplify useDayForm — remove handleDelete**

Replace entire file:

```typescript
import { useFormik } from 'formik';
import * as yup from 'yup';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useUpsertBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Config
import { type BitacoraFromDB, type Calificacion, type Nivel } from 'src/server/entities/bitacora/bitacoraTypes';
import { swalApiConfirm, swalApiError } from 'src/app/_utils/functions/alertUtils';

const formSchema = yup.object({
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
});

export interface DayFormValues {
  peso: number | null;
  calificacion: string | null;
  nivel: number | null;
  nota: string;
}

function getInitialValues(entry: BitacoraFromDB | undefined): DayFormValues {
  return {
    peso: entry?.peso ?? null,
    calificacion: entry?.calificacion ?? null,
    nivel: entry?.nivel ?? null,
    nota: entry?.nota ?? '',
  };
}

function hasOverwrittenFields(
  original: BitacoraFromDB | undefined,
  current: DayFormValues
): boolean {
  if (!original) return false;
  if (original.peso !== null && current.peso !== original.peso) return true;
  if (original.calificacion !== null && current.calificacion !== original.calificacion) return true;
  if (original.nivel !== null && current.nivel !== original.nivel) return true;
  if (original.nota && current.nota !== original.nota) return true;
  return false;
}

export function useDayForm() {
  const { selectedDate, getSelectedEntry, setDrawerMode } = useBitacoraStore();
  const upsertMutation = useUpsertBitacora();
  const entry = getSelectedEntry();

  const formik = useFormik<DayFormValues>({
    initialValues: getInitialValues(entry),
    validationSchema: formSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!selectedDate) return;

      const doUpsert = async () => {
        try {
          await upsertMutation.mutateAsync({
            id: selectedDate,
            peso: values.peso,
            calificacion: values.calificacion as Calificacion | null,
            nivel: values.nivel ? Number(values.nivel) as Nivel : null,
            nota: values.nota,
          });
          setDrawerMode('closed');
        } catch {
          await swalApiError('Error al guardar el registro');
        }
      };

      if (hasOverwrittenFields(entry, values)) {
        await swalApiConfirm({
          callback: doUpsert,
          confirmMsg: 'Ya existe un registro de este día con datos que modificaste, ¿seguro que quieres continuar?',
          successMsg: 'Registro actualizado',
        });
      } else {
        await doUpsert();
      }
    },
  });

  return { formik };
}
```

- [ ] **Step 3: Update DayForm SCSS for dark theme**

Replace entire file:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.DayForm {
  .field-group {
    margin-bottom: 20px;
  }

  .field-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: $textSecondary;
    margin-bottom: 8px;
  }

  .radio-row {
    display: flex;
    gap: 10px;
  }

  .radio-btn {
    flex: 1;
    height: 44px;
    border: 2px solid $borderSubtle;
    border-radius: 10px;
    background: transparent;
    font-size: 16px;
    font-weight: 700;
    color: $textPrimary;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .radio-btn.active {
    color: white;
    border-color: transparent;
  }

  .radio-btn.nivel.active {
    background-color: $primaryColor;
    border-color: $primaryColor;
    color: white;
  }

  .actions {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
```

---

## Task 12: Update BitacoraHome — Integrate New Components

**Files:**
- Modify: `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx`
- Modify: `src/app/(pages)/_container/BitacoraHome/BitacoraHome.module.scss`

- [ ] **Step 1: Rewrite BitacoraHome**

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Spin } from 'antd';
// ---Custom Hooks
import { useFetchBitacoraRange } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Components
import { WeeklyCalendar } from '../WeeklyCalendar/WeeklyCalendar';
import { DayDrawer } from '../DayDrawer/DayDrawer';
// ---Config
import style from './BitacoraHome.module.scss';

export function BitacoraHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { isLoading } = useFetchBitacoraRange();

  // -----------------------RENDER
  return (
    <div className={style.BitacoraHome}>
      <h1>Bitácora Fit Road</h1>

      {isLoading ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : (
        <WeeklyCalendar />
      )}

      <DayDrawer />
    </div>
  );
}
```

- [ ] **Step 2: Update BitacoraHome SCSS**

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.BitacoraHome {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;

  @include onlyIn(mob) {
    padding: 12px 8px;
  }

  h1 {
    font-size: 18px;
    font-weight: 700;
    color: $textPrimary;
    margin-bottom: 16px;
    text-align: center;
  }

  .center-block {
    padding: 48px;
  }
}
```

---

## Task 13: Delete Old Components

**Files:**
- Delete: `src/app/(pages)/_container/DaySummary/DaySummary.tsx`
- Delete: `src/app/(pages)/_container/DaySummary/DaySummary.module.scss`
- Delete: `src/app/(pages)/_container/BitacoraCalendar/BitacoraCalendar.tsx`
- Delete: `src/app/(pages)/_container/BitacoraCalendar/BitacoraCalendar.module.scss`
- Delete: `src/app/(pages)/_container/BitacoraCalendar/calendarUtils.ts`

- [ ] **Step 1: Delete the DaySummary folder**

Delete the entire `src/app/(pages)/_container/DaySummary/` directory.

- [ ] **Step 2: Delete the BitacoraCalendar folder**

Delete the entire `src/app/(pages)/_container/BitacoraCalendar/` directory.

---

## Task 14: Final Verification

- [ ] **Step 1: Run the dev server and verify no TypeScript/build errors**

Run: `npm run dev`
Expected: Compiles successfully, no type errors.

- [ ] **Step 2: Open in mobile browser and verify visually**

Check:
- Dark background renders correctly
- 4 weeks of calendar grid are visible
- Day cells show badge, peso, note indicator for entries with data
- Tapping empty day opens drawer in form mode
- Tapping day with data opens drawer in read-only mode
- "Editar" button in read-only mode switches to form
- Week summary bars show between week rows with averages
- Today cell has teal border highlight

- [ ] **Step 3: Test the full flow**

1. Tap an empty day → drawer opens with form → fill in data → save → drawer closes → cell now shows badge/peso
2. Tap that same day again → drawer opens in read-only → click Editar → form appears with pre-filled data → modify → save
3. Verify week average updates after adding entries
4. Verify "Eliminar" from read-only view removes the entry
