# Bitacora Fit Road — UI/UX Redesign Spec

## Overview

Redesign the main interface from a monthly Ant Design calendar to a custom weekly-grid calendar (4 weeks around today), with inline day info, dual-mode drawer (read-only / form), weekly weight averages, and a dark-mode aesthetic.

## Goals

- See day overview (calificacion+nivel, peso, nota indicator) without clicking
- Drawer only opens as form for empty days; days with data show read-only first
- Calendar shows ~4 weeks (Mon-Sun): 3 past weeks + current week
- Weekly weight averages visible between week rows
- Modern dark-mode mobile-first UI

## Color System (in `_variables.scss`)

Modify existing system:

```scss
// Primary stays or adjusts slightly for dark bg contrast
$primaryColor: #16a4ab;

// New: dark theme base colors (plain variables)
$bgBase: #0f0f1a;
$bgCard: #1a1a2e;
$bgCardHover: #22223a;
$borderSubtle: #2a2a3e;
$textPrimary: #e8e8f0;
$textSecondary: #8888a0;
$textMuted: #55556a;

// Calificacion colors (plain variables)
$calA: #4ade80;
$calB: #60a5fa;
$calC: #fbbf24;
$calD: #f87171;
```

These live alongside the existing `mix()` scales. The primary color scale remains available for accent states (buttons, selection highlights, etc).

## Architecture & Components

### Data Flow Change

**New endpoint:** `bitacora.getByRange({ from: string, to: string })` — replaces `getByMonth`. Returns all entries within the date range (inclusive).

**Range calculation (client-side):**
- Find the Monday 3 weeks before the current week's Monday
- Find the Sunday of the current week
- That gives the 4-week window (28 days, or fewer if current week is incomplete)

**Store changes:**
- Remove `currentMonth`, `currentYear`
- Add `dateRange: { from: string; to: string }` (computed once on load, static — no pagination/navigation needed)
- Keep `selectedDate`, `drawerOpen`, `entries`

**Query hook:** `useFetchBitacoraRange()` — uses the store's `dateRange` to call `getByRange`.

### Component Tree

```
BitacoraHome
├── WeeklyCalendar
│   ├── DayCell (x28, one per day in range)
│   └── WeekSummaryBar (x4, one per week)
└── DayDrawer
    ├── DayReadView (when entry exists)
    └── DayForm (when entry is empty, or user clicks "Editar")
```

### WeeklyCalendar

Replaces `BitacoraCalendar`. Fully custom — no Ant Design Calendar.

- Grid: 7 columns (Lu, Ma, Mi, Ju, Vi, Sa, Do)
- 4 rows of days + 4 summary bars interleaved
- Fixed header row with day-of-week labels
- No month navigation — always shows the fixed 4-week window

### DayCell

Each cell (~50px wide, ~70px tall on mobile) contains:

1. **Day number** — top, small, dimmed for days outside current month
2. **Badge** — "B2" format (calificacion + nivel), background = calificacion color, text white/dark. Compact pill shape.
3. **Peso** — small text, e.g. "77.3"
4. **Note indicator** — tiny icon (a dot or small "N") only if `nota` is non-empty

**States:**
- Empty day: only day number visible, base card background
- Today: outlined with `$primaryColor`
- Selected: lighter background (`$bgCardHover`) to indicate selection
- Future days: slightly more dimmed than past days

**Tap behavior:**
- Day with entry → open drawer in read-only mode
- Day without entry → open drawer in form mode

### WeekSummaryBar

A thin horizontal bar between week rows:

- Shows: "Sem {weekNumber} — Prom: {avg} kg {arrow}"
- Arrow: "↓" green if average decreased vs previous week, "↑" red if increased
- If fewer than 2 days have peso data: show "—" instead of average
- Style: full width, smaller font, `$textSecondary` color, `$bgCard` background with slight border

### DayDrawer (modified)

Uses Ant Design `<Drawer>` with `placement="bottom"`.

