import { notTypedEnvs } from "src/env/loadEnvs.mjs";
import { type NonUndefined } from "../types/utils";

/** Contiene todas las variables de entorno de la app, las envs de frontend necesitan el prefijo "NEXT_PUBLIC" para poder ser leidas en el front */
export const allEnvs = notTypedEnvs as NonUndefined<typeof notTypedEnvs>;
