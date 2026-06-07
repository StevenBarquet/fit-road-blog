# Bitácora de Alimentación — Spec

## Resumen

App mobile-first para registro diario de alimentación. Calendario interactivo con drawer para crear/editar/eliminar registros. Cada día almacena: peso, calificación (A/B/C/D), nivel (1/2/3), y notas de texto.

## Modelo de datos

### Firestore

- Colección: `bitacora`
- Document ID: `YYYY-MM-DD` (la fecha es el ID)
- No existe un campo `fecha` dentro del documento

```typescript
interface ModelBitacora {
  peso: number | null;
  calificacion: Calificacion | null; // 'A' | 'B' | 'C' | 'D'
  nivel: Nivel | null; // 1 | 2 | 3
  nota: string;
}

interface BitacoraFromDB extends ModelBitacora {
  id: string; // YYYY-MM-DD (el document ID)
}
```

Campos nullable para permitir registro parcial (ej: solo peso en la mañana).

### Decisiones clave

- **Fecha como document ID**: evita duplicados naturalmente, permite upsert directo
- **Solo `upsert`**: no usamos `create` — un solo método cubre crear y actualizar
- **dayjs con formato `YYYY-MM-DD`**: consistente con lo que ya usa el código

## Arquitectura de componentes

```
BitacoraHome (página principal)
├── BitacoraCalendar (calendario con dots de color)
├── DaySummary (resumen read-only del día seleccionado)
└── DayDrawer (drawer desde abajo)
    └── DayForm (formulario Formik)
```

### BitacoraCalendar (existente — ajustar)

- Calendario Ant Design `fullscreen={false}`
- Dots de color según calificación del día
- Al tocar un día: actualiza `selectedDate` en store y abre el drawer

### DaySummary (existente — ajustar)

- Muestra resumen del día seleccionado debajo del calendario
- Datos: fecha formateada, badge calificación, peso, nivel, nota
- Si no hay registro: mensaje "Sin registro"

### DayDrawer (nuevo)

- Ant Design Drawer, `placement="bottom"`, `height="70vh"`
- Border-radius en esquinas superiores
- Header con la fecha seleccionada formateada
- Contiene el DayForm
- Se abre cuando el usuario toca un día en el calendario

### DayForm (nuevo)

- Formik + Yup
- Campos:
  - **Peso**: Input numérico libre (kg, acepta decimales)
  - **Calificación**: Radio group (A, B, C, D) con colores asociados
  - **Nivel**: Radio group (1, 2, 3)
  - **Notas**: TextArea
- Botones:
  - **Guardar**: submit del form
  - **Eliminar**: solo visible si el registro existe en DB
- Pre-llena valores si existe registro para ese día

## Lógica de negocio

### Guardar (upsert)

1. Usuario modifica campos y toca "Guardar"
2. Se compara el form actual vs los valores originales de DB
3. Si algún campo que **ya tenía valor en DB** fue modificado → swal confirm: "Ya existe un registro de este día, ¿seguro que quieres continuar?"
4. Si solo se llenaron campos que estaban vacíos en DB → guarda directo sin confirm
5. Upsert a Firestore con `setDoc(merge: true)`
6. Refetch de datos del mes en el store

### Eliminar

1. Usuario toca "Eliminar"
2. Swal confirm: "¿Seguro que quieres eliminar el registro de este día?"
3. Si confirma → delete en Firestore
4. Refetch de datos del mes
5. Cierra el drawer

## Backend (tRPC)

### Router: `bitacoraRouter`

```typescript
// Obtener registros de un mes
bitacora.getByMonth({ month, year })
// → Query Firestore: docs donde ID >= 'YYYY-MM-01' y ID <= 'YYYY-MM-31'

// Crear o actualizar registro
bitacora.upsert({ id, peso, calificacion, nivel, nota })
// → firestoreRepo.upsert({ id: 'YYYY-MM-DD', ...data })

// Eliminar registro
bitacora.delete({ id })
// → firestoreRepo.delete('YYYY-MM-DD')
```

### Firestore Repo

Se usa el `createFirestoreRepo` existente. Métodos utilizados:
- `upsert`: para crear y actualizar
- `delete`: para eliminar
- `find` o query con rango de IDs para `getByMonth`

## Store (Zustand)

El store `bitacoraStore` se mantiene con ajustes mínimos:
- El tipo `BitacoraFromDB` pierde el campo `fecha` (el `id` es la fecha)
- Se agrega estado `drawerOpen: boolean` y su setter
- `selectedDate` sigue funcionando igual

## Estilos

- Mobile-first (320px mínimo)
- Drawer: `height: 70vh`, border-radius superior, fondo claro
- Radio buttons de calificación con colores del sistema (verde A, azul B, amarillo C, rojo D)
- Form con espaciado táctil generoso
- Calendario: dots de color en celdas con registro

## Validación (Yup)

```typescript
const bitacoraFormSchema = yup.object({
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D']),
  nivel: yup.number().nullable().oneOf([1, 2, 3]),
  nota: yup.string().default(''),
});
```

## Query de mes (getByMonth)

Firestore no tiene un operador "starts with" nativo, pero podemos hacer un rango:
- `where(documentId(), '>=', '2026-06-01')`
- `where(documentId(), '<=', '2026-06-31')`

Alternativa: si `find` del repo no soporta query por document ID directamente, podemos hacer un query custom en el router usando las primitivas de Firestore importadas.
