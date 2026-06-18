# Bitacora Pictures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add photo upload support to bitacora entries using a separate Firestore collection, keeping the main calendar fetch lightweight.

**Architecture:** A new `bitacora_pictures` collection stores arrays of base64 images keyed by date. The existing `ModelBitacora` gets a `hasPictures` boolean flag. Client-side compression (canvas resize to 800px, JPEG 0.7) keeps payloads under Firestore's 1MB document limit. Images are fetched lazily only when opening a day's detail.

**Tech Stack:** Next.js 14, tRPC, Firestore, Ant Design Upload/Image, Yup, Formik, Zustand, canvas API for compression.

## Global Constraints

- SCSS modules must import variables and utils even if unused
- Components follow `// ---CONSTS, HOOKS, STATES / MAIN METHODS / AUX METHODS / RENDER` structure
- Named exports only (no default exports except Next.js pages)
- `style` (singular) for SCSS module imports
- Root element gets `className={style.ComponentName}`, children get plain strings
- No `useEffect` unless absolutely impossible otherwise
- Import sections marked with comments: `// ---Dependencies`, `// ---Custom Hooks`, `// ---Components`, `// ---Config`
- No git operations — user handles all versioning

---

### Task 1: Server — Entity Types & Firestore Repo for bitacora_pictures

**Files:**
- Modify: `src/server/firebase/dbConstants.ts`
- Create: `src/server/entities/bitacoraPictures/bitacoraPicturesTypes.ts`
- Create: `src/server/entities/bitacoraPictures/db/documentModel.ts`

**Interfaces:**
- Consumes: `createFirestoreRepo` from `src/server/firebase/firestoreRepo`
- Produces: `ModelBitacoraPictures`, `BitacoraPictureItem`, `BitacoraPicturesFromDB`, `bitacoraPicturesRepo`

- [ ] **Step 1: Add collection name to dbConstants**

In `src/server/firebase/dbConstants.ts`, add `bitacora_pictures` to `TABLE_NAMES`:

```typescript
export const TABLE_NAMES = {
  bitacora: 'bitacora',
  bitacora_pictures: 'bitacora_pictures',
} as const;
```

- [ ] **Step 2: Create entity types**

Create `src/server/entities/bitacoraPictures/bitacoraPicturesTypes.ts`:

```typescript
export interface BitacoraPictureItem {
  base64: string;
  createdAt: string;
}

export interface ModelBitacoraPictures {
  images: BitacoraPictureItem[];
}

export interface BitacoraPicturesFromDB extends ModelBitacoraPictures {
  id: string;
}
```

- [ ] **Step 3: Create Firestore repo**

Create `src/server/entities/bitacoraPictures/db/documentModel.ts`:

```typescript
import { createFirestoreRepo } from "src/server/firebase/firestoreRepo";
import { type ModelBitacoraPictures } from "../bitacoraPicturesTypes";

export const bitacoraPicturesRepo = createFirestoreRepo<ModelBitacoraPictures>({
  collectionName: 'bitacora_pictures',
});
```

- [ ] **Step 4: Add hasPictures to ModelBitacora**

In `src/server/entities/bitacora/bitacoraTypes.ts`, add `hasPictures` field:

```typescript
export interface ModelBitacora {
  peso: number | null;
  calificacion: Calificacion | null;
  nivel: Nivel | null;
  nota: string;
  hasPictures: boolean;
}
```

- [ ] **Step 5: Update bitacora validation schema**

In `src/server/entities/bitacora/validations/model.ts`, add `hasPictures` to `bitacoraUpsertSchema`:

```typescript
export const bitacoraUpsertSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
  hasPictures: yup.boolean().default(false),
});
```

- [ ] **Step 6: Verify the dev server compiles**

Run: `npm run build` or check that the dev server has no TypeScript errors.

---

### Task 2: Server — tRPC Router for bitacora_pictures

**Files:**
- Create: `src/server/entities/bitacoraPictures/validations/model.ts`
- Create: `src/server/api/routers/bitacoraPicturesRouter.ts`
- Modify: `src/server/api/root.ts`

**Interfaces:**
- Consumes: `bitacoraPicturesRepo`, `BitacoraPicturesFromDB` from Task 1
- Produces: `bitacoraPicturesRouter` with endpoints `getByDate` and `upsert`

- [ ] **Step 1: Create validation schemas**

Create `src/server/entities/bitacoraPictures/validations/model.ts`:

```typescript
import * as yup from 'yup';

export const picturesGetByDateSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});

export const picturesUpsertSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  images: yup.array().of(
    yup.object({
      base64: yup.string().required(),
      createdAt: yup.string().required(),
    })
  ).max(3).required(),
});
```

- [ ] **Step 2: Create the tRPC router**

