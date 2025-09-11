import React from 'react';

interface CalendarLegendProps {
  hasSubstituteHolidays?: boolean;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ hasSubstituteHolidays = false }) => {
  return (
    <div className="flex items-center justify-center mt-2 space-x-4 text-sm flex-wrap gap-2">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
        <span className="text-gray-600">예약 있음</span>
      </div>
      <div className="flex items-center">
        <div className="text-orange-500 mr-1 text-sm">⚠️</div>
        <span className="text-gray-600">중복 예약</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
        <span className="text-gray-600">오늘</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <span className="text-gray-600">공휴일</span>
      </div>
      {hasSubstituteHolidays && (
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-gray-600">대체공휴일</span>
        </div>
      )}
    </div>
  );
};