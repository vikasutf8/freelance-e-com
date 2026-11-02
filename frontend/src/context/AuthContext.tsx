import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import {
  getStoredToken,
  removeStoredToken,
  storeToken,
} from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(getStoredToken()),
  );

  useEffect(() => {
    let active = true;
    const storedToken = getStoredToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    authApi
      .getMe()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setToken(null);
          removeStoredToken();
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    };
    window.addEventListener('microcart:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('microcart:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    storeToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const result = await authApi.register({ email, password });
    storeToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getMe();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
