import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAdmin: () => Promise<boolean>;
  register: (username: string, password: string, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('authToken')
  );
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // 토큰이 있을 때 사용자 정보 가져오기
  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('http://localhost:4000/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      // 토큰이 유효하지 않으면 제거
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        username,
        password,
      });

      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.error || '로그인에 실패했습니다.';
        throw new Error(message);
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        throw new Error('로그인 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAdmin = async (): Promise<boolean> => {
    try {
      const response = await axios.get('http://localhost:4000/api/auth/check-admin');
      return response.data.hasAdmin;
    } catch (error) {
      console.error('관리자 확인 실패:', error);
      return false;
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/register', {
        username,
        password,
        email,
      });

      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data?.error || '회원가입에 실패했습니다.';
        throw new Error(message);
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        throw new Error('회원가입 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAdmin,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};