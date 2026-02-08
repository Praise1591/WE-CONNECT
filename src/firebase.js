// src/firebase.js — Modern modular Firebase v9+ syntax

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the provider classes you need
import { 
  GoogleAuthProvider, 
  signInWithPopup,           // if using popup
  signInWithRedirect,        // optional, if you prefer redirect
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";

import { 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyBGnjkrRtYA6bsGrmN9zYrhsmlEdd2X8d8",
  authDomain: "we-connect-a473e.firebaseapp.com",
  projectId: "we-connect-a473e",
  storageBucket: "we-connect-a473e.firebasestorage.app",
  messagingSenderId: "165842033302",
  appId: "1:165842033302:web:abd3319b6778a4f3af80b7",
  measurementId: "G-4JEWS0BJRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export auth functions & providers
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,           // optional
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