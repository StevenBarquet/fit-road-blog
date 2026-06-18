import { createFirestoreRepo } from "src/server/firebase/firestoreRepo";
import { type ModelBitacoraPictures } from "../bitacoraPicturesTypes";

export const bitacoraPicturesRepo = createFirestoreRepo<ModelBitacoraPictures>({
  collectionName: 'bitacora_pictures',
});
