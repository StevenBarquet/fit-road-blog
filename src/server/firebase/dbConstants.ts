import { allEnvs } from "src/shared/config/allEnvs";

export const DB_NAME = allEnvs.DB_NAME;

export const TABLE_NAMES = {
  bitacora: 'bitacora',
} as const;

export const TABLE_NAMES_KEYS = Object.keys(TABLE_NAMES);

export type ITableName = keyof typeof TABLE_NAMES;
