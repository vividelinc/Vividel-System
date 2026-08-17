import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0
);

let app = null as ReturnType<typeof initializeApp> | null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.warn('Firebase is configured but failed to initialize. Public pages will render without backend services.', error);
  }
} else {
  console.warn('Firebase environment variables are missing. Public pages will run without Firebase-backed auth or data sync.');
}

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

export const isFirebaseReady = Boolean(app);
export const auth = app ? getAuth(app) : null as any;
export const db = app
  ? databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app)
  : null as any;

export default app;
