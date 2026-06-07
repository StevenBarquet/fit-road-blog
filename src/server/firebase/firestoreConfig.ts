import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { DB_NAME } from "./dbConstants";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAB4w5Jl2lN7tkCMfggHXXqRiuijfekBI0",
  authDomain: "temporales-y-demos.firebaseapp.com",
  projectId: "temporales-y-demos",
  storageBucket: "temporales-y-demos.firebasestorage.app",
  messagingSenderId: "967684871084",
  appId: "1:967684871084:web:e764c9a44847c658626009",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configurar Firestore con una base de datos no predeterminada
export const db = getFirestore(app, DB_NAME);
