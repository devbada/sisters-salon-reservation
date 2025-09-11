import React from 'react';

interface CalendarHeaderProps {
  selectedDate: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ selectedDate }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📅 예약 달력
      </h2>
      <p className="text-gray-700 font-medium">
        선택한 날짜: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}
      </p>
    </div>
  );
};