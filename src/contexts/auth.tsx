import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { login as apiLogin, type LoginRequest } from '@/api/auth';
import { clearToken, getToken, getUsername, setToken } from '@/lib/token';

interface AuthUser {
  username: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const username = getUsername();
    if (token && username) {
      setUser({ token, username });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest, remember = true) => {
    const res = await apiLogin(credentials);
    if (!res.success || !res.data) {
      throw new Error(res.message || '登录失败');
    }
    const { access_token, username } = res.data;
    setToken(access_token, username, remember);
    setUser({ token: access_token, username });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
