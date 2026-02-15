// firebase.js (or firebaseConfig.js) — Emulator connections commented out to avoid assertion failures

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

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
  // serverTimestamp,   // ← uncomment if you use it in many places
  // increment,
  // updateDoc,
  // deleteDoc,
  // collection,
  // query,
  // orderBy,
  // onSnapshot
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
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);

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
// Firestore helpers (most commonly used)
// ────────────────────────────────────────────────────────────────
export {
  doc,
  setDoc,
  getDoc,
  // Add more as needed – avoid importing everything to keep bundle smaller
  // serverTimestamp,
  // increment,
  // updateDoc,
  // deleteDoc,
  // collection,
  // query,
  // orderBy,
  // onSnapshot,
};

// ────────────────────────────────────────────────────────────────
// IMPORTANT: Emulator connections are COMMENTED OUT
// This is the recommended workaround for the "Unexpected state (ID: ca9)" / "ve:-1" assertion failure
// that occurs very frequently with connectFirestoreEmulator + onSnapshot + rapid writes/deletes
// ────────────────────────────────────────────────────────────────
//
// If you need to use the emulator later (e.g. for security rules testing), uncomment temporarily:
// 
// import { connectFirestoreEmulator } from "firebase/firestore";
// import { connectAuthEmulator } from "firebase/auth";
// import { connectStorageEmulator } from "firebase/storage";
//
// if (import.meta.env.DEV || import.meta.env.MODE === "development") {
//   connectFirestoreEmulator(db, '127.0.0.1', 8080);
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//   connectStorageEmulator(storage, '127.0.0.1', 9199);
//   console.log("Firebase emulators connected");
// }