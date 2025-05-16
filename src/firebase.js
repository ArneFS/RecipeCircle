// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADHqUmoWBQEw_z8EiBk_1KpuJAkD3_fts",
  authDomain: "family-recipe-hub-7bf9f.firebaseapp.com",
  projectId: "family-recipe-hub-7bf9f",
  storageBucket: "family-recipe-hub-7bf9f.firebasestorage.app",
  messagingSenderId: "603407687089",
  appId: "1:603407687089:web:16fe9c294e3c8811f07190",
  measurementId: "G-DF63BGP782"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