Create `src/server/api/routers/bitacoraPicturesRouter.ts`:

```typescript
import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { bitacoraPicturesRepo } from "src/server/entities/bitacoraPictures/db/documentModel";
import { bitacoraRepo } from "src/server/entities/bitacora/db/documentModel";
import {
  picturesGetByDateSchema,
  picturesUpsertSchema,
} from "src/server/entities/bitacoraPictures/validations/model";
import { type BitacoraPicturesFromDB } from "src/server/entities/bitacoraPictures/bitacoraPicturesTypes";

export const bitacoraPicturesRouter = createTRPCRouter({
  getByDate: publicProcedure
    .input(async (raw) => await picturesGetByDateSchema.validate(raw))
    .query(async ({ input }) => {
      const result = await bitacoraPicturesRepo.findById(input.id);
      if (!result) return null;
      return { id: result.id, ...result.data } as BitacoraPicturesFromDB;
    }),

  upsert: publicProcedure
    .input(async (raw) => await picturesUpsertSchema.validate(raw))
    .mutation(async ({ input }) => {
      const { id, images } = input;

      if (images.length === 0) {
        await bitacoraPicturesRepo.delete(id);
        await bitacoraRepo.upsert({ id, hasPictures: false });
      } else {
        await bitacoraPicturesRepo.upsert({ id, images });
        await bitacoraRepo.upsert({ id, hasPictures: true });
      }

      return { success: true, id };
    }),
});
```

- [ ] **Step 3: Register router in root**

In `src/server/api/root.ts`, add the new router:

```typescript
import { bitacoraRouter } from "src/server/api/routers/bitacoraRouter";
import { bitacoraPicturesRouter } from "src/server/api/routers/bitacoraPicturesRouter";
import { createCallerFactory, createTRPCRouter } from "src/server/api/trpc";

export const appRouter = createTRPCRouter({
  bitacora: bitacoraRouter,
  bitacoraPictures: bitacoraPicturesRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
```

- [ ] **Step 4: Verify dev server compiles**

Check that the dev server shows no errors with the new router registered.

---

### Task 3: Client — Compression Utility & Fetch Hooks

**Files:**
- Create: `src/app/_utils/compressImage.ts`
- Create: `src/app/_querys/bitacoraPictures/useFetchBitacoraPictures.ts`

**Interfaces:**
- Consumes: `api.bitacoraPictures` tRPC client (auto-generated from router in Task 2)
- Produces: `compressImageToBase64(file: File): Promise<string>`, `useFetchBitacoraPictures(dateId)`, `useUpsertBitacoraPictures()`

- [ ] **Step 1: Create compression utility**

Create `src/app/_utils/compressImage.ts`:

```typescript
const MAX_WIDTH = 800;
const QUALITY = 0.7;

export function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', QUALITY);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 2: Create fetch hooks**

Create `src/app/_querys/bitacoraPictures/useFetchBitacoraPictures.ts`:

```typescript
import { api } from 'src/app/_providers/_trpc/react';

export function useFetchBitacoraPictures(dateId: string | null) {
  return api.bitacoraPictures.getByDate.useQuery(
    { id: dateId! },
    { enabled: !!dateId }
  );
}

