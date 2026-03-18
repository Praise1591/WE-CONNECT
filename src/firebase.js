// firebase.js (or firebaseConfig.js)
// Updated to include Firebase Functions export

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Added for Cloud Functions support
import { getFunctions } from "firebase/functions";

import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";

import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  runTransaction,
  getDocs
} from "firebase/firestore";

// ────────────────────────────────────────────────────────────────
// Firebase Configuration
// ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBQlvzRyGTUS_2rh3dNbZ8BGy7E0tfODdI",
  authDomain: "we-connect-auth.firebaseapp.com",
  projectId: "we-connect-auth",
  storageBucket: "we-connect-auth.firebasestorage.app",
  messagingSenderId: "359777144912",
  appId: "1:359777144912:web:85d804319c0a0a2707c155",
  measurementId: "G-WYCZ28ZRMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ────────────────────────────────────────────────────────────────
// Export core services
// ────────────────────────────────────────────────────────────────
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);

// Added: Cloud Functions service
export const functions = getFunctions(app, "europe-west1");  // ← use the real region here

// ────────────────────────────────────────────────────────────────
// Auth methods & providers
// ────────────────────────────────────────────────────────────────
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};

// ────────────────────────────────────────────────────────────────
// Firestore helpers (most commonly used in your app)
// ────────────────────────────────────────────────────────────────
export {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  runTransaction,
  getDocs,
};

// ────────────────────────────────────────────────────────────────
// Emulator connections — COMMENTED OUT
// (recommended to avoid assertion failures with onSnapshot + rapid writes)
// ────────────────────────────────────────────────────────────────
//
// import { connectFirestoreEmulator } from "firebase/firestore";
// import { connectAuthEmulator } from "firebase/auth";
// import { connectStorageEmulator } from "firebase/storage";
// import { connectFunctionsEmulator } from "firebase/functions";
//
// if (import.meta.env.DEV || import.meta.env.MODE === "development") {
//   connectFirestoreEmulator(db, '127.0.0.1', 8080);
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//   connectStorageEmulator(storage, '127.0.0.1', 9199);
//   connectFunctionsEmulator(functions, '127.0.0.1', 5001);
//   console.log("Firebase emulators connected");
// }