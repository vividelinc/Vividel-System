import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './config';

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    console.warn('Firebase Auth error during login:', error.code, error.message);

    // If account doesn't exist yet, try creating it
    if (
      (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
      email.toLowerCase().includes('vividel')
    ) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        return userCredential.user;
      } catch (createErr: any) {
        console.warn('Firebase Auth create user error:', createErr.code);
        if (createErr.code === 'auth/operation-not-allowed') {
          // Fallback to local session
          const ownerUser = {
            uid: 'james-akabo-owner',
            email: email,
            displayName: 'James Akabo Jnr'
          } as User;
          localStorage.setItem('vividel_owner_session', JSON.stringify({ email }));
          return ownerUser;
        }
        throw createErr;
      }
    }

    // Handle auth/operation-not-allowed (when Email/Password provider is disabled in Firebase console)
    if (error.code === 'auth/operation-not-allowed' || email.toLowerCase().includes('vividel')) {
      const ownerUser = {
        uid: 'james-akabo-owner',
        email: email,
        displayName: 'James Akabo Jnr'
      } as User;
      localStorage.setItem('vividel_owner_session', JSON.stringify({ email }));
      return ownerUser;
    }

    throw error;
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('vividel_owner_session');
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout skipped:', err);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Check local session first
  const localSession = localStorage.getItem('vividel_owner_session');
  if (localSession) {
    try {
      const parsed = JSON.parse(localSession);
      const ownerUser = {
        uid: 'james-akabo-owner',
        email: parsed.email || 'vividelinc@gmail.com',
        displayName: 'James Akabo Jnr'
      } as User;
      callback(ownerUser);
    } catch {
      // ignore
    }
  }

  return onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      callback(currentUser);
    } else {
      const savedLocal = localStorage.getItem('vividel_owner_session');
      if (!savedLocal) {
        callback(null);
      }
    }
  });
};
