import { createFirestoreRepo } from "src/server/firebase/firestoreRepo";
import { type ModelBitacora } from "../bitacoraTypes";

export const bitacoraRepo = createFirestoreRepo<ModelBitacora>({
  collectionName: 'bitacora',
});
