'use client';

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { AppUser } from '@/types/auth';

interface AuthContextValue {
  user: AppUser | null;
  login: (user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'carbonloop_user';
const USER_CHANGE_EVENT = 'carbonloop-user-change';
let cachedUserRaw: string | null = null;
let cachedUser: AppUser | null = null;

function readStoredUser(): AppUser | null {
  if (typeof window === 'undefined') return null;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    cachedUserRaw = null;
    cachedUser = null;
    return null;
  }

  if (saved === cachedUserRaw) {
    return cachedUser;
  }

  try {
    cachedUserRaw = saved;
    cachedUser = JSON.parse(saved) as AppUser;
    return cachedUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedUserRaw = null;
    cachedUser = null;
    return null;
  }
}

function subscribeToUserChange(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(USER_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(USER_CHANGE_EVENT, onStoreChange);
  };
}

function emitUserChange() {
  window.dispatchEvent(new Event(USER_CHANGE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(
    subscribeToUserChange,
    readStoredUser,
    () => null,
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login(nextUser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        emitUserChange();
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        emitUserChange();
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
