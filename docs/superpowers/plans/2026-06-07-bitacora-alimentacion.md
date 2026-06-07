# Bitácora de Alimentación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first food tracking app with an interactive calendar, drawer-based form for daily entries (weight, grade, level, notes), and Firestore persistence.

**Architecture:** Single-page app with Ant Design Calendar showing color dots per day. Tapping a day opens a bottom drawer with a Formik form. Data persists via tRPC → Firestore using upsert (document ID = date string YYYY-MM-DD). Smart confirm logic warns only when overwriting existing values.

**Tech Stack:** Next.js 14 App Router, tRPC, Ant Design 5, Formik + Yup, Zustand, Firebase/Firestore, SCSS Modules, dayjs

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/server/entities/bitacora/bitacoraTypes.ts` | Update types — remove `fecha`, make fields nullable |
| Modify | `src/server/entities/bitacora/validations/model.ts` | Update Yup schema for nullable fields, remove `fecha` |
| Modify | `src/server/entities/bitacora/db/documentModel.ts` | Keep as-is (already correct pattern) |
| Modify | `src/server/api/routers/bitacoraRouter.ts` | Replace mocks with Firestore calls, add upsert + delete |
| Modify | `src/app/_store/bitacoraData/bitacoraStore.ts` | Add `drawerOpen` state, adjust types |
| Modify | `src/app/_querys/bitacora/useFetchBitacora.ts` | Add `useUpsertBitacora` and `useDeleteBitacora` mutation hooks |
| Modify | `src/app/(pages)/_container/BitacoraCalendar/BitacoraCalendar.tsx` | Open drawer on day select |
| Modify | `src/app/(pages)/_container/DaySummary/DaySummary.tsx` | Adjust to use `id` as date (no more `fecha`) |
| Create | `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx` | Drawer wrapper component |
| Create | `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss` | Drawer styles |
| Create | `src/app/(pages)/_container/DayForm/DayForm.tsx` | Formik form for day entry |
| Create | `src/app/(pages)/_container/DayForm/DayForm.module.scss` | Form styles |
| Modify | `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx` | Add DayDrawer to render tree |

---

### Task 1: Update Types and Validation

**Files:**
- Modify: `src/server/entities/bitacora/bitacoraTypes.ts`
- Modify: `src/server/entities/bitacora/validations/model.ts`

- [ ] **Step 1: Rewrite `bitacoraTypes.ts`**

Replace the entire contents of `src/server/entities/bitacora/bitacoraTypes.ts` with:

```typescript
export const CALIFICACIONES = ['A', 'B', 'C', 'D'] as const;
export type Calificacion = (typeof CALIFICACIONES)[number];

export const NIVELES = [1, 2, 3] as const;
export type Nivel = (typeof NIVELES)[number];

export interface ModelBitacora {
  peso: number | null;
  calificacion: Calificacion | null;
  nivel: Nivel | null;
  nota: string;
}

export interface BitacoraFromDB extends ModelBitacora {
  id: string; // YYYY-MM-DD (document ID = date)
}

export type UpsertBitacora = Partial<ModelBitacora> & { id: string };
```

- [ ] **Step 2: Rewrite `validations/model.ts`**

Replace the entire contents of `src/server/entities/bitacora/validations/model.ts` with:

```typescript
import * as yup from 'yup';

export const bitacoraUpsertSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
});

export const bitacoraDeleteSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});

