import { adminAuth } from './firebaseAdmin.js';

// Dashboard-only endpoints (generateContract, onStatusChange) require a valid Firebase
// ID token in the Authorization header — the frontend attaches auth.currentUser.getIdToken().
export async function requireAuth(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    const err = new Error('Missing Authorization bearer token.');
    err.statusCode = 401;
    throw err;
  }
  try {
    return await adminAuth.verifyIdToken(match[1]);
  } catch {
    const err = new Error('Invalid or expired auth token.');
    err.statusCode = 401;
    throw err;
  }
}
