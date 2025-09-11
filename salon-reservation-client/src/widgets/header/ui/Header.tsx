import React from 'react';
import { useAuthStore } from '~/features/authentication';

interface HeaderProps {
  activeTab: 'reservations' | 'customers' | 'designers' | 'business-hours' | 'statistics';
  onTabChange: (tab: 'reservations' | 'customers' | 'designers' | 'business-hours' | 'statistics') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      logout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with User Info */}
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
                  {user?.username}
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

      {/* Navigation Tabs */}
      <div className="max-w-[80vw] mx-auto">
        <nav className="glass-card p-2">
          <div className="flex space-x-4">
            <button
              onClick={() => onTabChange('reservations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'reservations'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              📅 예약 관리
            </button>
            <button
              onClick={() => onTabChange('customers')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              👥 고객 관리
            </button>
            <button
              onClick={() => onTabChange('designers')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'designers'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              👨‍🎨 디자이너 관리
            </button>
            <button
              onClick={() => onTabChange('business-hours')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'business-hours'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              🕐 영업시간 관리
            </button>
            <button
              onClick={() => onTabChange('statistics')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'statistics'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
            >
              📊 통계 대시보드
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};