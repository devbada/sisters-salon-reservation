import React, { useState, useEffect } from 'react';
import { CalendarWidget } from '~/widgets/calendar';
import { ReservationTableWidget } from '~/widgets/reservation-table';
import { useReservationStore } from '~/features/reservation-management';
import { useDesignerStore } from '~/features/designer-management';
import type { Reservation } from '~/entities/reservation';
import type { BusinessHoliday } from '~/shared/lib/types';

export const ReservationsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  const { 
    reservations,
    allReservations,
    isLoading,
    isStatusUpdateLoading,
    fetchReservations,
    fetchAllReservations,
    updateReservation,
    deleteReservation,
    updateReservationStatus
  } = useReservationStore();
  
  const { activeDesigners, fetchActiveDesigners } = useDesignerStore();

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchReservations(selectedDate),
        fetchAllReservations(),
        fetchActiveDesigners(),
      ]);
    };
    
    loadInitialData();
  }, [fetchReservations, fetchAllReservations, fetchActiveDesigners, selectedDate]);

  // 날짜 변경 시 해당 날짜의 예약 조회
  useEffect(() => {
    if (selectedDate) {
      fetchReservations(selectedDate);
    }
  }, [fetchReservations, selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleHolidaySelect = (date: string, holiday: BusinessHoliday) => {
    console.log(`공휴일 선택: ${date} - ${holiday.name}`);
  };

  const handleReservationEdit = (reservation: Reservation, index: number) => {
    setEditingReservation(reservation);
    // 편집 모달 열기 로직
  };

  const handleReservationDelete = async (index: number) => {
    const reservation = reservations[index];
    if (reservation && window.confirm(`${reservation.customerName}님의 예약을 삭제하시겠습니까?`)) {
      try {
        await deleteReservation(reservation.id);
        await fetchReservations(selectedDate);
        await fetchAllReservations();
      } catch (error) {
        console.error('예약 삭제 실패:', error);
      }
    }
  };

  const handleStatusChange = async (
    reservationId: string, 
    newStatus: string, 
    reason?: string, 
    notes?: string
  ) => {
    try {
      await updateReservationStatus(reservationId, newStatus, reason, notes);
      await fetchReservations(selectedDate);
      await fetchAllReservations();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Calendar Selection & Appointment Form */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Calendar Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            📅 캘린더 선택
          </h2>
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            reservations={allReservations}
            isLoading={isLoading}
            onHolidaySelect={handleHolidaySelect}
          />
        </div>

        {/* Customer Registration Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            ✏️ 고객 등록
          </h2>
          {/* AppointmentForm 위젯이 생성되면 여기에 추가 */}
          <div className="text-center py-8 text-gray-500">
            예약 등록 폼 위젯 구현 예정
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="w-full">
        {/* SearchFilter 위젯이 생성되면 여기에 추가 */}
        <div className="glass-card p-4 text-center text-gray-500">
          검색 및 필터 위젯 구현 예정
        </div>
      </div>

      {/* Bottom Section: Reservation List */}
      <div className="w-full">
        <ReservationTableWidget
          reservations={reservations}
          onEdit={handleReservationEdit}
          onDelete={handleReservationDelete}
          onStatusChange={handleStatusChange}
          selectedDate={selectedDate}
          isStatusUpdateLoading={isStatusUpdateLoading}
        />
      </div>
    </div>
  );
};