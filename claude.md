# Project Rules

## Stack

- Next.js 14 (App Router)
- tRPC (with SuperJSON transformer, Yup for input validation)
- React Query (via tRPC react hooks)
- Ant Design 5 (ConfigProvider for theming)
- Formik + Yup for forms
- Zustand (with devtools middleware) for client state
- Firebase/Firestore as database (via `createFirestoreRepo` pattern)
- SCSS Modules for styling
- dayjs for dates
- react-forge-grid (Frow, Fcol) for form layouts
- TypeScript strict

## Project Structure

```
src/
├── app/
│   ├── (pages)/          # Route groups
│   │   ├── _container/   # Page-level components (one per page)
│   │   └── page.tsx      # Thin — just re-exports the container
│   ├── _common/          # Shared reusable components
│   ├── _querys/          # tRPC fetch hooks (one file per entity)
│   ├── _store/           # Zustand stores (one folder per domain)
│   ├── _providers/       # Context providers (tRPC, Antd, etc)
│   ├── _utils/           # Hooks and utility functions
│   ├── _styles/          # Global SCSS (variables, utils, theme)
│   ├── _layout/          # Layout wrapper components
│   └── _config/          # App-level config
├── server/
│   ├── api/
│   │   ├── trpc.ts       # tRPC initialization (don't touch)
│   │   ├── root.ts       # Router aggregation
│   │   └── routers/      # One router per entity
│   ├── entities/         # Types and models per entity
│   └── firebase/         # Firestore config and repo factory
└── shared/               # Shared between client and server
```

## Component Conventions

### Structure

Every component follows this internal structure:

```tsx
// -----------------------CONSTS, HOOKS, STATES
// -----------------------MAIN METHODS
// -----------------------AUX METHODS
// -----------------------RENDER
```

### Naming and Files

- Component name in PascalCase matches its folder and file name
- Each component lives in its own folder: `ComponentName/ComponentName.tsx`
- SCSS module file: `ComponentName/ComponentName.module.scss`
- Auxiliary files (utils, constants) go in the same folder

### Style Import Variable

Use `style` (singular), not `styles`:

```tsx
import style from './MyComponent.module.scss';
```

### className Usage

- The root element uses the SCSS module reference: `className={style.ComponentName}`
- All child elements use plain string classNames: `className="child-class"`
- Never reference `style.xxx` for anything other than the root element
- This works because SCSS modules have class collision names disabled in this project
- If the component has NO SCSS file, the root also uses a plain string: `className="ComponentName"`

## Styling Rules

### SCSS Module Boilerplate

Every SCSS module file MUST import variables and utils, even if not immediately used:

```scss
@import '/src/app/_styles/variables';
@import '/src/app/_styles/utils';

.ComponentName {
  // styles here
}
```

### Minimize classNames in JSX

- The root element gets the component name className — that's mandatory
- For child elements, prefer targeting HTML tag specificity inside the parent scope rather than adding classNames
- Good targets: `h1`, `h2`, `header`, `footer`, `ul`, `li`, `button`, `blockquote`, `table`, `th`, `td`, `p`, `strong`, `small`
- Avoid targeting overly generic tags: `span`, `div` — these need a className
- Only add a className when the tag is too generic or when there are multiple sibling elements of the same tag that need different styles

```scss
// GOOD: targeting specific tags within component scope
.DaySummary {
  header { ... }
  ul { ... }
  li { ... }
  blockquote { ... }
}

// GOOD: className only when needed for specificity
.DaySummary {
  .badge { ... }
  .empty { ... }
}
```

### Nesting Rules

- Only 1 level of nesting depth inside the component class
- For deeper specificity, chain class names on the same level:

```scss
// GOOD
.Parent {
  .child .grandchild { ... }
}

// BAD
.Parent {
  .child {
    .grandchild { ... }
  }
}
```

### No :global Required

SCSS modules have class collision names disabled — no need for `:global` to target library classes (like Ant Design). Just write them directly:

```scss
.BitacoraCalendar {
  .ant-picker-calendar { ... }
}
```

### No Inline Styles (almost)

- Never use inline `style={{}}` for layout or design
- Acceptable inline style: dynamic values that come from JS (like `backgroundColor` from a variable/map)
- If you already have a className, all its styles go in the SCSS file

### Style Responsibility

- Each component is responsible for styling its OWN elements only
- Never style a child component's internal elements from a parent's SCSS
- You CAN control a child component's positioning/margin from the parent (e.g., margin, grid placement)

## tRPC Conventions

### Router Structure

- One router file per entity in `src/server/api/routers/`
- Use Yup for input validation (not Zod)
- Validation via `.input(async (raw) => await schema.validate(raw))`
- Register routers in `src/server/api/root.ts`

### When Routers Grow

