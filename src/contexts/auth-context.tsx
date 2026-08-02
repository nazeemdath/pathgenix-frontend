
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  getCurrentAuthUser,
  loginLocalUser,
  logoutLocalUser,
  signupLocalUser,
  type MockAuthUser,
} from '@/lib/local-app-state';

interface AuthContextType {
  user: MockAuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (authEmail: string, pass: string, details: { username: string, phone: string, email: string | null }) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentAuthUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string) => {
    const result = loginLocalUser(email);
    if (!result.success || !result.user) {
      const error = new Error(result.error || 'Login failed.');
      (error as any).code = 'auth/invalid-credential';
      throw error;
    }
    setUser(result.user);
    return { user: result.user };
  };

  const signup = async (authEmail: string, pass: string, details: { username: string, phone: string, email: string | null }) => {
    if (!pass || pass.length < 6) {
      const error = new Error('Password must be at least 6 characters long.');
      (error as any).code = 'auth/weak-password';
      throw error;
    }

    const result = signupLocalUser({
      authEmail,
      username: details.username,
      phone: details.phone,
      email: details.email,
    });

    if (!result.success || !result.user) {
      const error = new Error(result.error || 'Sign up failed.');
      (error as any).code = 'auth/email-already-in-use';
      throw error;
    }

    setUser(result.user);
    return { user: result.user };
  };

  const logout = () => {
    logoutLocalUser();
    setUser(null);
    return Promise.resolve();
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
         <div className="flex h-screen items-center justify-center">
            <LoadingSpinner className="h-12 w-12" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
