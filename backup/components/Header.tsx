import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout();
    }
  };

  return (
    <header className="glass-card border-b border-white/20 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 transition-colors duration-200">
              헤어 살롱 예약 시스템
            </h1>
            <p className="text-sm text-gray-600 transition-colors duration-200">
              관리자 대시보드
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 transition-colors duration-200">
              <span className="font-medium text-gray-900">
                {admin?.username}
              </span> 님
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;