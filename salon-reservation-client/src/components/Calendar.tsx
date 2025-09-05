import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AppointmentData } from './AppointmentForm';

interface CalendarComponentProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  reservations: AppointmentData[];
  isLoading?: boolean;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  onDateSelect,
  reservations,
  isLoading = false,
}) => {
  const [value, setValue] = useState<Value>(new Date(selectedDate + 'T00:00:00'));
  
  // 예약이 있는 날짜들을 추출
  const reservationDates = new Set(
    reservations.map(reservation => {
      const date = new Date(reservation.date);
      return date.toISOString().split('T')[0];
    })
  );

  // 날짜 선택 시 처리
  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date) {
      const formattedDate = newValue.toISOString().split('T')[0];
      onDateSelect(formattedDate);
    }
  };

  // selectedDate가 외부에서 변경될 때 달력도 업데이트
  useEffect(() => {
    setValue(new Date(selectedDate + 'T00:00:00'));
  }, [selectedDate]);

  // 타일 컨텐츠 커스터마이징 (예약이 있는 날짜에 점 표시)
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (reservationDates.has(dateStr)) {
        return (
          <div className="flex justify-center items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1"></div>
          </div>
        );
      }
    }
    return null;
  };

  // 타일 클래스 커스터마이징
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const classes = [];
      
      // 오늘 날짜
      const today = new Date().toISOString().split('T')[0];
      if (dateStr === today) {
        classes.push('today-tile');
      }
      
      // 예약이 있는 날짜
      if (reservationDates.has(dateStr)) {
        classes.push('has-reservation');
      }
      
      // 선택된 날짜
      if (dateStr === selectedDate) {
        classes.push('selected-date');
      }
      
      return classes.join(' ');
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        📅 예약 달력
      </h2>
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={value}
          locale="ko-KR"
          formatDay={(locale, date) => date.getDate().toString()}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="custom-calendar"
          prev2Label={null}
          next2Label={null}
          showNeighboringMonth={false}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-700 font-medium">
          선택한 날짜: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
        <div className="flex items-center justify-center mt-2 space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-600">예약 있음</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-2 border-purple-400 rounded-full mr-2"></div>
            <span className="text-gray-600">오늘</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;