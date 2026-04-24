/**
 * 认证上下文
 * 提供全局的认证状态管理
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, changePassword } from '../api/auth';
import type { LoginRequest, ApiResponse, LoginResponse } from '../api/auth';

export interface UserInfo {
  username: string;
  token: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changeUserPassword: (oldPassword: string, newPassword: string) => Promise<ApiResponse<void>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户是否已登录
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');

    if (token && username) {
      setUser({ username, token });
    }
    setIsLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await apiLogin(credentials);

    if (response.success && response.data) {
      const { access_token, username } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('username', username);
      setUser({ username, token: access_token });
    } else {
      throw new Error(response.message || '登录失败');
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    // 清除本地存储的认证信息
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('username');
    setUser(null);
  }, []);

  // 修改密码
  const changeUserPassword = useCallback(async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return await changePassword({
      old_password: oldPassword,
      new_password: newPassword
    });
  }, []);

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
    changeUserPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
