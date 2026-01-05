// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBGnjkrRtYA6bsGrmN9zYrhsmlEdd2X8d8",
  authDomain: "we-connect-a473e.firebaseapp.com",
  projectId: "we-connect-a473e",
  storageBucket: "we-connect-a473e.firebasestorage.app",
  messagingSenderId: "165842033302",
  appId: "1:165842033302:web:abd3319b6778a4f3af80b7",
  measurementId: "G-4JEWS0BJRZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);