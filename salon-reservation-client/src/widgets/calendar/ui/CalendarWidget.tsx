import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useReservationStore } from '~/features/reservation-management';
import { useBusinessHoursStore } from '~/features/business-hours-management';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLegend } from './CalendarLegend';
import type { Reservation } from '~/entities/reservation';
import type { BusinessHoliday } from '~/shared/lib/types';

interface CalendarWidgetProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  reservations: Reservation[];
  isLoading?: boolean;
  onHolidaySelect?: (date: string, holiday: BusinessHoliday) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateSelect,
  reservations,
  isLoading = false,
  onHolidaySelect,
}) => {
  const [value, setValue] = useState<Value>(new Date(selectedDate + 'T00:00:00'));
  const { conflicts, fetchConflicts } = useReservationStore();
  const { holidays, businessHours, specialHours, fetchHolidays, fetchBusinessHours, fetchSpecialHours } = useBusinessHoursStore();

  // Create maps for quick lookup
  const holidayMap = new Map(holidays.map(h => [h.date, h]));
  const specialHoursMap = new Map(specialHours.map(sh => [sh.date, sh]));
  const conflictDates = new Set(conflicts.map(c => c.date));

  // Extract reservation dates
  const reservationDates = new Set(
    reservations.map(reservation => {
      if (typeof reservation.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(reservation.date)) {
        return reservation.date;
      }
      const date = new Date(reservation.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  );

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchHolidays(),
        fetchBusinessHours(),
        fetchSpecialHours(),
        fetchConflicts(),
      ]);
    };
    loadData();
  }, [fetchHolidays, fetchBusinessHours, fetchSpecialHours, fetchConflicts]);

  // Update calendar when selectedDate changes
  useEffect(() => {
    setValue(new Date(selectedDate + 'T00:00:00'));
  }, [selectedDate]);

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date) {
      const year = newValue.getFullYear();
      const month = String(newValue.getMonth() + 1).padStart(2, '0');
      const day = String(newValue.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const holiday = holidayMap.get(formattedDate);
      if (holiday && onHolidaySelect) {
        onHolidaySelect(formattedDate, holiday);
      }
      
      onDateSelect(formattedDate);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const hasReservation = reservationDates.has(dateStr);
      const holiday = holidayMap.get(dateStr);
      const specialHour = specialHoursMap.get(dateStr);
      const hasConflict = conflictDates.has(dateStr);
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[20px]">
          {hasConflict && (
            <div className="text-lg mb-0.5 animate-bounce" title="중복 예약 있음">
              ⚠️
            </div>
          )}
          
          {hasReservation && !hasConflict && (
            <div className="w-2 h-2 bg-purple-500 rounded-full mb-0.5 reservation-dot"></div>
          )}
          
          {holiday && (
            <div className="text-xs text-red-600 font-medium leading-tight px-1 text-center max-w-full truncate">
              {holiday.name.length > 6 ? holiday.name.slice(0, 6) + '...' : holiday.name}
            </div>
          )}
          
          {!holiday && specialHour && (
            <div className="text-xs text-blue-600 font-medium leading-tight px-1 text-center max-w-full truncate">
              특별 근무
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const classes = [];
      const holiday = holidayMap.get(dateStr);
      const specialHour = specialHoursMap.get(dateStr);
      const hasConflict = conflictDates.has(dateStr);
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (dateStr === todayStr) {
        classes.push('today-tile');
      }
      
      if (hasConflict) {
        classes.push('conflict-date');
      }
      
      const hasValidReservation = reservationDates.has(dateStr);
      if (hasValidReservation && !hasConflict) {
        classes.push('has-reservation');
      }
      
      if (!holiday && specialHour) {
        classes.push('special-hours');
      }
      
      if (!specialHour) {
        const dayOfWeek = date.getDay();
        const businessHour = businessHours.find(hour => hour.dayOfWeek === dayOfWeek);
        if (businessHour && businessHour.isClosed) {
          classes.push('closed-day');
        }
      }
      
      if (holiday) {
        classes.push('holiday-tile');
        if (holiday.isClosed) {
          classes.push('holiday-closed');
        }
        if (holiday.isSubstitute) {
          classes.push('holiday-substitute');
        }
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
          <div className="ml-4 text-white">달력 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 w-full">
      <CalendarHeader selectedDate={selectedDate} />
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={value}
          locale="ko-KR"
          calendarType="gregory"
          formatDay={(locale, date) => date.getDate().toString()}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="custom-calendar"
          prev2Label={null}
          next2Label={null}
          showNeighboringMonth={true}
          showFixedNumberOfWeeks={true}
          minDetail="month"
          maxDetail="month"
        />
      </div>
      <CalendarLegend hasSubstituteHolidays={holidays.some(h => h.isSubstitute)} />
    </div>
  );
};