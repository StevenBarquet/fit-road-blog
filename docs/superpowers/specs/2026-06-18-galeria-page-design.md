# Galeria Page — Design Spec

## Overview

Page `/galeria` for browsing fitness log photos across a date range with frequency-based sampling and pagination. Two view modes: Grid (grouped by date) and Timeline (progress-focused with weight data).

## UX Flow

1. User arrives → filter panel open, no photos loaded
2. User configures range + frequency → clicks "Buscar"
3. Panel collapses automatically → results appear
4. User can toggle between Grid/Timeline views
5. Pagination at the bottom for navigating results

## Filter Panel (collapsible, open by default)

- **RangePicker**: Desde / Hasta (Ant Design DatePicker)
- **Frequency**: Segmented control — Diario / Semanal / Mensual / Anual
- **View toggle**: Grid / Timeline
- **Buscar button**: launches query and collapses panel

Panel can be re-opened to adjust filters.

## Vista Grid (agrupada por fecha)

Each date is a vertical block:
- Date header in format `DD-MMM-YYYY` (e.g. "14-Ene-2025")
- Row of 1-3 square thumbnails, clickeable for fullscreen preview (`Image.PreviewGroup`)

Blocks stack vertically with spacing between them.

## Vista Timeline

Each entry is a horizontal card:
- Date (`DD-MMM-YYYY`) + peso (e.g. "72.5 kg") on one side
- Photo thumbnail(s) on the other side

Vertical scroll between entries. Designed for visual progress comparison over time.

## Frequency Sampling Logic

- **Diario**: All dates with photos in range. Skip dates without photos.
- **Semanal**: For each week, pick the date with photos closest to Monday. Skip weeks without photos.
- **Mensual**: For each month, pick the date with photos closest to the 1st. Skip months without photos.
- **Anual**: For each year, pick the date with photos closest to Jan 1st. Skip years without photos.

"Photos" means all images (1-3) from that date — the entire day's entry is shown.

## Pagination

- 10 dates per page (max 30 images per request)
- Numeric pagination controls, mobile-friendly sizing
- Always rendered during development; production behavior: hidden when totalPages <= 1

## Empty States

- No query yet: brief text prompting to configure filters
- No results: brief text indicating no photos found in range

## Backend — New Endpoint `getGallery`

Added to `bitacoraPicturesRouter`.

### Input

```ts
{
  from: string        // YYYY-MM-DD
  to: string          // YYYY-MM-DD
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  page: number        // 1-based
}
```

### Logic

1. Query `bitacora` collection: filter by date range + `hasPictures: true` → list of candidate dates
2. Apply frequency sampling:
   - Daily: use all candidate dates
   - Weekly/Monthly/Yearly: group candidates by interval, for each group pick the date closest to interval start
3. Paginate sampled dates (10 per page)
4. Fetch images from `bitacora_pictures` only for current page's dates
5. Fetch peso from `bitacora` entries for current page's dates

### Output

```ts
{
  items: Array<{
    date: string              // YYYY-MM-DD
    peso: number | null
    images: Array<{ base64: string, createdAt: string }>
  }>
  totalPages: number
  currentPage: number
}
```

## Client Components

```
src/app/(pages)/galeria/_container/GaleriaHome/
├── GaleriaHome.tsx
├── GaleriaHome.module.scss
├── GaleriaFilters/
│   ├── GaleriaFilters.tsx
│   └── GaleriaFilters.module.scss
├── GaleriaGrid/
│   ├── GaleriaGrid.tsx
│   └── GaleriaGrid.module.scss
├── GaleriaTimeline/
│   ├── GaleriaTimeline.tsx
│   └── GaleriaTimeline.module.scss
└── GaleriaPagination/
    ├── GaleriaPagination.tsx
    └── GaleriaPagination.module.scss
```

## Zustand Store

**File**: `src/app/_store/galeria/galeriaStore.ts`

```ts
State:
  - from: string | null
  - to: string | null
  - frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  - page: number
  - viewMode: 'grid' | 'timeline'
  - panelOpen: boolean

Actions:
  - setFilters({ from, to, frequency }) → resets page to 1
  - setPage(page)
  - setViewMode(mode)
  - setPanelOpen(open)
  - reset()
```

Default frequency: `'daily'`. Default viewMode: `'grid'`. Default panelOpen: `true`.

## Fetch Hook

**File**: `src/app/_querys/bitacoraPictures/useFetchGallery.ts`

Calls `bitacoraPictures.getGallery` with store params. Enabled only when `from` and `to` are not null. Data consumed directly from query result (not persisted to store).

## Date Format

All user-facing dates display as `DD-MMM-YYYY` (e.g. "14-Ene-2025") using dayjs with Spanish locale.

## Dependencies

- Ant Design: DatePicker, Segmented, Image, Pagination, Button, Collapse/custom panel
- dayjs (already in project)
- Zustand (new store)
- tRPC (new endpoint)
