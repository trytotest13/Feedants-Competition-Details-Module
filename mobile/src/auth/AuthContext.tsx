import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { configureApi } from '../api/client';
import { User } from '../api/types';
import { tokenStorage } from './tokenStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await Promise.all([tokenStorage.clearToken(), tokenStorage.clearUser()]);
    setToken(null);
    setUser(null);
  }, []);

  // Wire the API layer to the stored token (kept here to avoid import cycles)
  useEffect(() => {
    configureApi({
      getToken: () => tokenStorage.getToken(),
      onUnauthorized: () => {
        void signOut();
      },
    });
  }, [signOut]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await tokenStorage.getToken();
        if (!stored) return;
        setToken(stored);
        // Cached user for instant paint, then revalidate against the API
        const cached = await tokenStorage.getUser();
        if (cached && mounted) setUser(cached as User);
        const { user: fresh } = await authApi.me();
        if (mounted) {
          setUser(fresh);
          await tokenStorage.saveUser(fresh);
        }
      } catch {
        // Invalid/expired token or API down — force sign-in
        if (mounted) {
          setToken(null);
          setUser(null);
          await tokenStorage.clearToken();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    await Promise.all([tokenStorage.saveToken(newToken), tokenStorage.saveUser(newUser)]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: fresh, referral } = await authApi.me();
    const merged = { ...fresh, referralEarnings: referral.earnings } as User;
    setUser(merged);
    await tokenStorage.saveUser(merged);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signIn, signOut, refreshUser }),
    [user, token, loading, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
