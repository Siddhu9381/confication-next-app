// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Only initialize Firebase on the client-side
let app;
let auth;
let db;
let googleProvider;

if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Initialize Firebase using the recommended pattern
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Initialize Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  // Add additional scopes
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
}

// Export Firebase services (will be undefined on server-side)
export { auth, db, googleProvider };
export default app;
