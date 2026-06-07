// ---Firestore
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  getDoc,
  getDocs,
  type Query,
  query,
  type QuerySnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  type WhereFilterOp,
  type Transaction,
  writeBatch
} from 'firebase/firestore';
// ---Utils
import { omit } from 'lodash';
// ---Types
import { type ITableName } from './dbConstants';
import { db } from './firestoreConfig';
import { type ArrayOfObjKeys } from 'src/shared/types/utils';

const debug = require('debug')('app:dev');

export interface FirestoreRepoConfig<T> {
  collectionName: ITableName;
  /** Objeto para inicializar valores en el esquema  */
  defaults?: Partial<T>;
  /** Arreglo de los nombres de las props en tu esquema que son valores únicos en la colección */
  unique?: ArrayOfObjKeys<T>;
}

/**
 * La función createFirestoreRepo genera un repositorio de Firestore personalizado y fácil de usar para una colección específica en su base de datos. Solo necesita proporcionar una configuración que incluya el nombre de la colección, los valores predeterminados y los campos únicos para crear un conjunto de funciones CRUD sólidas y seguras.
 *
 * @param config - Un objeto de configuración con las siguientes propiedades:
 *   - collectionName: Nombre de la colección en Firestore.
 *   - defaults: Objeto que contiene valores predeterminados para campos específicos en el documento.
 *   - unique: Arrasy de campos únicos que deben ser verificados antes de las operaciones de creación y actualización.
 * @returns Un objeto con funciones CRUD personalizadas para la colección especificada.
 */
