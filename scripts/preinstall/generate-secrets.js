// @ts-check
import fs  from 'fs';
import path  from 'path';
import { getDirname } from '../utils/getDirname.js';

const { __dirname } = getDirname();

export async function generateSecrets() {
  // Define la ruta donde se creará el archivo secrets.js
  const secretsPath = path.join(
    __dirname,
    '../../',
    'src',
    'env',
    'profiles',
    'secrets.js'
  );

  // Verifica si el archivo ya existe
  fs.access(secretsPath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si el archivo no existe, procede a crearlo
      const secretsContent = `
// Este archivo es pensado en desarrollo local o develop, para producción te recomiendo que inyectes las variables en process.env
class Environments {
  // ---------------------------BACKEND ------
  SUPER_SECRET_EXAMPLE= '1234';
}

/**@type {{[s: string]: string}} */
// @ts-ignore
export const secrets = new Environments();
`;

      fs.writeFile(secretsPath, secretsContent, (err) => {
        if (err) {
          console.error('Error al crear el archivo secrets.js:', err);
        } else {
          console.log('Archivo secrets.js creado exitosamente.');
        }
      });
    } else {
      // Si el archivo ya existe, muestra un mensaje y no hace nada
      console.log('El archivo secrets.js ya existe.');
    }
  });
}
