import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationTabs: React.FC = () => {
  const getActiveClassName = (isActive: boolean) => {
    return `px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
        : 'text-gray-700 hover:bg-white/20'
    }`;
  };

  return (
    <div className="max-w-[80vw] mx-auto">
      <nav className="glass-card p-2">
        <div className="flex space-x-4">
          <NavLink
            to="/reservations"
            className={({ isActive }) => getActiveClassName(isActive)}
          >
            📅 예약 관리
          </NavLink>
          <NavLink
            to="/customers"
            className={({ isActive }) => getActiveClassName(isActive)}
          >
            👥 고객 관리
          </NavLink>
          <NavLink
            to="/designers"
            className={({ isActive }) => getActiveClassName(isActive)}
          >
            👨‍🎨 디자이너 관리
          </NavLink>
          <NavLink
            to="/business-hours"
            className={({ isActive }) => getActiveClassName(isActive)}
          >
            🕐 영업시간 관리
          </NavLink>
          <NavLink
            to="/statistics"
            className={({ isActive }) => getActiveClassName(isActive)}
          >
            📊 통계 대시보드
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default NavigationTabs;