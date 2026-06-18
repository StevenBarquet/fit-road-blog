# Bitacora Pictures Feature

## Overview

Add photo support to bitacora entries. Images are stored in a separate Firestore collection (`bitacora_pictures`) to keep the main calendar fetch lightweight. Each entry supports up to 3 images, compressed client-side before converting to base64.

## Data Model

### ModelBitacora (modified)

Add `hasPictures: boolean` (default `false`) to the existing model. This flag enables UI indicators (camera icon) on the calendar without fetching image payloads.

### ModelBitacoraPictures (new entity)

```typescript
interface BitacoraPictureItem {
  base64: string;
  createdAt: string; // ISO date string
}

interface ModelBitacoraPictures {
  images: BitacoraPictureItem[];
}

interface BitacoraPicturesFromDB extends ModelBitacoraPictures {
  id: string; // YYYY-MM-DD — same ID as the parent bitacora document
}
```

**Constraints:**
- Max 3 images per document
- Each image compressed to max 800px width before base64 encoding
- Document ID matches the bitacora entry date (YYYY-MM-DD)

## Firestore Structure

```
Collection: bitacora_pictures
  Document ID: YYYY-MM-DD
    Fields:
      images: Array<{ base64: string, createdAt: string }>
```

## tRPC Endpoints

### `bitacoraPictures.getByDate`

- **Input:** `{ id: string }` (YYYY-MM-DD)
- **Output:** `BitacoraPicturesFromDB | null`
- **Behavior:** Fetch single document by ID, return null if not found

### `bitacoraPictures.upsert`

- **Input:** `{ id: string, images: Array<{ base64: string, createdAt: string }> }`
- **Output:** `{ success: true, id: string }`
- **Behavior:** Set/merge the document. If images array is empty, delete the document and set `hasPictures: false` on the parent bitacora entry.

## Client-Side Architecture

### Compression Utility

`src/app/_utils/compressImage.ts`

- Takes a File object, returns a base64 string
- Uses canvas to resize: max width 800px, maintain aspect ratio
- Output format: JPEG at 0.7 quality
- Exported as `compressImageToBase64(file: File): Promise<string>`

### Fetch Hooks

`src/app/_querys/bitacoraPictures/useFetchBitacoraPictures.ts`

- `useFetchBitacoraPictures(dateId: string | null)` — enabled only when dateId is truthy
- `useUpsertBitacoraPictures()` — mutation hook, invalidates query on success

### DayForm Integration

- Add Ant Design `<Upload>` component with `listType="picture-card"`
- `beforeUpload` returns `false` (prevent auto-upload), compress and store in local state
- Max 3 files enforced via `maxCount={3}`
- On form submit: upsert bitacora (with `hasPictures: images.length > 0`) AND upsert pictures
- Pictures state is managed locally in the form component (not in Formik values — base64 strings are too large for form state tracking)

### DayReadView Integration

- When opening a day with `hasPictures: true`, trigger `useFetchBitacoraPictures`
- Display images in a simple grid/gallery below the existing entry data
- Ant Design `<Image>` component for preview/zoom

## File Changes Summary

| Action | Path |
|--------|------|
| New | `src/server/entities/bitacoraPictures/bitacoraPicturesTypes.ts` |
| New | `src/server/entities/bitacoraPictures/db/documentModel.ts` |
| New | `src/server/entities/bitacoraPictures/validations/model.ts` |
| New | `src/server/api/routers/bitacoraPicturesRouter.ts` |
| Modify | `src/server/api/root.ts` (register new router) |
| New | `src/app/_querys/bitacoraPictures/useFetchBitacoraPictures.ts` |
| New | `src/app/_utils/compressImage.ts` |
| Modify | `src/server/entities/bitacora/bitacoraTypes.ts` (add hasPictures) |
| Modify | `src/server/entities/bitacora/validations/model.ts` (add hasPictures to schema) |
| Modify | `src/app/(pages)/_container/DayForm/DayForm.tsx` (add Upload) |
| Modify | `src/app/(pages)/_container/DayForm/useDayForm.ts` (handle pictures on submit) |
| Modify | `src/app/(pages)/_container/DayDrawer/DayReadView/DayReadView.tsx` (show images) |

## Out of Scope

- Camera icon indicator on the calendar cells (future enhancement)
- Image deletion UI in read mode (for MVP, delete all by re-editing)
- Firebase Storage migration (future if base64 approach hits limits)
