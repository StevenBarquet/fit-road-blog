# Galeria Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a gallery page that displays fitness log photos across a date range with frequency-based sampling, two view modes (Grid/Timeline), and paginated results.

**Architecture:** New tRPC endpoint `getGallery` handles server-side frequency sampling and pagination. A Zustand store manages filter/UI state. The page has a collapsible filter panel and renders photos in either Grid (grouped by date) or Timeline (with weight) view. Ant Design components for DatePicker, Segmented, Image.PreviewGroup, and Pagination.

**Tech Stack:** Next.js 14 (App Router), tRPC, Zustand, Ant Design 5, dayjs, Yup, SCSS Modules

## Global Constraints

- No `useEffect` unless absolutely impossible otherwise
- SCSS modules must import variables and utils
- Root element uses `className={style.ComponentName}`, children use plain strings
- One level of SCSS nesting max
- Named exports only (except Next.js pages)
- `style` (singular) for SCSS module import
- Component structure: CONSTS/HOOKS/STATES → MAIN METHODS → AUX METHODS → RENDER
- No git commands — user handles all versioning

---

### Task 1: Yup Validation Schema for Gallery Endpoint

**Files:**
- Modify: `src/server/entities/bitacoraPictures/validations/model.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `galleryGetSchema` — validates `{ from: string, to: string, frequency: 'daily'|'weekly'|'monthly'|'yearly', page: number }`

- [ ] **Step 1: Add the gallery validation schema**

Add to `src/server/entities/bitacoraPictures/validations/model.ts`:

```ts
export const galleryGetSchema = yup.object({
  from: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  to: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  frequency: yup.string().required().oneOf(['daily', 'weekly', 'monthly', 'yearly']),
  page: yup.number().required().min(1).integer(),
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to the new schema.

---

### Task 2: Gallery Endpoint — tRPC Router

**Files:**
- Modify: `src/server/api/routers/bitacoraPicturesRouter.ts`

**Interfaces:**
- Consumes: `galleryGetSchema` from Task 1, `bitacoraRepo.find()`, `bitacoraPicturesRepo.findById()`
- Produces: `bitacoraPictures.getGallery` procedure — returns `{ items: Array<{ date: string, peso: number|null, images: Array<{base64: string, createdAt: string}> }>, totalPages: number, currentPage: number }`

- [ ] **Step 1: Add imports and helper types**

At the top of `src/server/api/routers/bitacoraPicturesRouter.ts`, add import for the new schema and dayjs:

```ts
import {
  picturesGetByDateSchema,
  picturesUpsertSchema,
  galleryGetSchema,
} from "src/server/entities/bitacoraPictures/validations/model";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
```

- [ ] **Step 2: Add the frequency sampling helper**

Add above the router definition:

```ts
const ITEMS_PER_PAGE = 10;

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

function sampleByFrequency(dates: string[], frequency: Frequency): string[] {
  if (frequency === 'daily') return dates;

  const groups = new Map<string, string[]>();

  for (const date of dates) {
    const d = dayjs(date);
    let key: string;

    if (frequency === 'weekly') {
      key = d.isoWeekday(1).format('YYYY-MM-DD');
    } else if (frequency === 'monthly') {
      key = d.format('YYYY-MM') + '-01';
    } else {
      key = d.format('YYYY') + '-01-01';
    }

    const group = groups.get(key) ?? [];
    group.push(date);
    groups.set(key, group);
  }

  const sampled: string[] = [];

  for (const [intervalStart, groupDates] of groups) {
    const target = dayjs(intervalStart);
    const closest = groupDates.reduce((best, current) => {
      const bestDiff = Math.abs(dayjs(best).diff(target, 'day'));
      const currentDiff = Math.abs(dayjs(current).diff(target, 'day'));
      return currentDiff < bestDiff ? current : best;
    });
    sampled.push(closest);
  }

  return sampled.sort();
}
```

- [ ] **Step 3: Add the getGallery procedure to the router**

Inside `createTRPCRouter({...})`, add after `upsert`:

```ts
  getGallery: publicProcedure
    .input(async (raw) => await galleryGetSchema.validate(raw))
    .query(async ({ input }) => {
      const { from, to, frequency, page } = input;

      const allEntries = await bitacoraRepo.find();
      const withPictures = allEntries.results.filter(
        (entry) => entry.id >= from && entry.id <= to && entry.hasPictures
      );

      const candidateDates = withPictures.map((e) => e.id).sort();
      const sampledDates = sampleByFrequency(candidateDates, frequency as Frequency);

      const totalPages = Math.max(1, Math.ceil(sampledDates.length / ITEMS_PER_PAGE));
      const currentPage = Math.min(page, totalPages);
      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageDates = sampledDates.slice(startIdx, startIdx + ITEMS_PER_PAGE);

      const entryMap = new Map(withPictures.map((e) => [e.id, e]));

      const items = await Promise.all(
        pageDates.map(async (date) => {
          const entry = entryMap.get(date)!;
          const picDoc = await bitacoraPicturesRepo.findById(date);
          const images = picDoc ? (picDoc.data as { images: Array<{ base64: string; createdAt: string }> }).images : [];
          return { date, peso: entry.peso, images };
        })
      );

      return { items, totalPages, currentPage };
    }),
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 3: Zustand Store — Galeria

**Files:**
- Create: `src/app/_store/galeria/galeriaStore.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `useGaleriaStore` hook with state `{ from, to, frequency, page, viewMode, panelOpen }` and actions `{ setFilters, setPage, setViewMode, setPanelOpen, reset }`

- [ ] **Step 1: Create the store file**

Create `src/app/_store/galeria/galeriaStore.ts`:

```ts
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ViewMode = 'grid' | 'timeline';

interface State {
  from: string | null;
  to: string | null;
  frequency: Frequency;
  page: number;
  viewMode: ViewMode;
  panelOpen: boolean;
}

const initialState: State = {
  from: null,
  to: null,
  frequency: 'daily',
  page: 1,
  viewMode: 'grid',
  panelOpen: true,
};

export interface GaleriaStore extends State {
  setFilters: (filters: { from: string; to: string; frequency: Frequency }) => void;
  setPage: (page: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setPanelOpen: (open: boolean) => void;
  reset: () => void;
}

const actions: StateCreator<GaleriaStore> = (set) => ({
  ...initialState,
  setFilters: ({ from, to, frequency }) => set({ from, to, frequency, page: 1, panelOpen: false }),
  setPage: (page) => set({ page }),
  setViewMode: (viewMode) => set({ viewMode }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  reset: () => set(initialState),
});

export const useGaleriaStore = create<GaleriaStore>()(
  devtools(actions, { name: 'Galeria' }),
);
```

Note: `setFilters` also sets `panelOpen: false` to auto-collapse the panel on search.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 4: Fetch Hook — useFetchGallery

**Files:**
- Create: `src/app/_querys/bitacoraPictures/useFetchGallery.ts`

**Interfaces:**
- Consumes: `bitacoraPictures.getGallery` tRPC procedure (Task 2), `useGaleriaStore` (Task 3)
- Produces: `useFetchGallery()` hook — returns tRPC query result

- [ ] **Step 1: Create the hook file**

Create `src/app/_querys/bitacoraPictures/useFetchGallery.ts`:

```ts
import { api } from 'src/app/_providers/_trpc/react';
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';

export function useFetchGallery() {
  const { from, to, frequency, page } = useGaleriaStore();

  return api.bitacoraPictures.getGallery.useQuery(
    { from: from!, to: to!, frequency, page },
    { enabled: !!from && !!to },
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 5: GaleriaFilters Component

**Files:**
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaFilters/GaleriaFilters.tsx`
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaFilters/GaleriaFilters.module.scss`

**Interfaces:**
- Consumes: `useGaleriaStore` (Task 3)
- Produces: `GaleriaFilters` component — collapsible panel with DatePicker range, Segmented frequency, Segmented viewMode, and search button

- [ ] **Step 1: Create the SCSS file**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaFilters/GaleriaFilters.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.GaleriaFilters {
  .filter-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }

  .filter-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-row label {
    font-size: 12px;
    color: $textSecondary;
    font-weight: 500;
  }

  .actions-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }
}
```

- [ ] **Step 2: Create the component**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaFilters/GaleriaFilters.tsx`:

```tsx
'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Button, DatePicker, Segmented } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
// ---Config
import style from './GaleriaFilters.module.scss';

const FREQUENCY_OPTIONS = [
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
];

const VIEW_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'Timeline', value: 'timeline' },
];

