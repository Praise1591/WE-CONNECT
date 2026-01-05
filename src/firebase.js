// src/firebase.js — Working version (no direct imports)
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
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

export const createUserWithEmailAndPassword = (email, password) => 
  auth.createUserWithEmailAndPassword(email, password);

export const signInWithEmailAndPassword = (email, password) => 
  auth.signInWithEmailAndPassword(email, password);

export const doc = (path) => db.doc(path);
export const setDoc = (ref, data) => ref.set(data);