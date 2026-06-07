## Stack

- TRCP
- Nextjs
- Sass
- Firebase firestore
- Yup para validaciones
- Antd
- react-forge-grid
- Zustand

## Manejo de envs

1. Utiliza src/env/profiles/(default | dev | prod) para agregar tus envs
2. Si tienes algún secreto real utiliza src/env/profiles/secrets.js o inyecta tus variables directamente en la terminal o plataforma de despliegue que uses.
3. Para consumir tus secretos importalos de secrets.js o de process.env si seguiste el paso 2, como recomendación usa secrets.js sólo para desarrollo, no para producción.
4. Para consumir tus envs en tu aplicación utiliza "src/shared/config/allEnvs.ts"
5. Todos los imports de archivos js de scripts y envs deben incluir la extensión el path del import

## Mejores prácticas

- Puedes utilizar las librerias que quieras en el backend y no afecta el tiempo de respuesta del front por lo tanto hay que cuidar las librerias del lado del frontend

## Utils

- Icons: https://iconify.design/docs/iconify-icon/react.html

## Pendientes
- Re estructuración para hacer reutilizables los modulos necesarios
