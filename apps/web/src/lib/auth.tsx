'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, code: string) => Promise<boolean>;
  requestOtp: (phone: string, csrfToken?: string) => Promise<string>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await api.get<User>('/users/profile', undefined, { redirectOnUnauthorized: false });
        setUser(profile);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    load();
  }, []);

  const requestOtp = async (phone: string, csrfToken?: string): Promise<string> => {
    const result = await api.post<{ message: string }>('/auth/otp', { phone }, {
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
    });
    return result.message;
  };

  const login = async (phone: string, code: string): Promise<boolean> => {
    const result = await api.post<AuthResponse>('/auth/verify', { phone, code });
    setUser(result.user);
    return result.isNew;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // proceed with local logout even if API fails
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, requestOtp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}