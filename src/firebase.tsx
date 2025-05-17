// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Define the config object type
const firebaseConfig = {
  apiKey: "AIzaSyADHqUmoWBQEw_z8EiBk_1KpuJAkD3_fts",
  authDomain: "family-recipe-hub-7bf9f.firebaseapp.com",
  projectId: "family-recipe-hub-7bf9f",
  storageBucket: "family-recipe-hub-7bf9f.appspot.com",
  messagingSenderId: "603407687089",
  appId: "1:603407687089:web:16fe9c294e3c8811f07190",
  measurementId: "G-DF63BGP782",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Typed Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