export function createFirestoreRepo<T extends Record<string, any>>(
  config: FirestoreRepoConfig<T>
) {
  const { collectionName, defaults, unique } = config;
  const withUnique = unique?.length;
  type ModelWithID = T & { id: string };
  type PartialModelWithID = Partial<T> & { id: string };

  return {
    /**safeCreate: Este método toma un objeto de entrada de tipo T, verifica si los campos únicos no existen ya, y luego crea un nuevo documento en la colección "collectionName" con los datos de entrada. Devuelve la referencia del documento creado. */
    safeCreate: withUnique
      ? async (input: T) => {
          let docOperation = undefined;
          await runTransaction(db, async (transaction) => {
            const fullData = { ...defaults, ...omit(input, ['id']) } as T;
            await checkUniqueFields(
              transaction,
              collectionName,
              unique,
              fullData
            );

            const dbRef = collection(db, collectionName);
            const docRef = await addDoc(dbRef, fullData);
            docOperation = docRef;
            debug(
              `nuevo registro para "${collectionName}" creado con id: ${docRef.id}`
            );
          });
          return docOperation as unknown as
            | undefined
            | DocumentReference<DocumentData>;
        }
      : undefined,
    /**create: Este método toma un objeto de entrada de tipo T, verifica si los campos únicos no existen ya, y luego crea un nuevo documento en la colección "collectionName" con los datos de entrada. Devuelve la referencia del documento creado. */
    create: async (input: T) => {
      let docOperation = undefined;

      const fullData = { ...defaults, ...omit(input, ['id']) } as T;

      const dbRef = collection(db, collectionName);
      const docRef = await addDoc(dbRef, fullData);
      docOperation = docRef;

      debug(
        `nuevo registro para "${collectionName}" creado con id: ${docRef.id}`
      );
      return docOperation as unknown as
        | undefined
        | DocumentReference<DocumentData>;
    },
    /**delete: Este método toma un docId y elimina el documento con el ID dado de la colección "collectionName". */
    delete: async (docId: string) => {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      debug(`registro eliminado en "${collectionName}" con id: ${docId}`);
    },
    /**deleteBatch: Este método toma un array de docIds y elimina los documentos con esos IDs de la colección "collectionName". */
    deleteBatch: async (docIds: string[]) => {
      const batch = writeBatch(db);

      docIds.forEach((docId) => {
        const docRef = doc(db, collectionName, docId);
        batch.delete(docRef);
      });

      // Ejecutar todas las operaciones de eliminación en el lote
      await batch.commit();

      debug(
        `Registros eliminados en "${collectionName}" con ids: ${docIds.join(
          ', '
        )}`
      );
    },
    /**
     * updateBatch: Este método toma un array de objetos PartialModelWithID y actualiza los documentos con esos IDs en la colección "collectionName".
     */
    updateBatch: async (models: Array<PartialModelWithID>) => {
      const batch = writeBatch(db);

      models.forEach((model) => {
        const { id, ...data } = model; // Extraer el ID y los datos a actualizar
        const docRef = doc(db, collectionName, id);
        batch.update(docRef, data);
      });

      // Ejecutar todas las operaciones de actualización en el lote
      await batch.commit();

      debug(
        `Registros actualizados en "${collectionName}"`
      );
    },
    /**safeUpdate: Este método toma un docId y un objeto que contiene los datos actualizados de tipo Partial<T>. Primero verifica si los campos únicos no existen ya y luego actualiza el documento con el ID dado en la colección "collectionName" con los datos actualizados. */
    safeUpdate: withUnique
      ? async (docId: string, updatedData: Partial<T>) => {
          // Check the uniqueness of the fields before updating
          await runTransaction(db, async (transaction) => {
            await checkUniqueFields(
              transaction,
              collectionName,
              unique,
              updatedData
            );
          });

          const docRef = doc(db, collectionName, docId);
          await updateDoc(docRef, omit(updatedData, ['id']) as T);
          debug(`registro actualizado en "${collectionName}" con id: ${docId}`);
        }
      : undefined,
    /**update: Este método toma un docId y un objeto que contiene los datos actualizados de tipo Partial<T>. Actualiza el documento con el ID dado en la colección "collectionName" con los datos actualizados sin comprobar los campos únicos. */
    update: async ( updatedData: PartialModelWithID) => {
      const docRef = doc(db, collectionName, updatedData.id);
      await updateDoc(docRef, omit(updatedData, ['id']));
      debug(`registro actualizado en "${collectionName}" con id: ${updatedData.id}`);
    },
    /**safeUpsert: Este método toma un objeto de entrada de tipo PatchUser y primero verifica si los campos únicos no existen ya. Si el documento con el ID dado existe, actualiza el documento con los datos de entrada; de lo contrario, crea un nuevo documento en la colección "collectionName" con los datos de entrada. */
    safeUpsert: withUnique
      ? async (data: Partial<T> & { id: string }) => {
          // Check the uniqueness of the fields before upserting
          await runTransaction(db, async (transaction) => {
            await checkUniqueFields(transaction, collectionName, unique, data);
          });

          const docRef = doc(db, collectionName, data.id);
          await setDoc(
            docRef,
            { ...defaults, ...omit(data, ['id']) },
            { merge: true }
          );
          debug(
            `registro actualizado/agregado en "${collectionName}" con id: ${data.id}`
          );
        }
      : undefined,
    /**upsert: Este método toma un objeto de entrada de tipo PatchUser. Si el documento con el ID dado existe, actualiza el documento con los datos de entrada; de lo contrario, crea un nuevo documento en la colección "collectionName" con los datos de entrada sin comprobar los campos únicos. */
    upsert: async (data: Partial<T> & { id: string }) => {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(
        docRef,
        { ...defaults, ...omit(data, ['id']) },
        { merge: true }
      );
      debug(
        `registro actualizado/agregado en "${collectionName}" con id: ${data.id}`
      );
    },
    /**findById: Este método toma un docId y devuelve el documento con el ID dado de la colección "collectionName". Si el documento no existe, devuelve null. */
    findById: async (docId: string) => {
       try {
    debug(`Buscando documento en colección: ${collectionName} con ID: ${docId}`);
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() } as unknown as ModelWithID;
      const fullInfo: Omit<
        DocumentSnapshot<DocumentData>,
        'data' | 'exists'
      > & {
        data: T;
        exists: boolean;
      } = {
        exists: docSnap.exists(),
        get: docSnap.get,
        id: docSnap.id,
        metadata: docSnap.metadata,
        ref: docSnap.ref,
        data,
      };
      debug(`Búsqueda exitosa en "${collectionName}" con id: ${fullInfo.id}`);
      return fullInfo;
    } else {
      debug(`Documento con ID: ${docId} no encontrado en la colección: ${collectionName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al buscar documento con ID: ${docId} en la colección: ${collectionName}`, error);
    return null;
  }
    },
    /**find: Este método toma un campo, un valor y un parámetro whereOp opcional. Consulta la colección "collectionName" en busca de documentos donde el campo especificado coincida con el valor dado utilizando la operación where especificada (por defecto "=="). Devuelve un objeto que contiene los resultados de la consulta como un array de objetos T y otras propiedades relacionadas con la consulta. */
    find: async (options?: {
      field?: keyof T;
      value?: unknown;
      whereOp?: WhereFilterOp;
    }) => {
      const usersRef = collection(db, collectionName);
      let q: Query;

      const field = options?.field;
      const value = options?.value;
      const whereOp = options?.whereOp;
      if (field && value) {
        q = query(usersRef, where(field as string, whereOp || '==', value));
      } else {
        q = query(usersRef);
      }

      const querySnapshot = await getDocs(q);

      const results: ModelWithID[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as unknown as ModelWithID);
      });

      // Invierte el orden de los resultados
      results.reverse();

      const fullInfo: Omit<QuerySnapshot<DocumentData>, 'forEach'> & {
        results: ModelWithID[];
      } = {
        docs: querySnapshot.docs,
        empty: querySnapshot.empty,
        metadata: querySnapshot.metadata,
        docChanges: querySnapshot.docChanges,
        query: querySnapshot.query,
        size: querySnapshot.size,
        results,
      };
      debug(
        `búsqueda exitosa en "${collectionName}" con un total de: ${fullInfo.size} items`
      );
      return fullInfo;
    },
  };
}

/** Operación transaccionada que valida que solo se inserten valores únicos dado un arreglo específico "uniqueFields" */
async function checkUniqueFields<T extends Record<string, any>>(
  transaction: Transaction,
  collectionName: ITableName,
  uniqueFields: ArrayOfObjKeys<T>,
  toInsert: Partial<T>
) {
  for (const fieldName of uniqueFields) {
    const fieldValue = toInsert[fieldName];

    if (fieldValue) {
      const fieldRef = doc(db, String(collectionName), fieldValue as string);
      const fieldSnap = await transaction.get(fieldRef);

      if (fieldSnap.exists()) {
        throw new Error(`${String(fieldName)} already exists, dup key error`);
      }

      // If the field value does not exist, add it to the unique collection
      transaction.set(fieldRef, { [fieldName]: fieldValue });
    }
  }
}
