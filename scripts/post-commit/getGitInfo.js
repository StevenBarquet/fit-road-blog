// @ts-check
import fs from 'fs';
import path from 'path';
import git from 'git-last-commit';
import { getDirname } from '../utils/getDirname.js';

const { __dirname } = getDirname();

/** Extrae info del autor, hora, id y comentario del ultimo commit realizado en el repo y crea el archivo en 'src/shared/config/commitInfo.ts'*/
export async function getGitInfo() {
  try {
    git.getLastCommit(function (er, commit) {
      const fullFile = path.join(
        __dirname,
        '../../src/shared/config/commitInfo.ts',
      );
      // read commit object properties
      const commitID = commit?.hash;

      const commitMssg = commit?.subject;

      const commitDate = new Date().toString();

      const commitAuthor = commit?.author?.name;

      const commitBranch = commit?.branch;

      const file = `export const commitID = ${'`'}${commitID}${'`'};
    
  export const commitMssg = ${'`'}${commitMssg}${'`'};
  
  export const commitDate = ${'`'}${commitDate}${'`'};
  
  export const commitAuthor = ${'`'}${commitAuthor}${'`'};
  
  export const commitBranch = ${'`'}${commitBranch}${'`'};
    `;

      fs.writeFile(fullFile, file, (err) => {
        if (err) throw err;
        console.log('Archivo de version creado en ->', fullFile);
      });
    });
  } catch (err) {
    console.log('Error extrallendo info the git o creando el archivo :C');
    console.log(err);
  }
}
