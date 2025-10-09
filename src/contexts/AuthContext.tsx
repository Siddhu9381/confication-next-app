'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// @ts-ignore
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) {
      setLoading(false);
      return;
    }

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const idToken = await firebaseUser.getIdToken();
        
        // Store user data in localStorage
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          idToken: idToken,
          emailVerified: firebaseUser.emailVerified
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(firebaseUser);
      } else {
        // User is signed out
        localStorage.removeItem('user');
        localStorage.removeItem('sessionReportData');
        localStorage.removeItem('finalTranscript');
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) return;
    
    try {
      await firebaseSignOut(auth);
      // Clear all localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('sessionReportData');
      localStorage.removeItem('finalTranscript');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}


