import { db } from './firebaseAdmin.js';

export async function getSettings() {
  const snap = await db.collection('settings').doc('general').get();
  return snap.exists ? snap.data() : {};
}
