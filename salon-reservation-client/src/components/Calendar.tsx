import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AppointmentData } from './AppointmentForm';
import holidayService, { Holiday } from '../services/holidayService';

interface CalendarComponentProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  reservations: AppointmentData[];
  isLoading?: boolean;
  onHolidaySelect?: (date: string, holiday: Holiday) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  onDateSelect,
  reservations,
  isLoading = false,
  onHolidaySelect,
}) => {
  const [value, setValue] = useState<Value>(new Date(selectedDate + 'T00:00:00'));
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayMap, setHolidayMap] = useState<Map<string, Holiday>>(new Map());
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  
  // 예약이 있는 날짜들을 추출
  const reservationDates = new Set(
    reservations.map(reservation => {
      // 예약 날짜가 이미 YYYY-MM-DD 형식이라면 그대로 사용
      if (typeof reservation.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(reservation.date)) {
        return reservation.date;
      }
      // 그렇지 않으면 Date 객체로 변환 후 로컬 날짜 추출
      const date = new Date(reservation.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  );

  // 날짜 선택 시 처리
  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date) {
      // 시간대 문제를 방지하기 위해 로컬 날짜 사용
      const year = newValue.getFullYear();
      const month = String(newValue.getMonth() + 1).padStart(2, '0');
      const day = String(newValue.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // 선택한 날짜가 공휴일인지 확인
      const holiday = holidayMap.get(formattedDate);
      if (holiday && onHolidaySelect) {
        onHolidaySelect(formattedDate, holiday);
      }
      
      onDateSelect(formattedDate);
    }
  };

  // 공휴일 데이터 가져오기
  useEffect(() => {
    const fetchHolidays = async () => {
      setHolidaysLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        
        // 올해와 내년 공휴일을 동시에 가져오기
        const [currentYearHolidays, nextYearHolidays] = await Promise.all([
          holidayService.getHolidaysByYear(currentYear),
          holidayService.getHolidaysByYear(nextYear)
        ]);
        
        const allHolidays = [
          ...(currentYearHolidays.holidays || []),
          ...(nextYearHolidays.holidays || [])
        ];
        
        setHolidays(allHolidays);
        setHolidayMap(holidayService.createHolidayMap(allHolidays));
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      } finally {
        setHolidaysLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // selectedDate가 외부에서 변경될 때 달력도 업데이트
  useEffect(() => {
    setValue(new Date(selectedDate + 'T00:00:00'));
  }, [selectedDate]);

  // 타일 컨텐츠 커스터마이징 (예약이 있는 날짜에 점 표시, 공휴일 이름 표시)
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasReservation = reservationDates.has(dateStr);
      const holiday = holidayMap.get(dateStr);
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[20px]">
          {/* 예약 표시 */}
          {hasReservation && (
            <div className="w-2 h-2 bg-purple-500 rounded-full mb-0.5"></div>
          )}
          
          {/* 공휴일 이름 표시 */}
          {holiday && (
            <div className="text-xs text-red-600 font-medium leading-tight px-1 text-center max-w-full truncate">
              {holiday.name.length > 6 ? holiday.name.slice(0, 6) + '...' : holiday.name}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 타일 클래스 커스터마이징
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const classes = [];
      const holiday = holidayMap.get(dateStr);
      
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
      
      // 공휴일 스타일링
      if (holiday) {
        classes.push('holiday-tile');
        if (holiday.is_closed) {
          classes.push('holiday-closed');
        }
        if (holiday.is_substitute) {
          classes.push('holiday-substitute');
        }
      }
      
      return classes.join(' ');
    }
    return '';
  };

  if (isLoading || holidaysLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          <div className="ml-4 text-white">
            {holidaysLoading ? '공휴일 정보 로딩 중...' : '달력 로딩 중...'}
          </div>
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
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">공휴일</span>
          </div>
          {holidays.some(h => h.is_substitute) && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-gray-600">대체공휴일</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;