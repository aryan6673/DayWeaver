
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconSpinner } from '@/components/icons';

interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string)  => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dayweaver-auth-token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      // In a real app, you'd validate the token with a backend
      // For mock purposes, if a token exists, we assume the user is logged in
      setUser({ id: '1', email: 'user@example.com', name: 'Day Weaver User' });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser: User = { id: '1', email, name: 'Day Weaver User' };
    localStorage.setItem(AUTH_STORAGE_KEY, 'mock-user-token');
    setUser(mockUser);
    setIsLoading(false);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  if (isLoading && !user) {
    // Show a global loading spinner only during initial auth check
    // Or you could return null and let individual pages handle their loading state
     const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
     // Only show full page loader if not on login page already to prevent loader flash on login page
     if (pathname !== '/login') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <IconSpinner className="h-10 w-10 text-primary" />
            </div>
        );
     }
  }


  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
