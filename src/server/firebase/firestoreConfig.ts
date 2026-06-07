import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { DB_NAME } from "./dbConstants";
import { allEnvs } from "src/shared/config/allEnvs";

const firebaseConfig: FirebaseOptions = {
  apiKey: allEnvs.FIREBASE_API_KEY,
  authDomain: "temporales-y-demos.firebaseapp.com",
  projectId: "temporales-y-demos",
  storageBucket: "temporales-y-demos.firebasestorage.app",
  messagingSenderId: allEnvs.FIREBASE_MESSAGING_SENDER_ID,
  appId: allEnvs.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configurar Firestore con una base de datos no predeterminada
export const db = getFirestore(app, DB_NAME);
