import { secrets } from './secrets.js';

class Environments {
  // ---------------------------BACKEND ------
  // Esto es un ejemplo y para que corra agregué la env en el script de build, modifica a tu conveniencia
  ENV_TYPE_DEPENDANT =
    process.env.ENV_TYPE_DEPENDANT || secrets?.SUPER_SECRET_EXAMPLE;
}

export const prodEnvs = new Environments();
