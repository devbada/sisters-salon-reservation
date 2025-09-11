import React, { useState, useEffect } from 'react';
import { useBusinessHours } from '~/features/business-hours';
import type { BusinessHour, BusinessHoliday, SpecialHour } from '~/shared/lib/types';

export const BusinessHoursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regular' | 'special' | 'holidays'>('regular');
  
  const {
    businessHours,
    isLoading: loading,
    error,
    updateBusinessHour
  } = useBusinessHours();
  
  // TODO: Implement full business hours management
  const specialHours: SpecialHour[] = [];
  const holidays: BusinessHoliday[] = [];
  const fetchBusinessHours = () => {};
  const fetchSpecialHours = () => {};
  const fetchHolidays = () => {};
  const updateBusinessHours = updateBusinessHour;
  const createSpecialHours = () => {};
  const updateSpecialHours = () => {};
  const deleteSpecialHours = () => {};

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBusinessHours(),
        fetchSpecialHours(),
        fetchHolidays(),
      ]);
    };
    loadData();
  }, [fetchBusinessHours, fetchSpecialHours, fetchHolidays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        <span className="ml-4 text-gray-700">영업시간 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🕐 영업시간 관리</h1>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('regular')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'regular'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            🕒 정규 영업시간
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'special'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            📅 특별 영업시간
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'holidays'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            🎉 공휴일 관리
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'regular' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">정규 영업시간 설정</h2>
          {/* 정규 영업시간 위젯이 생성되면 여기에 추가 */}
          <div className="text-center py-12 text-gray-500">
            정규 영업시간 관리 위젯 구현 예정
            <div className="mt-4 text-sm">
              - 요일별 영업시간 설정
              - 휴무일 설정
              - 브레이크 타임 설정
            </div>
          </div>
        </div>
      )}

      {activeTab === 'special' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">특별 영업시간 관리</h2>
          {/* 특별 영업시간 위젯이 생성되면 여기에 추가 */}
          <div className="text-center py-12 text-gray-500">
            특별 영업시간 관리 위젯 구현 예정
            <div className="mt-4 text-sm">
              - 특정 날짜 영업시간 변경
              - 임시 휴무 설정
              - 연장 운영 설정
            </div>
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">공휴일 관리</h2>
          {/* 공휴일 관리 위젯이 생성되면 여기에 추가 */}
          <div className="text-center py-12 text-gray-500">
            공휴일 관리 위젯 구현 예정
            <div className="mt-4 text-sm">
              - 공휴일 자동 가져오기
              - 사용자 정의 휴일 추가
              - 대체 공휴일 설정
            </div>
          </div>
        </div>
      )}
    </div>
  );
};