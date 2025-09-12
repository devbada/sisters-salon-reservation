import React, { useState, useEffect } from 'react';
import type { BusinessHour } from '~/shared/lib/types';

interface RegularHoursWidgetProps {
  businessHours: BusinessHour[];
  onSave: (hours: BusinessHour[]) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: '월요일', shortLabel: '월' },
  { key: 'tuesday', label: '화요일', shortLabel: '화' },
  { key: 'wednesday', label: '수요일', shortLabel: '수' },
  { key: 'thursday', label: '목요일', shortLabel: '목' },
  { key: 'friday', label: '금요일', shortLabel: '금' },
  { key: 'saturday', label: '토요일', shortLabel: '토' },
  { key: 'sunday', label: '일요일', shortLabel: '일' }
] as const;

export const RegularHoursWidget: React.FC<RegularHoursWidgetProps> = ({
  businessHours,
  onSave,
  isLoading = false
}) => {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize with default hours if empty
    if (businessHours.length === 0) {
      const defaultHours: BusinessHour[] = DAYS_OF_WEEK.map((day, index) => ({
        id: `default-${index}`,
        dayOfWeek: index,
        dayName: day.key,
        isOpen: index < 6, // Monday to Saturday open by default
        openTime: '09:00',
        closeTime: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isActive: true
      }));
      setHours(defaultHours);
    } else {
      setHours(businessHours);
    }
  }, [businessHours]);

  const handleDayToggle = (dayIndex: number) => {
    const updatedHours = hours.map(hour => 
      hour.dayOfWeek === dayIndex 
        ? { ...hour, isOpen: !hour.isOpen }
        : hour
    );
    setHours(updatedHours);
    setHasChanges(true);
  };

  const handleTimeChange = (
    dayIndex: number, 
    field: keyof Pick<BusinessHour, 'openTime' | 'closeTime' | 'breakStart' | 'breakEnd'>, 
    value: string
  ) => {
    const updatedHours = hours.map(hour => 
      hour.dayOfWeek === dayIndex 
        ? { ...hour, [field]: value }
        : hour
    );
    setHours(updatedHours);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(hours);
    setHasChanges(false);
  };

  const handleReset = () => {
    setHours(businessHours);
    setHasChanges(false);
  };

  const validateTime = (start: string, end: string): boolean => {
    return start < end;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">정규 영업시간</h3>
          <p className="text-sm text-gray-600">매주 반복되는 기본 영업시간을 설정하세요</p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              취소
            </button>
          )}
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
              hasChanges 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Days Configuration */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayHour = hours.find(h => h.dayOfWeek === index);
          if (!dayHour) return null;

          const openTimeError = dayHour.isOpen && dayHour.openTime && dayHour.closeTime && 
            !validateTime(dayHour.openTime, dayHour.closeTime);
          const breakTimeError = dayHour.isOpen && dayHour.breakStart && dayHour.breakEnd && 
            !validateTime(dayHour.breakStart, dayHour.breakEnd);

          return (
            <div key={day.key} className="glass-card p-4">
              <div className="flex items-center space-x-4">
                {/* Day Toggle */}
                <div className="flex items-center min-w-0">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayHour.isOpen}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 w-12">
                      {day.shortLabel}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 hidden sm:inline">
                      {day.label}
                    </span>
                  </label>
                </div>

                {/* Time Settings */}
                {dayHour.isOpen ? (
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Operating Hours */}
                    <div className="col-span-2 lg:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">영업시간</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={dayHour.openTime}
                          onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                          className={`text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 ${
                            openTimeError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                        <span className="text-xs text-gray-500">~</span>
                        <input
                          type="time"
                          value={dayHour.closeTime}
                          onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                          className={`text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 ${
                            openTimeError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {openTimeError && (
                        <p className="text-xs text-red-600 mt-1">종료 시간이 시작 시간보다 늦어야 합니다</p>
                      )}
                    </div>

                    {/* Break Time */}
                    <div className="col-span-2 lg:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">휴게시간</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={dayHour.breakStart || ''}
                          onChange={(e) => handleTimeChange(index, 'breakStart', e.target.value)}
                          className={`text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 ${
                            breakTimeError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                        <span className="text-xs text-gray-500">~</span>
                        <input
                          type="time"
                          value={dayHour.breakEnd || ''}
                          onChange={(e) => handleTimeChange(index, 'breakEnd', e.target.value)}
                          className={`text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 ${
                            breakTimeError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {breakTimeError && (
                        <p className="text-xs text-red-600 mt-1">휴게 종료 시간이 시작 시간보다 늦어야 합니다</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-gray-500 italic">
                    휴무
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Settings */}
      <div className="glass-card p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">빠른 설정</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const updatedHours = hours.map(hour => ({
                ...hour,
                isOpen: hour.dayOfWeek < 6, // Mon-Sat
                openTime: '09:00',
                closeTime: '18:00',
                breakStart: '12:00',
                breakEnd: '13:00'
              }));
              setHours(updatedHours);
              setHasChanges(true);
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
            disabled={isLoading}
          >
            월-토 (09:00-18:00)
          </button>
          <button
            onClick={() => {
              const updatedHours = hours.map(hour => ({
                ...hour,
                isOpen: true,
                openTime: '10:00',
                closeTime: '20:00',
                breakStart: '14:00',
                breakEnd: '15:00'
              }));
              setHours(updatedHours);
              setHasChanges(true);
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
            disabled={isLoading}
          >
            매일 (10:00-20:00)
          </button>
          <button
            onClick={() => {
              const updatedHours = hours.map(hour => ({
                ...hour,
                breakStart: undefined,
                breakEnd: undefined
              }));
              setHours(updatedHours);
              setHasChanges(true);
            }}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200"
            disabled={isLoading}
          >
            휴게시간 제거
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-2">설정 요약</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 영업일: {hours.filter(h => h.isOpen).length}일</p>
          <p>• 휴무일: {hours.filter(h => !h.isOpen).length}일</p>
          {hours.some(h => h.breakStart && h.breakEnd) && (
            <p>• 휴게시간 설정된 날: {hours.filter(h => h.breakStart && h.breakEnd).length}일</p>
          )}
        </div>
      </div>
    </div>
  );
};