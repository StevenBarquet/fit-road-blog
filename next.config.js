// @ts-nocheck
import path from 'path';
import { getDirname } from './scripts/utils/getDirname.js';

const { __dirname } = getDirname();
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env/loadEnvs.mjs');

/** @type {import("next").NextConfig} */
const config = {
  output: 'standalone',
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/app/_styles')]
  },
  webpack(config) {
    // Función original para obtener el identificador local
    const originalIdent = (context, localIdentName, localName, options) => {
      return localName; // Retorna solo el nombre local sin hash
    };

    // Encuentra las reglas relevantes para los módulos SCSS
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    // Itera sobre las reglas encontradas
    rules.forEach((rule) => {
      rule.use.forEach((moduleLoader) => {
        // Verifica si el loader es css-loader y maneja archivos SCSS
        if (
          moduleLoader.loader?.includes('css-loader') &&
          !moduleLoader.loader?.includes('postcss-loader') &&
          rule.test?.toString().includes('scss')
        ) {
          // Asegura que la configuración de modules exista
          if (!moduleLoader.options.modules) {
            moduleLoader.options.modules = {};
          }

          // Configura getLocalIdent para usar la función originalIdent
          moduleLoader.options.modules.getLocalIdent = originalIdent;
        }
      });
    });

    return config;
  }
};

export default config;
