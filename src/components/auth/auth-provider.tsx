
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  type User as FirebaseUserType // Renaming to avoid conflict with our User type
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { IconSpinner } from '@/components/icons';
import type { FirebaseUser } from '@/types';

export interface AuthContextType {
  user: FirebaseUser | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (firebaseUser: FirebaseUserType) => {
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    router.push('/dashboard');
  };

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    handleAuthSuccess(userCredential.user);
    setIsLoading(false);
  }, [router]);

  const signupWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    handleAuthSuccess(userCredential.user);
    setIsLoading(false);
  }, [router]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    handleAuthSuccess(userCredential.user);
    setIsLoading(false);
  }, [router]);

  const signInWithGitHub = useCallback(async () => {
    setIsLoading(true);
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    handleAuthSuccess(userCredential.user);
    setIsLoading(false);
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/login');
    setIsLoading(false);
  }, [router]);
  
  // Show loader on initial load or if navigating away from auth pages while still loading
  if (isLoading && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <IconSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loginWithEmail, signupWithEmail, signInWithGoogle, signInWithGitHub, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
