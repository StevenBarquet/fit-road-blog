// @ts-check
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Función para obtener el directorio actual en módulos ES6
export function getDirname() {
  // Convierte la URL del módulo actual a una ruta de archivo
  const __filename = fileURLToPath(import.meta.url);
  // Extrae el directorio de la ruta del archivo
  const __dirname = dirname(__filename);
  return { __dirname };
}
