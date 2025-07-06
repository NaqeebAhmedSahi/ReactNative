// firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5yRdgNdkCON7z6DCoc97EdNL8owvHRfI",
  authDomain: "myapp5-1e74d.firebaseapp.com", // Added manually
  projectId: "myapp5-1e74d",
  storageBucket: "myapp5-1e74d.appspot.com", // Corrected domain for web usage
  messagingSenderId: "376534402492",
  appId: "1:376534402492:android:9c8d29ca4e03e3ce5297b9",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
