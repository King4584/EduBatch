import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, UserProfile } from '../api/auth.api';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: (role: 'admin' | 'teacher' | 'student') => Promise<void>;
  updateUser: (updatedData: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@edubatch.com', password: 'Password@123' },
  teacher: { email: 'teacher@edubatch.com', password: 'Password@123' },
  student: { email: 'student@edubatch.com', password: 'Password@123' },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('edubatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('edubatch_access_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('edubatch_access_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('edubatch_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem('edubatch_access_token');
          localStorage.removeItem('edubatch_refresh_token');
          localStorage.removeItem('edubatch_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res?.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('edubatch_access_token', accessToken);
      localStorage.setItem('edubatch_refresh_token', refreshToken);
      localStorage.setItem('edubatch_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
    }
  };

  const demoLogin = async (role: 'admin' | 'teacher' | 'student') => {
    const creds = DEMO_CREDENTIALS[role];
    await login(creds.email, creds.password);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res?.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('edubatch_access_token', accessToken);
      localStorage.setItem('edubatch_refresh_token', refreshToken);
      localStorage.setItem('edubatch_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('edubatch_access_token');
      localStorage.removeItem('edubatch_refresh_token');
      localStorage.removeItem('edubatch_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('edubatch_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
