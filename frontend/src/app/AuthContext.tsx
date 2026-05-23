import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** Finalise a login/register flow once we have user + token. */
  setSession: (user: User, token: string, remember?: boolean) => void;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token') ?? sessionStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState(false);

  // Re-hydrate user from token on cold start
  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      authApi.me()
        .then(r => {
          setUser(r.data);
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(r.data));
          document.body.className = `role-${r.data.role}`;
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, user]);

  const setSession = (newUser: User, newToken: string, remember = false) => {
    setUser(newUser);
    setToken(newToken);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
    storage.setItem('user', JSON.stringify(newUser));
    document.body.className = `role-${newUser.role}`;
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updated));
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* silent */ }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    document.body.className = '';
  };

  return (
    <AuthContext.Provider value={{ user, token, setSession, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
