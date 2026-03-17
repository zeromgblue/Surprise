// ===================================================
// SURPRISE ME — Firebase Configuration
// Project: surprise-dca77
// ===================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoQBxJoxP34cgmzvp_IEAqyVTKgTT0YL8",
  authDomain: "surprise-dca77.firebaseapp.com",
  projectId: "surprise-dca77",
  storageBucket: "surprise-dca77.firebasestorage.app",
  messagingSenderId: "464492450223",
  appId: "1:464492450223:web:349f3b2504c2299bd11f5a",
  measurementId: "G-SQC25BZZHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
