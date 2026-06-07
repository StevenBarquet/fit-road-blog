import { defaultEnvs } from "./profiles/default.mjs";
import { devEnvs } from "./profiles/dev.mjs";
import { prodEnvs } from "./profiles/prod.mjs";

class EnvsLoader{
  runtimeEnvs = process.env.NODE_ENV === 'production'? prodEnvs: devEnvs;
  notVerifiedEnvs = {
    NODE_ENV: process.env.NODE_ENV,
    ...defaultEnvs,
    ...this.runtimeEnvs,
  }
  allEnvs = this.verify();

  verify(){
    const keys = Object.keys(this.notVerifiedEnvs);
  
    for (const index in keys) {
      const key = keys[index]
      // @ts-ignore
      const isValid = this.isValidValue(this.notVerifiedEnvs[key]);
      if(!isValid)throw new Error(`\n\n---Error en envs ❌---\nLa variable ${key} está indefinida`);
    }
    return this.notVerifiedEnvs;
  };

  /**@param {string | boolean | number} value */
  isValidValue(value){
    if(typeof value === 'string' && value.length === 0 ) return false;
    if(value === undefined ) return false;
    return true;
  };
}

export const notTypedEnvs = new EnvsLoader().allEnvs;