export function useUpsertBitacoraPictures() {
  const utils = api.useUtils();

  return api.bitacoraPictures.upsert.useMutation({
    onSuccess: (_data, variables) => {
      utils.bitacoraPictures.getByDate.invalidate({ id: variables.id });
    },
  });
}
```

- [ ] **Step 3: Verify dev server compiles**

Check that imports resolve and TypeScript is happy with the new files.

---

### Task 4: Client — Upload Component in DayForm

**Files:**
- Modify: `src/app/(pages)/_container/DayForm/DayForm.tsx`
- Modify: `src/app/(pages)/_container/DayForm/useDayForm.ts`
- Modify: `src/app/(pages)/_container/DayForm/DayForm.module.scss`

**Interfaces:**
- Consumes: `compressImageToBase64` from Task 3, `useUpsertBitacoraPictures` from Task 3, `useFetchBitacoraPictures` from Task 3
- Produces: Updated `DayForm` with Upload functionality, updated `useDayForm` that handles picture submission

- [ ] **Step 1: Update useDayForm to handle pictures**

Modify `src/app/(pages)/_container/DayForm/useDayForm.ts` — add pictures state and submit logic:

```typescript
import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useUpsertBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
import { useUpsertBitacoraPictures } from 'src/app/_querys/bitacoraPictures/useFetchBitacoraPictures';
import { useFetchBitacoraPictures } from 'src/app/_querys/bitacoraPictures/useFetchBitacoraPictures';
// ---Config
import { type BitacoraFromDB, type Calificacion, type Nivel } from 'src/server/entities/bitacora/bitacoraTypes';
import { type BitacoraPictureItem } from 'src/server/entities/bitacoraPictures/bitacoraPicturesTypes';
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
  const upsertPicturesMutation = useUpsertBitacoraPictures();
  const entry = getSelectedEntry();

  const picturesQuery = useFetchBitacoraPictures(selectedDate);
  const [pictures, setPictures] = useState<BitacoraPictureItem[]>([]);
  const [picturesInitialized, setPicturesInitialized] = useState(false);

  if (picturesQuery.data && !picturesInitialized) {
    setPictures(picturesQuery.data.images);
    setPicturesInitialized(true);
  }

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
            hasPictures: pictures.length > 0,
          });

          await upsertPicturesMutation.mutateAsync({
            id: selectedDate,
            images: pictures,
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

  return { formik, pictures, setPictures };
}
```

- [ ] **Step 2: Add Upload to DayForm component**

Modify `src/app/(pages)/_container/DayForm/DayForm.tsx`:

```typescript
'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Input, Button, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
// ---Custom Hooks
import { useDayForm } from './useDayForm';
// ---Config
import { CALIFICACIONES, NIVELES } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../WeeklyCalendar/calendarUtils';
import { compressImageToBase64 } from 'src/app/_utils/compressImage';
import style from './DayForm.module.scss';

export function DayForm(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { formik, pictures, setPictures } = useDayForm();
  const { values, setFieldValue, isSubmitting, handleSubmit } = formik;
  const [fileList, setFileList] = useState<UploadFile[]>(
    pictures.map((pic, i) => ({
      uid: `existing-${i}`,
      name: `foto-${i + 1}.jpg`,
      status: 'done',
      url: pic.base64,
    }))
  );

  // -----------------------MAIN METHODS
  async function handleUpload(file: File) {
    const base64 = await compressImageToBase64(file);
    const newPicture = { base64, createdAt: new Date().toISOString() };
    setPictures([...pictures, newPicture]);

    setFileList((prev) => [
      ...prev,
      {
        uid: `new-${Date.now()}`,
        name: file.name,
        status: 'done',
        url: base64,
      },
    ]);
  }

  function handleRemove(file: UploadFile) {
    const index = fileList.findIndex((f) => f.uid === file.uid);
    if (index === -1) return;

    const newPictures = [...pictures];
    newPictures.splice(index, 1);
    setPictures(newPictures);

    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  }

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

        <div className="field-group">
          <label>Fotos</label>
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            onRemove={handleRemove}
            maxCount={3}
            accept="image/*"
          >
            {fileList.length < 3 && (
              <div>
                <PlusOutlined />
                <div className="upload-text">Subir</div>
              </div>
            )}
          </Upload>
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

- [ ] **Step 3: Add upload styles to SCSS**

In `src/app/(pages)/_container/DayForm/DayForm.module.scss`, add upload styles:

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

  .upload-text {
    margin-top: 4px;
    font-size: 12px;
  }

  .actions {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
```

- [ ] **Step 4: Verify the form renders correctly in the dev server**

Open the app, navigate to a day, open the drawer in form mode, and confirm:
- The Upload component renders with picture-card style
- You can add up to 3 images
- Remove works
- No console errors

---

### Task 5: Client — Show Images in DayReadView

**Files:**
- Modify: `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx`
- Modify: `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.module.scss`

**Interfaces:**
- Consumes: `useFetchBitacoraPictures` from Task 3, `BitacoraFromDB.hasPictures` from Task 1
- Produces: Updated `DayReadView` that displays images when `hasPictures` is true

- [ ] **Step 1: Add image display to DayReadView**

Modify `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx`:

```typescript
'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Button, Image } from 'antd';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useDeleteBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
import { useFetchBitacoraPictures } from 'src/app/_querys/bitacoraPictures/useFetchBitacoraPictures';
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
  const picturesQuery = useFetchBitacoraPictures(entry.hasPictures ? entry.id : null);

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

      {picturesQuery.data && picturesQuery.data.images.length > 0 && (
        <div className="pictures-section">
          <Image.PreviewGroup>
            {picturesQuery.data.images.map((pic, i) => (
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

- [ ] **Step 2: Add pictures section styles**

In `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.module.scss`, add:

```scss
.pictures-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}
```

Add this inside the `.DayReadView` block.

- [ ] **Step 3: End-to-end verification**

Open the app and test the full flow:
1. Open a day → form mode → add 1-3 photos → submit
2. Reopen the same day → read mode → photos should appear
3. Edit the day → existing photos should show in the upload list
4. Remove a photo → submit → reopen → photo should be gone
5. Check Firestore console: `bitacora_pictures` collection has the document with images array
6. Check the bitacora document has `hasPictures: true`
