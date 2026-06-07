// @ts-check
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDirname } from '../utils/getDirname.js';

const { __dirname } = getDirname();

/** --------MAIN--------- */
export async function installPostCommit() {
  const hook = scriptPathSelector();
  const destinyPath = path.join(__dirname, '../../.git/hooks/post-commit');
  
  // Leer el contenido del archivo
  const content = fs.readFileSync(hook, 'utf8');
  
  // Convertir CRLF a LF
  const convertedContent = content.replace(/\r\n/g, '\n');
  
  // Escribir el contenido convertido al archivo de destino
  fs.writeFileSync(destinyPath, convertedContent);
  
  // Establecer permisos de ejecución
  fs.chmodSync(destinyPath, '755');
}

/** Select the correct script path according to the OS */
function scriptPathSelector() {
  const isMac = os.type() === 'Darwin';
  const hookFolder = isMac? 'post-comit-mac' : 'post-commit-others';
  return path.join(__dirname, `../git-hooks/${hookFolder}/post-commit`);
}
