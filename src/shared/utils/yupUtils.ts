import { type Schema } from 'yup';
import * as yup from 'yup';

/** Valida un objeto contra su esquema de yup y arroja una excepcion en caso de que el objeto no coincida */
export async function yupValidator<T, K>(
  inputParams: T,
  schema: Schema<K>,
): Promise<T> {
  try {
    const validated = await schema.validate(inputParams);

    return validated as unknown as T;
  } catch (error: any) {
    const yupErr = error as  yup.ValidationError
    const {message,path} = {path: yupErr.params?.path as string, message: yupErr.message};
    console.log(`\n\n------YUP ERROR ❌ -----\nAt "${path}" -> ${message}\n\n`);

    return null as unknown as T;
  }
}

/** Valida un objeto contra su esquema de yup y arroja una excepcion en caso de que el objeto no coincida */
export function yupSimpleValidator<T, K>(data: T, schema: Schema<K>): boolean {
  try {
    schema.validateSync(data);
    return true;
  } catch (error) {
    const message = (error as Error)?.message;
    console.log(`Yup Error: ${message}`, error);
    return false;
  }
}

export const yupNullish = yup.mixed().test(
  'isNullOrUndefined',
  'The value must be either null or undefined',
  value => value === null || value === undefined
)

export const yupIsRequired = <T>(schema: Schema<T>, isRequired: boolean)=>isRequired?schema.required():schema