import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminRegister from './AdminRegister';
import ProtectedRoute from './ProtectedRoute';
import Header from './Header';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { checkAdmin, loading } = useAuth();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const adminExists = await checkAdmin();
        setHasAdmin(adminExists);
      } catch (error) {
        console.error('Error checking admin:', error);
        setHasAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminExists();
    }
  }, [loading, checkAdmin]);

  const handleAdminRegistered = () => {
    setHasAdmin(true);
  };

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">시스템 초기화 중...</p>
        </div>
      </div>
    );
  }

  // If no admin exists, show registration form
  if (hasAdmin === false) {
    return <AdminRegister onSuccess={handleAdminRegistered} />;
  }

  // If admin exists, show protected content
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AppWrapper;