export const bitacoraGetByMonthSchema = yup.object({
  month: yup.number().min(0).max(11).required(),
  year: yup.number().min(2020).max(2100).required(),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/server/entities/bitacora/bitacoraTypes.ts src/server/entities/bitacora/validations/model.ts
git commit -m "feat: update bitacora types for nullable fields and date-as-ID"
```

---

### Task 2: Update tRPC Router with Firestore

**Files:**
- Modify: `src/server/api/routers/bitacoraRouter.ts`

- [ ] **Step 1: Rewrite `bitacoraRouter.ts`**

Replace the entire contents of `src/server/api/routers/bitacoraRouter.ts` with:

```typescript
import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { bitacoraRepo } from "src/server/entities/bitacora/db/documentModel";
import {
  bitacoraUpsertSchema,
  bitacoraDeleteSchema,
  bitacoraGetByMonthSchema,
} from "src/server/entities/bitacora/validations/model";
import { type BitacoraFromDB } from "src/server/entities/bitacora/bitacoraTypes";

export const bitacoraRouter = createTRPCRouter({
  getByMonth: publicProcedure
    .input(async (raw) => await bitacoraGetByMonthSchema.validate(raw))
    .query(async ({ input }) => {
      const { month, year } = input;
      const monthStr = String(month + 1).padStart(2, '0');
      const prefix = `${year}-${monthStr}`;

      const result = await bitacoraRepo.find();
      const entries: BitacoraFromDB[] = result.results.filter(
        (entry) => entry.id.startsWith(prefix)
      );
      return entries;
    }),

  upsert: publicProcedure
    .input(async (raw) => await bitacoraUpsertSchema.validate(raw))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bitacoraRepo.upsert({ id, ...data });
      return { success: true, id };
    }),

  delete: publicProcedure
    .input(async (raw) => await bitacoraDeleteSchema.validate(raw))
    .mutation(async ({ input }) => {
      await bitacoraRepo.delete(input.id);
      return { success: true, id: input.id };
    }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/server/api/routers/bitacoraRouter.ts
git commit -m "feat: connect bitacora router to Firestore with upsert and delete"
```

---

### Task 3: Update Zustand Store

**Files:**
- Modify: `src/app/_store/bitacoraData/bitacoraStore.ts`

- [ ] **Step 1: Rewrite `bitacoraStore.ts`**

Replace the entire contents of `src/app/_store/bitacoraData/bitacoraStore.ts` with:

```typescript
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import dayjs from 'dayjs';

interface State {
  entries: BitacoraFromDB[];
  selectedDate: string | null;
  currentMonth: number;
  currentYear: number;
  drawerOpen: boolean;
}

const initialState: State = {
  entries: [],
  selectedDate: dayjs().format('YYYY-MM-DD'),
  currentMonth: dayjs().month(),
  currentYear: dayjs().year(),
  drawerOpen: false,
};

export interface BitacoraStore extends State {
  setEntries: (entries: BitacoraFromDB[]) => void;
  setSelectedDate: (date: string | null) => void;
  setCurrentMonth: (month: number, year: number) => void;
  setDrawerOpen: (open: boolean) => void;
  getSelectedEntry: () => BitacoraFromDB | undefined;
  reset: () => void;
}

const actions: StateCreator<BitacoraStore> = (set, get) => ({
  ...initialState,
  setEntries: (entries) => set({ entries }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setCurrentMonth: (currentMonth, currentYear) => set({ currentMonth, currentYear }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  getSelectedEntry: () => {
    const { entries, selectedDate } = get();
    if (!selectedDate) return undefined;
    return entries.find((e) => e.id === selectedDate);
  },
  reset: () => set(initialState),
});

export const useBitacoraStore = create<BitacoraStore>()(
  devtools(actions, { name: 'BitacoraData' }),
);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_store/bitacoraData/bitacoraStore.ts
git commit -m "feat: add drawerOpen state and use id as date in store"
```

---

### Task 4: Update Query Hooks (fetch + mutations)

**Files:**
- Modify: `src/app/_querys/bitacora/useFetchBitacora.ts`

- [ ] **Step 1: Rewrite `useFetchBitacora.ts`**

Replace the entire contents of `src/app/_querys/bitacora/useFetchBitacora.ts` with:

```typescript
import { api } from 'src/app/_providers/_trpc/react';
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';

export function useFetchBitacoraMonth() {
  const { currentMonth, currentYear, setEntries } = useBitacoraStore();

  return api.bitacora.getByMonth.useQuery(
    { month: currentMonth, year: currentYear },
    {
      onSuccess: (data) => {
        setEntries(data);
      },
    }
  );
}

export function useUpsertBitacora() {
  const utils = api.useUtils();
  const { currentMonth, currentYear } = useBitacoraStore();

  return api.bitacora.upsert.useMutation({
    onSuccess: () => {
      utils.bitacora.getByMonth.invalidate({ month: currentMonth, year: currentYear });
    },
  });
}

export function useDeleteBitacora() {
  const utils = api.useUtils();
  const { currentMonth, currentYear } = useBitacoraStore();

  return api.bitacora.delete.useMutation({
    onSuccess: () => {
      utils.bitacora.getByMonth.invalidate({ month: currentMonth, year: currentYear });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_querys/bitacora/useFetchBitacora.ts
git commit -m "feat: add upsert and delete mutation hooks"
```

---

### Task 5: Create DayForm Component

**Files:**
- Create: `src/app/(pages)/_container/DayForm/DayForm.tsx`
- Create: `src/app/(pages)/_container/DayForm/DayForm.module.scss`

- [ ] **Step 1: Create `DayForm.tsx`**

Create `src/app/(pages)/_container/DayForm/DayForm.tsx`:

```typescript
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Formik, Form, Field } from 'formik';
import { Input, Button } from 'antd';
import * as yup from 'yup';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useUpsertBitacora, useDeleteBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Config
import { CALIFICACIONES, NIVELES, type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../BitacoraCalendar/calendarUtils';
import { swalApiConfirm, swalApiError } from 'src/app/_utils/functions/alertUtils';
import style from './DayForm.module.scss';

const formSchema = yup.object({
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
});

interface FormValues {
  peso: number | null;
  calificacion: string | null;
  nivel: number | null;
  nota: string;
}

function getInitialValues(entry: BitacoraFromDB | undefined): FormValues {
  return {
    peso: entry?.peso ?? null,
    calificacion: entry?.calificacion ?? null,
    nivel: entry?.nivel ?? null,
    nota: entry?.nota ?? '',
  };
}

function hasOverwrittenFields(
  original: BitacoraFromDB | undefined,
  current: FormValues
): boolean {
  if (!original) return false;
  if (original.peso !== null && current.peso !== original.peso) return true;
  if (original.calificacion !== null && current.calificacion !== original.calificacion) return true;
  if (original.nivel !== null && current.nivel !== original.nivel) return true;
  if (original.nota && current.nota !== original.nota) return true;
  return false;
}

export function DayForm(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { selectedDate, getSelectedEntry, setDrawerOpen } = useBitacoraStore();
  const upsertMutation = useUpsertBitacora();
  const deleteMutation = useDeleteBitacora();
  const entry = getSelectedEntry();

  // -----------------------MAIN METHODS
  async function handleSubmit(values: FormValues) {
    if (!selectedDate) return;

    const doUpsert = async () => {
      try {
        await upsertMutation.mutateAsync({
          id: selectedDate,
          peso: values.peso,
          calificacion: values.calificacion,
          nivel: values.nivel ? Number(values.nivel) : null,
          nota: values.nota,
        });
        setDrawerOpen(false);
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
  }

  async function handleDelete() {
    if (!selectedDate) return;

    await swalApiConfirm({
      callback: async () => {
        try {
          await deleteMutation.mutateAsync({ id: selectedDate });
          setDrawerOpen(false);
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
    <div className={style.DayForm}>
      <Formik
        initialValues={getInitialValues(entry)}
        validationSchema={formSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
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
              {entry && (
                <Button
                  danger
                  type="text"
                  onClick={handleDelete}
                  block
                >
                  Eliminar registro
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
```

- [ ] **Step 2: Create `DayForm.module.scss`**

Create `src/app/(pages)/_container/DayForm/DayForm.module.scss`:

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
    color: $dark3;
    margin-bottom: 8px;
  }

  .radio-row {
    display: flex;
    gap: 10px;
  }

  .radio-btn {
    flex: 1;
    height: 44px;
    border: 2px solid $dark8;
    border-radius: 10px;
    background: transparent;
    font-size: 16px;
    font-weight: 700;
    color: $dark3;
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

- [ ] **Step 3: Commit**

```bash
git add src/app/\(pages\)/_container/DayForm/DayForm.tsx src/app/\(pages\)/_container/DayForm/DayForm.module.scss
git commit -m "feat: create DayForm component with Formik, validation, and confirm logic"
```

---

### Task 6: Create DayDrawer Component

**Files:**
- Create: `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx`
- Create: `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss`

- [ ] **Step 1: Create `DayDrawer.tsx`**

Create `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx`:

```typescript
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Drawer } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Components
import { DayForm } from '../DayForm/DayForm';
// ---Config
import style from './DayDrawer.module.scss';

dayjs.locale('es');

export function DayDrawer(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { drawerOpen, setDrawerOpen, selectedDate } = useBitacoraStore();

  const title = selectedDate
    ? dayjs(selectedDate).format('dddd D [de] MMMM')
    : '';

  // -----------------------RENDER
  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      placement="bottom"
      height="70vh"
      title={title}
      className={style.DayDrawer}
      destroyOnClose
    >
      <DayForm />
    </Drawer>
  );
}
```

- [ ] **Step 2: Create `DayDrawer.module.scss`**

Create `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.DayDrawer {
  .ant-drawer-content-wrapper {
    border-radius: 16px 16px 0 0;
    overflow: hidden;
  }

  .ant-drawer-header {
    text-transform: capitalize;
    font-weight: 600;
  }

  .ant-drawer-body {
    padding: 16px 20px;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(pages\)/_container/DayDrawer/DayDrawer.tsx src/app/\(pages\)/_container/DayDrawer/DayDrawer.module.scss
git commit -m "feat: create DayDrawer component with bottom placement"
```

---

### Task 7: Update BitacoraCalendar to Open Drawer

**Files:**
- Modify: `src/app/(pages)/_container/BitacoraCalendar/BitacoraCalendar.tsx`

- [ ] **Step 1: Update `BitacoraCalendar.tsx`**

Replace the entire contents of `src/app/(pages)/_container/BitacoraCalendar/BitacoraCalendar.tsx` with:

```typescript
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
  const { entries, selectedDate, setSelectedDate, setCurrentMonth, setDrawerOpen } = useBitacoraStore();

  const entriesByDate = new Map(entries.map((e) => [e.id, e]));

  // -----------------------MAIN METHODS
  function onSelect(date: Dayjs) {
    setSelectedDate(date.format('YYYY-MM-DD'));
    setDrawerOpen(true);
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
        {entry && entry.calificacion && (
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(pages\)/_container/BitacoraCalendar/BitacoraCalendar.tsx
git commit -m "feat: open drawer on day select, use entry.id as map key"
```

---

### Task 8: Update DaySummary to Use `id` as Date

**Files:**
- Modify: `src/app/(pages)/_container/DaySummary/DaySummary.tsx`

- [ ] **Step 1: Update `DaySummary.tsx`**

Replace the entire contents of `src/app/(pages)/_container/DaySummary/DaySummary.tsx` with:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(pages\)/_container/DaySummary/DaySummary.tsx
git commit -m "feat: update DaySummary to use entry.id as date, handle nulls"
```

---

### Task 9: Wire DayDrawer into BitacoraHome

**Files:**
- Modify: `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx`

- [ ] **Step 1: Update `BitacoraHome.tsx`**

Replace the entire contents of `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx` with:

```typescript
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Spin } from 'antd';
// ---Custom Hooks
import { useFetchBitacoraMonth } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Components
import { BitacoraCalendar } from '../BitacoraCalendar/BitacoraCalendar';
import { DaySummary } from '../DaySummary/DaySummary';
import { DayDrawer } from '../DayDrawer/DayDrawer';
// ---Config
import style from './BitacoraHome.module.scss';

export function BitacoraHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { isLoading } = useFetchBitacoraMonth();

  // -----------------------RENDER
  return (
    <div className={style.BitacoraHome}>
      <h1>Bitácora Alimentación</h1>

      {isLoading ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <BitacoraCalendar />
          <DaySummary />
        </>
      )}

      <DayDrawer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(pages\)/_container/BitacoraHome/BitacoraHome.tsx
git commit -m "feat: add DayDrawer to BitacoraHome"
```

---

### Task 10: Verify and Test in Browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open in browser (mobile viewport)**

Open `http://localhost:3000` and resize to mobile width (~375px) or use device emulation.

- [ ] **Step 3: Test golden path — create new entry**

1. Tap a day that has no entry
2. Drawer opens from bottom
3. Fill in peso, select calificación, select nivel, write a note
4. Tap "Guardar" — no confirm dialog (all fields were empty)
5. Drawer closes, calendar shows new dot

- [ ] **Step 4: Test edit with overwrite warning**

1. Tap the day just created
2. Drawer opens pre-filled
3. Change the peso value
4. Tap "Guardar" — swal confirm appears
5. Confirm → entry updates

- [ ] **Step 5: Test partial fill (no warning)**

1. Create an entry with only peso
2. Close drawer, reopen same day
3. Fill calificación and nivel (peso untouched)
4. Tap "Guardar" — no confirm (only filled empty fields)

- [ ] **Step 6: Test delete**

1. Open a day with entry
2. Tap "Eliminar registro"
3. Swal confirm appears
4. Confirm → entry deleted, drawer closes, dot disappears

- [ ] **Step 7: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
