import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Admin {
  id: number;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAdmin: () => Promise<boolean>;
  registerAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  admin: null,
  login: async () => ({ success: false }),
  logout: () => {},
  checkAdmin: async () => false,
  registerAdmin: async () => ({ success: false }),
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await axios.get('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.valid) {
            setIsAuthenticated(true);
            setAdmin(response.data.admin);
            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Invalid token, remove it
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // Token verification failed
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, admin: adminData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setAdmin(adminData);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '로그인에 실패했습니다.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setAdmin(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAdmin = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/auth/check-admin');
      return response.data.hasAdmin;
    } catch (error) {
      console.error('Error checking admin:', error);
      return false;
    }
  };

  const registerAdmin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.post('/api/auth/register', { username, password });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '관리자 등록에 실패했습니다.';
      return { success: false, error: errorMessage };
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    admin,
    login,
    logout,
    checkAdmin,
    registerAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};