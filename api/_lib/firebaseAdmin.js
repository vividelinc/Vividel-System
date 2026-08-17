import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Same non-default Firestore database the frontend targets (src/firebase/config.ts) —
// this project's DB was created by AI Studio under this specific ID, not "(default)".
const DATABASE_ID =
  process.env.FIREBASE_DATABASE_ID || 'ai-studio-vividelinc-5e594657-66dc-41d1-8887-f0c615ca0bfd';

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel env vars store literal "\n" — convert back to real newlines.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const app = getAdminApp();
export const db = getFirestore(app, DATABASE_ID);
export const adminAuth = getAuth(app);