export function GaleriaFilters(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { from, to, frequency, viewMode, panelOpen, setFilters, setViewMode, setPanelOpen } = useGaleriaStore();

  const [localFrom, setLocalFrom] = useState<Dayjs | null>(from ? dayjs(from) : null);
  const [localTo, setLocalTo] = useState<Dayjs | null>(to ? dayjs(to) : null);
  const [localFrequency, setLocalFrequency] = useState(frequency);

  // -----------------------MAIN METHODS
  function handleSearch() {
    if (!localFrom || !localTo) return;
    setFilters({
      from: localFrom.format('YYYY-MM-DD'),
      to: localTo.format('YYYY-MM-DD'),
      frequency: localFrequency,
    });
  }

  // -----------------------RENDER
  return (
    <div className={style.GaleriaFilters}>
      <Button
        type="text"
        block
        onClick={() => setPanelOpen(!panelOpen)}
        icon={panelOpen ? <UpOutlined /> : <DownOutlined />}
      >
        Filtros
      </Button>

      {panelOpen && (
        <div className="filter-content">
          <div className="filter-row">
            <label>Desde</label>
            <DatePicker
              value={localFrom}
              onChange={setLocalFrom}
              format="DD-MMM-YYYY"
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-row">
            <label>Hasta</label>
            <DatePicker
              value={localTo}
              onChange={setLocalTo}
              format="DD-MMM-YYYY"
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-row">
            <label>Frecuencia</label>
            <Segmented
              options={FREQUENCY_OPTIONS}
              value={localFrequency}
              onChange={(val) => setLocalFrequency(val as typeof localFrequency)}
              block
            />
          </div>

          <div className="filter-row">
            <label>Vista</label>
            <Segmented
              options={VIEW_OPTIONS}
              value={viewMode}
              onChange={(val) => setViewMode(val as 'grid' | 'timeline')}
              block
            />
          </div>

          <div className="actions-row">
            <Button
              type="primary"
              block
              onClick={handleSearch}
              disabled={!localFrom || !localTo}
            >
              Buscar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 6: GaleriaGrid Component

**Files:**
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaGrid/GaleriaGrid.tsx`
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaGrid/GaleriaGrid.module.scss`

**Interfaces:**
- Consumes: `useFetchGallery()` result items passed as prop `items: Array<{ date: string, peso: number|null, images: Array<{base64: string, createdAt: string}> }>`
- Produces: `GaleriaGrid` component — renders date-grouped photo grid with preview

- [ ] **Step 1: Create the SCSS file**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaGrid/GaleriaGrid.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.GaleriaGrid {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .date-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .date-group h3 {
    font-size: 14px;
    color: $textSecondary;
    margin: 0;
    font-weight: 500;
  }

  .date-group .images-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 2: Create the component**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaGrid/GaleriaGrid.tsx`:

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Image } from 'antd';
import dayjs from 'dayjs';
// ---Config
import style from './GaleriaGrid.module.scss';

interface GalleryItem {
  date: string;
  peso: number | null;
  images: Array<{ base64: string; createdAt: string }>;
}

interface Props {
  items: GalleryItem[];
}

export function GaleriaGrid({ items }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaGrid}>
      {items.map((item) => (
        <div key={item.date} className="date-group">
          <h3>{dayjs(item.date).format('DD-MMM-YYYY')}</h3>
          <div className="images-row">
            <Image.PreviewGroup>
              {item.images.map((pic, i) => (
                <Image
                  key={i}
                  src={pic.base64}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 7: GaleriaTimeline Component

**Files:**
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaTimeline/GaleriaTimeline.tsx`
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaTimeline/GaleriaTimeline.module.scss`

**Interfaces:**
- Consumes: Same `items` prop shape as GaleriaGrid
- Produces: `GaleriaTimeline` component — vertical timeline with date, weight, and photos

- [ ] **Step 1: Create the SCSS file**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaTimeline/GaleriaTimeline.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.GaleriaTimeline {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .timeline-entry {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background: $bgCard;
    border-radius: 8px;
  }

  .timeline-entry .entry-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 90px;
  }

  .timeline-entry .entry-info .entry-date {
    font-size: 12px;
    color: $textSecondary;
    font-weight: 500;
  }

  .timeline-entry .entry-info .entry-peso {
    font-size: 16px;
    color: $textPrimary;
    font-weight: 600;
  }

  .timeline-entry .entry-images {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 2: Create the component**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaTimeline/GaleriaTimeline.tsx`:

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Image } from 'antd';
import dayjs from 'dayjs';
// ---Config
import style from './GaleriaTimeline.module.scss';

interface GalleryItem {
  date: string;
  peso: number | null;
  images: Array<{ base64: string; createdAt: string }>;
}

interface Props {
  items: GalleryItem[];
}

export function GaleriaTimeline({ items }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaTimeline}>
      {items.map((item) => (
        <div key={item.date} className="timeline-entry">
          <div className="entry-info">
            <span className="entry-date">{dayjs(item.date).format('DD-MMM-YYYY')}</span>
            {item.peso && <span className="entry-peso">{item.peso} kg</span>}
          </div>
          <div className="entry-images">
            <Image.PreviewGroup>
              {item.images.map((pic, i) => (
                <Image
                  key={i}
                  src={pic.base64}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 8: GaleriaPagination Component

**Files:**
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaPagination/GaleriaPagination.tsx`
- Create: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaPagination/GaleriaPagination.module.scss`

**Interfaces:**
- Consumes: `useGaleriaStore` (page, setPage), totalPages from query result passed as prop
- Produces: `GaleriaPagination` component — numeric pagination controls

- [ ] **Step 1: Create the SCSS file**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaPagination/GaleriaPagination.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.GaleriaPagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
```

- [ ] **Step 2: Create the component**

Create `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaPagination/GaleriaPagination.tsx`:

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Pagination } from 'antd';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
// ---Config
import style from './GaleriaPagination.module.scss';

interface Props {
  totalPages: number;
}

export function GaleriaPagination({ totalPages }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { page, setPage } = useGaleriaStore();

  // -----------------------RENDER
  return (
    <div className={style.GaleriaPagination}>
      <Pagination
        current={page}
        total={totalPages * 10}
        pageSize={10}
        onChange={setPage}
        showSizeChanger={false}
        size="default"
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 9: GaleriaHome — Wire Everything Together

**Files:**
- Modify: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaHome.tsx`
- Modify: `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaHome.module.scss`

**Interfaces:**
- Consumes: `GaleriaFilters` (Task 5), `GaleriaGrid` (Task 6), `GaleriaTimeline` (Task 7), `GaleriaPagination` (Task 8), `useFetchGallery` (Task 4), `useGaleriaStore` (Task 3)
- Produces: Complete `GaleriaHome` page component

- [ ] **Step 1: Update the SCSS file**

Replace `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaHome.module.scss`:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.GaleriaHome {
  @include pageContainer();

  .results-section {
    margin-top: 16px;
  }

  .empty-text {
    text-align: center;
    color: $textMuted;
    padding: 40px 0;
    font-size: 14px;
  }

  .loading-text {
    text-align: center;
    color: $textSecondary;
    padding: 40px 0;
    font-size: 14px;
  }
}
```

- [ ] **Step 2: Rewrite the component**

Replace `src/app/(pages)/galeria/_container/GaleriaHome/GaleriaHome.tsx`:

```tsx
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
import { useFetchGallery } from 'src/app/_querys/bitacoraPictures/useFetchGallery';
// ---Components
import { PageHeader } from 'src/app/_layout/PageHeader/PageHeader';
import { GaleriaFilters } from './GaleriaFilters/GaleriaFilters';
import { GaleriaGrid } from './GaleriaGrid/GaleriaGrid';
import { GaleriaTimeline } from './GaleriaTimeline/GaleriaTimeline';
import { GaleriaPagination } from './GaleriaPagination/GaleriaPagination';
// ---Config
import style from './GaleriaHome.module.scss';

export function GaleriaHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { from, viewMode } = useGaleriaStore();
  const galleryQuery = useFetchGallery();

  const hasSearched = !!from;
  const items = galleryQuery.data?.items ?? [];
  const totalPages = galleryQuery.data?.totalPages ?? 1;

  // -----------------------RENDER
  return (
    <div className={style.GaleriaHome}>
      <PageHeader subtitle="galería" />
      <GaleriaFilters />

      {hasSearched && (
        <div className="results-section">
          {galleryQuery.isLoading && (
            <p className="loading-text">Cargando...</p>
          )}

          {galleryQuery.isSuccess && items.length === 0 && (
            <p className="empty-text">Sin fotos en este rango</p>
          )}

          {galleryQuery.isSuccess && items.length > 0 && (
            <>
              {viewMode === 'grid' && <GaleriaGrid items={items} />}
              {viewMode === 'timeline' && <GaleriaTimeline items={items} />}
              <GaleriaPagination totalPages={totalPages} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Manual test in browser**

Run the dev server and navigate to `/galeria`:
1. Verify filter panel is open by default with no photos shown
2. Select a date range and frequency, click "Buscar"
3. Verify panel collapses and results appear
4. Toggle between Grid and Timeline views
5. Test pagination if enough results
6. Verify Image preview works on click
7. Test with a range that has no photos — verify empty state
