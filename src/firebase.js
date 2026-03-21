// firebase.js
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

// Export core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Auth methods & providers
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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