- If a router file grows large, extract logic (mock data, helpers, validation schemas) into separate files in the same directory or in `src/server/entities/<entity>/`

### Client-Side Hooks

- Fetch hooks live in `src/app/_querys/<entity>/`
- Hook names: `useFetch<Entity><Action>` (e.g., `useFetchBitacoraMonth`)
- Hooks connect tRPC queries to the zustand store via `onSuccess` callback in the query options

## Zustand Store Conventions

- One store per domain in `src/app/_store/<domain>/`
- Always use `devtools` middleware with a descriptive name
- Define `State` interface, `initialState`, and the store interface extending State
- Always include a `reset` method
- Derived/computed values can be functions on the store (e.g., `getSelectedEntry`)
- Use the `update` pattern from plop template for simple stores: `update: (data) => set((state) => ({ ...state, ...data }))`

## Environment Variables

### Structure

```
src/env/
├── profiles/
│   ├── default.mjs    # Base variables (shared across all environments)
│   ├── dev.mjs        # Dev-only overrides
│   ├── prod.mjs       # Prod-only overrides
│   └── secrets.js     # Sensitive values (gitignored, local-only)
└── loadEnvs.mjs       # Loader: merges layers, validates, exports
```

### How It Works

- `loadEnvs.mjs` merges: `defaultEnvs + runtimeEnvs (dev or prod based on NODE_ENV)`
- Runtime envs override default envs on key collision
- After merge, `verify()` validates that no variable is undefined or empty string — fails fast with descriptive error
- Final typed export: `src/shared/config/allEnvs.ts` casts the validated result as `NonUndefined<>` so TypeScript knows all values are `string`

### Adding a New Variable

1. **Non-sensitive:** Add directly in `default.mjs`, `dev.mjs`, or `prod.mjs` as appropriate
2. **Sensitive:** Add to `secrets.js` with the real value, then reference it in `default.mjs` (or `prod.mjs`) with the pattern:
   ```js
   MY_VAR = process.env.MY_VAR || secrets?.MY_VAR;
   ```
3. Import from `src/shared/config/allEnvs` wherever needed — never use `process.env` directly in app code

### Conventions

- Frontend variables require `NEXT_PUBLIC_` prefix
- `secrets.js` is the local fallback; in production, values are injected via `process.env`
- Each profile file uses the `class Environments` + named export pattern
- Never commit `secrets.js` — it's gitignored

## Form Conventions (Formik)

### Custom Hook Pattern

Every form MUST be implemented through a custom hook that encapsulates all Formik logic. The component only renders — it never owns form state or submit logic.

```tsx
// useMyForm.ts
export function useMyForm() {
  const formik = useFormik({
    initialValues: { ... },
    validationSchema: mySchema,
    onSubmit: async (values) => { ... },
  });

  return { formik };
}

// MyFormComponent.tsx
export function MyFormComponent(): ReactElement {
  const { formik } = useMyForm();
  // render using formik.values, formik.handleChange, etc.
}
```

### Rules

- The hook returns `{ formik }` (and any extra helpers if needed)
- All submit logic, validation, side effects (swal confirms, mutations, drawer closing) live in the hook
- The component is purely presentational — it destructures from the hook and renders
- Hook file lives in the same folder as the component: `ComponentName/useComponentNameForm.ts`

## useEffect Rules

- **Never use `useEffect` unless absolutely impossible to achieve otherwise**
- For syncing server data to store: use `onSuccess` callbacks in tRPC query hooks
- For derived state: compute it inline or use Zustand computed functions
- For subscriptions/event listeners: use dedicated hooks (`useEventListener`)
- If you think you need `useEffect`, first consider: Zustand, context, `onSuccess`, computed values, or restructuring the data flow
- The only acceptable uses: third-party library integration that requires imperative setup, or browser APIs with no React binding

## TypeScript Conventions

- Use `type` imports where possible
- Export constants with `as const` for literal types
- Define domain types in `src/server/entities/<entity>/`
- Prefer union types over enums (`'A' | 'B' | 'C' | 'D'`)
- Extract constants arrays for runtime use: `const CALIFICACIONES = ['A', 'B', 'C', 'D'] as const`

## General Code Style

- Use named exports, never default exports (except Next.js pages that require it)
- `'use client'` directive at the top of client components
- Explicit return types on components (`: ReactElement`)
- No comments explaining WHAT — only WHY when non-obvious
- Keep JSX clean and readable — minimal props, minimal className noise
- Prefer semantic HTML tags for both accessibility and styling convenience
- Responsive design via the `onlyIn()` mixin (mob, desk, xs, sm, md, lg, xl, xxl)

## File Organization

- Imports order: Dependencies → UI Dependencies → Custom Hooks → Components → Config/Utils → Styles
- Mark import sections with comments: `// ---Dependencies`, `// ---Custom Hooks`, `// ---Components`, `// ---Config`
