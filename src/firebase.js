// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

// Added for Cloud Functions support
import { getFunctions } from "firebase/functions";

import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
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

// Firebase Configuration
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

// Export core services with persistence
export const auth = getAuth(app);

// Set persistence to LOCAL to keep user logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence error:", error);
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Export onAuthStateChanged separately
export { onAuthStateChanged };

// Configure Google Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth methods & providers
export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
};

// Firestore helpers
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