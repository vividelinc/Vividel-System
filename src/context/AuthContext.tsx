import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { isFirebaseReady } from '../firebase/config';
import { subscribeToAuthChanges, loginWithEmail, logout } from '../firebase/auth';
import { initializeDefaultDataIfNeeded, testConnection } from '../firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<User>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('Not initialized'); },
  logoutUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseReady) {
      setLoading(false);
      return;
    }

    // Validate connection to Firestore on boot
    testConnection();

    // Seed default services and settings on load
    initializeDefaultDataIfNeeded().catch((err) => {
      console.warn('Initialization deferred:', err);
    });

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (e: string, p: string) => {
    const u = await loginWithEmail(e, p);
    setUser(u);
    return u;
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

