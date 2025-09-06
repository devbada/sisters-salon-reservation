import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const handleSystemToggle = () => {
    setTheme('system');
  };

  return (
    <div className="flex items-center space-x-2">
      {/* 테마 토글 버튼 */}
      <button
        onClick={handleToggle}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
        aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            effectiveTheme === 'dark' ? 'translate-x-8' : 'translate-x-0'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-sm">
            {effectiveTheme === 'dark' ? '🌙' : '🌞'}
          </span>
        </span>
      </button>

      {/* 시스템 테마 버튼 */}
      <button
        onClick={handleSystemToggle}
        className={`p-2 rounded-lg transition-all duration-200 ${
          theme === 'system'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
            : 'glass-card text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Use system theme"
        aria-label="Use system theme"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </button>

      {/* 테마 상태 표시 */}
      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
        {theme === 'system' ? `System (${effectiveTheme})` : effectiveTheme}
      </div>
    </div>
  );
};

export default ThemeToggle;