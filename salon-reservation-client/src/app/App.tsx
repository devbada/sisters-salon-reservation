import React, { useEffect, useState } from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './AppRouter';
import { initializeApp, trackPerformanceMetrics } from './lib';
import './App.css';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // 성능 추적 시작
        trackPerformanceMetrics();
        
        // 애플리케이션 초기화
        await initializeApp();
        
        setIsInitialized(true);
      } catch (error: any) {
        console.error('App initialization failed:', error);
        setInitError(error.message || '애플리케이션 초기화에 실패했습니다.');
      }
    };

    initialize();
  }, []);

  // 초기화 로딩 화면
  if (!isInitialized && !initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            {/* 로딩 애니메이션 */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl">💄</div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            헤어 살롱 예약 시스템
          </h1>
          <p className="text-gray-600 mb-4">시스템을 준비하고 있습니다...</p>
          
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // 초기화 실패 화면
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-pink-50 to-orange-100">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="glass-card p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              초기화 오류
            </h1>
            <p className="text-gray-600 mb-6">
              {initError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              🔄 다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 메인 애플리케이션
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;