**Mode logic:**
- If `selectedDate` has an entry → render `<DayReadView />`
- If no entry → render `<DayForm />`
- `DayReadView` has an "Editar" button that switches the drawer to form mode (local state `isEditing` inside the drawer)

**Height:**
- Read-only: `auto` or `50vh` (less tall, since it's just display)
- Form: `70vh` (needs more space for inputs)

### DayReadView (new)

Displays entry data in a presentable read-only format:

- Header: formatted date "Jueves 5 de junio"
- Large badge with calificacion letter + label (e.g. "B — Bien")
- Nivel shown as "Nivel 2" or similar
- Peso shown prominently: "77.3 kg"
- Nota in a styled blockquote (only if non-empty)
- "Editar" button at bottom

### DayForm (minimal changes)

Existing form stays mostly the same. Adjustments:
- Dark theme styling (inputs, buttons adapt to dark bg)
- Remove the "Eliminar" button from here — move to DayReadView as a secondary action

### BitacoraHome (modified)

- Remove `<DaySummary />` component entirely (its function is now in the drawer's DayReadView)
- Remove `<BitacoraCalendar />`, replace with `<WeeklyCalendar />`
- Update header text styling for dark theme

## Layout (mobile, ~390px viewport)

```
┌─────────────────────────────────────┐
│         Bitacora Fit Road           │  40px header
├──Lu──Ma──Mi──Ju──Vi──Sa──Do─────────┤  28px day labels
│ [19][20][21][22][23][24][25]        │  ~70px row
│  Sem 22 — Prom: 78.4 kg ↓          │  28px summary
│ [26][27][28][29][30][31][ 1]        │  ~70px row
│  Sem 23 — Prom: 77.9 kg ↓          │  28px summary
│ [ 2][ 3][ 4][ 5][ 6][ 7][ 8]      │  ~70px row
│  Sem 24 — Prom: 77.6 kg ↑          │  28px summary
│ [ 9][10][11][  ][  ][  ][  ]       │  ~70px row
│  Sem 25 — Prom: 77.2 kg ↑          │  28px summary
└─────────────────────────────────────┘
Total height: ~450px (fits in viewport without scroll)
```

## Files to Create

- `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.tsx`
- `src/app/(pages)/_container/WeeklyCalendar/WeeklyCalendar.module.scss`
- `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.tsx`
- `src/app/(pages)/_container/WeeklyCalendar/DayCell/DayCell.module.scss`
- `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.tsx`
- `src/app/(pages)/_container/WeeklyCalendar/WeekSummaryBar/WeekSummaryBar.module.scss`
- `src/app/(pages)/_container/WeeklyCalendar/calendarUtils.ts`
- `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx`
- `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.module.scss`

## Files to Modify

- `src/app/_styles/_variables.scss` — add dark theme + calificacion color variables
- `src/app/_styles/global.scss` — apply dark background to body/main
- `src/app/(pages)/_container/BitacoraHome/BitacoraHome.tsx` — replace calendar, remove DaySummary
- `src/app/(pages)/_container/BitacoraHome/BitacoraHome.module.scss` — dark theme
- `src/app/(pages)/_container/DayDrawer/DayDrawer.tsx` — dual mode logic
- `src/app/(pages)/_container/DayDrawer/DayDrawer.module.scss` — dark theme
- `src/app/(pages)/_container/DayForm/DayForm.module.scss` — dark theme inputs
- `src/app/_store/bitacoraData/bitacoraStore.ts` — remove month/year, add dateRange
- `src/app/_querys/bitacora/useFetchBitacora.ts` — new hook for range-based fetch
- `src/server/api/routers/bitacoraRouter.ts` — add `getByRange` endpoint

## Files to Delete

- `src/app/(pages)/_container/DaySummary/` (entire folder — functionality moves to DayReadView)
- `src/app/(pages)/_container/BitacoraCalendar/` (entire folder — replaced by WeeklyCalendar)

## Out of Scope

- Authentication
- Navigation/routing changes
- Desktop optimization (mobile-first only for now)
- Historical data beyond the 4-week window
- Charts or graphs
