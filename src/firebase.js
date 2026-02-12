// firebase.js (or firebaseConfig.js) — corrected imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ── Fix: Import getAuth here ────────────────────────────────────────────────
import { getAuth } from "firebase/auth";           // ← this was missing

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
  getDoc 
} from "firebase/firestore";

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

// Export services
export const auth = getAuth(app);           // ← now works
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export auth functions & providers
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};

// Export Firestore helpers
export {
  doc,
  setDoc,
  getDoc,
};