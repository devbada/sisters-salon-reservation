import React, { useState, useEffect } from 'react';
import { useBusinessHours } from '~/features/business-hours';
import { RegularHoursWidget } from '~/features/business-hours/ui/RegularHoursWidget';
import { SpecialHoursWidget } from '~/features/business-hours/ui/SpecialHoursWidget';
import { HolidaysWidget } from '~/features/business-hours/ui/HolidaysWidget';
import { PageLoadingScreen } from '~/shared/ui/LoadingSpinner';
import type { BusinessHour, BusinessHoliday, SpecialHour } from '~/shared/lib/types';

export const BusinessHoursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regular' | 'special' | 'holidays'>('regular');
  
  const {
    businessHours,
    isLoading,
    error,
    updateBusinessHour,
    specialHours,
    holidays,
    createSpecialHour,
    updateSpecialHour,
    deleteSpecialHour,
    createHoliday,
    updateHoliday,
    deleteHoliday
  } = useBusinessHours();

  const handleSaveRegularHours = async (hours: BusinessHour[]) => {
    try {
      await updateBusinessHour(hours);
    } catch (error) {
      console.error('Failed to save regular hours:', error);
    }
  };

  if (isLoading) {
    return <PageLoadingScreen message="영업시간 정보를 불러오는 중..." />;
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
          <RegularHoursWidget
            businessHours={businessHours}
            onSave={handleSaveRegularHours}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeTab === 'special' && (
        <div className="glass-card p-6">
          <SpecialHoursWidget
            specialHours={specialHours}
            onAdd={createSpecialHour}
            onUpdate={updateSpecialHour}
            onDelete={deleteSpecialHour}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="glass-card p-6">
          <HolidaysWidget
            holidays={holidays}
            onAdd={createHoliday}
            onUpdate={updateHoliday}
            onDelete={deleteHoliday}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};