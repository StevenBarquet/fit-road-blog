/** Utilidad personalizada para eliminar 'undefined' de los tipos de las propiedades */
export type NonUndefined<T> = {
  [K in keyof T]: Exclude<T[K], undefined>;
};

/** Array que solo admite strings que son nombres de las propiedades de una interfaz */
export type ArrayOfObjKeys<T> = Array<keyof T>