import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7HZeww78IPLnYyQM3zxPl64tv41oITes",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "slimfast-d916c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "slimfast-d916c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "slimfast-d916c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "585734092021",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:585734092021:web:dcacc761d3545ead3d01bc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V1CL75GVF1"
};

// Check if Firebase is actually configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('example')
);

// Initialize Firebase safely
let app;
let auth;
let db;
let storage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
}

export { app, auth, db, storage };
export default app;
