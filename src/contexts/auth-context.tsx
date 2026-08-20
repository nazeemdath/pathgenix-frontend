'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  fetchAPI,
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from '@/lib/api-client';
import {
  logoutLocalUser,
  upsertUserRecord,
  type MockAuthUser,
} from '@/lib/local-app-state';

export interface BackendUser {
  id: string;
  username: string;
  phone: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

interface AuthContextType {
  user: MockAuthUser | null;
  loading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<any>;
  signup: (
    authEmail: string,
    pass: string,
    details: {
      username: string;
      phone: string;
      email: string | null;
      confirmPassword?: string;
    }
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToMockAuth(u: BackendUser): MockAuthUser {
  return {
    uid: u.id,
    email: u.email,
    photoURL: null,
    displayName: u.display_name || u.username,
  };
}

function syncLocalStateRecord(u: BackendUser) {
  upsertUserRecord(u.id, (existing) => ({
    ...existing,
    uid: u.id,
    email: u.email,
    username: u.username,
    phone: u.phone,
  }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetchAPI<BackendUser>('/auth/me');
        if (res.success && res.data) {
          const authUser = mapBackendUserToMockAuth(res.data);
          syncLocalStateRecord(res.data);
          setUser(authUser);
        } else {
          removeAuthToken();
        }
      } catch (err) {
        console.warn('Backend session expired or unreachable:', err);
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const login = async (usernameOrEmail: string, pass: string) => {
    try {
      const res = await fetchAPI<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password: pass,
        }),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Login failed.');
      }

      setAuthToken(res.data.access_token);
      const authUser = mapBackendUserToMockAuth(res.data.user);
      syncLocalStateRecord(res.data.user);
      setUser(authUser);
      return { user: authUser };
    } catch (error: any) {
      if (error.status === 401 || error.code === 'unauthorized') {
        error.code = 'auth/invalid-credential';
      }
      throw error;
    }
  };

  const signup = async (
    authEmail: string,
    pass: string,
    details: {
      username: string;
      phone: string;
      email: string | null;
      confirmPassword?: string;
    }
  ) => {
    if (!pass || pass.length < 8) {
      const error = new Error('Password must be at least 8 characters long.');
      (error as any).code = 'auth/weak-password';
      throw error;
    }

    try {
      const res = await fetchAPI<TokenResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: details.username,
          phone: details.phone,
          email: details.email || authEmail || null,
          password: pass,
          confirm_password: details.confirmPassword || pass,
        }),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Sign up failed.');
      }

      setAuthToken(res.data.access_token);
      const authUser = mapBackendUserToMockAuth(res.data.user);
      syncLocalStateRecord(res.data.user);
      setUser(authUser);
      return { user: authUser };
    } catch (error: any) {
      if (error.status === 409 || error.code === 'conflict') {
        error.code = 'auth/email-already-in-use';
      }
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
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
      ) : (
        children
      )}
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
