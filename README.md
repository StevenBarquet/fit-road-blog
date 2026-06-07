# Bitácora Fit Road

App mobile-first para registro diario de alimentación. Calendario interactivo donde cada día se puede registrar: peso, calificación (A/B/C/D), nivel (1/2/3) y notas.

## Stack

- Next.js 14 (App Router)
- tRPC + React Query v5
- Ant Design 5
- Formik + Yup
- Zustand
- Firebase/Firestore
- SCSS Modules
- dayjs
- react-forge-grid

## Levantar el proyecto

```bash
npm install
npm run dev
```

Requiere el archivo `src/env/profiles/secrets.js` con las credenciales de Firebase (no se commitea).

## Manejo de envs

1. Utiliza `src/env/profiles/(default | dev | prod)` para agregar tus envs
2. Si tienes algún secreto real utiliza `src/env/profiles/secrets.js` o inyecta tus variables directamente en la terminal o plataforma de despliegue que uses
3. Para consumir tus secretos importalos de `secrets.js` o de `process.env` si seguiste el paso 2. Usa `secrets.js` sólo para desarrollo, no para producción
4. Para consumir tus envs en tu aplicación utiliza `src/shared/config/allEnvs.ts`
5. Todos los imports de archivos js de scripts y envs deben incluir la extensión en el path del import

## Arquitectura general

```
Cliente (React) → tRPC hooks → tRPC Router (server) → Firestore
                ↕
           Zustand Store
```

- El cliente nunca toca Firebase directamente, todo pasa por tRPC
- Las credenciales de Firebase NO llevan prefijo `NEXT_PUBLIC_` porque solo se usan en el servidor
- Firestore rules pueden estar en `allow: if true` porque el acceso está protegido a nivel de servidor

## Flujo principal

1. El calendario muestra dots de color por cada día que tiene registro
2. Al tocar un día se abre un drawer desde abajo con el formulario
3. El form se pre-llena si ya existe un registro
4. Guardar hace upsert; eliminar borra el documento

## Notas importantes

### Upsert en lugar de Create — fecha como document ID

No usamos `create` (que genera IDs automáticos). Usamos exclusivamente `upsert` con `setDoc(merge: true)`. El document ID es la fecha en formato `YYYY-MM-DD`. Esto:
- Evita duplicados naturalmente (no puede haber dos registros del mismo día)
- Simplifica el CRUD a un solo método para crear y actualizar
- Hace las queries por mes más intuitivas (filtrar por prefijo de ID)

### Sincronización query → store con useEffect

React Query v5 eliminó el callback `onSuccess` de `useQuery` (solo sobrevive en `useMutation`). Para sincronizar la data del query con el Zustand store dependemos de un `useEffect` que observa `query.data`. Es la única forma soportada en v5 para este patrón. Ver `src/app/_querys/bitacora/useFetchBitacora.ts`.

## Utils

- Icons: https://iconify.design/docs/iconify-icon/react.html
