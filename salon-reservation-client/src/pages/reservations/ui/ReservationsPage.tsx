import React, { useState, useEffect, useMemo } from 'react';
import { CalendarWidget } from '~/widgets/calendar';
import { ReservationTableWidget } from '~/widgets/reservation-table';
import { useReservationStore } from '~/features/reservation-management';
import { useDesigners } from '~/features/designer-management';
import { AppointmentForm } from '~/features/reservation-management/ui/AppointmentForm';
import { ReservationSearch, ReservationSearchFilters } from '~/features/reservation-management/ui/ReservationSearch';
import { useReservations } from '~/features/reservation-management/model/useReservations';
import { reservationApi } from '~/entities/reservation';
import type { Reservation, ReservationStatus, ReservationFormData } from '~/entities/reservation';
import type { BusinessHoliday } from '~/shared/lib/types';

export const ReservationsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState<ReservationSearchFilters>({});
  
  const { 
    reservations,
    isLoading,
    error,
    setReservations,
    setLoading,
    setError,
    addReservation,
    updateReservation: updateReservationInStore,
    removeReservation
  } = useReservationStore();
  
  const { createReservation } = useReservations(selectedDate);
  const { designers, isLoading: designersLoading } = useDesigners();
  const activeDesigners = designers.filter(designer => designer.isActive);

  // 검색 옵션을 위한 데이터 준비
  const designerNames = activeDesigners.map(d => d.name);
  const availableServices = ['컷', '컷+염색', '펌', '트리트먼트', '스타일링', '케어'];

  // 초기 데이터 로드
  useEffect(() => {
    // TODO: API 연동 로직 구현 필요
    console.log('Initial data load for date:', selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleHolidaySelect = (date: string, holiday: BusinessHoliday) => {
    console.log(`공휴일 선택: ${date} - ${holiday.name}`);
  };

  const handleReservationEdit = (reservation: Reservation, index: number) => {
    setEditingReservation(reservation);
    setShowAppointmentForm(true);
  };

  const handleReservationDelete = async (index: number) => {
    const reservation = reservations[index];
    if (reservation && window.confirm(`${reservation.customerName}님의 예약을 삭제하시겠습니까?`)) {
      try {
        await reservationApi.deleteReservation(reservation.id);
        removeReservation(reservation.id);
        console.log('예약 삭제 완료:', reservation.id);
      } catch (error) {
        console.error('예약 삭제 실패:', error);
        setError('예약 삭제에 실패했습니다.');
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
      await reservationApi.updateReservationStatus(reservationId, newStatus as ReservationStatus);
      updateReservationInStore(reservationId, { status: newStatus as ReservationStatus });
      console.log('예약 상태 변경 완료:', reservationId, newStatus);
    } catch (error) {
      console.error('상태 변경 실패:', error);
      setError('예약 상태 변경에 실패했습니다.');
    }
  };

  const handleAppointmentSubmit = async (formData: ReservationFormData) => {
    try {
      if (editingReservation) {
        // 수정 모드
        const updatedReservation = await reservationApi.updateReservation(editingReservation.id, formData);
        updateReservationInStore(editingReservation.id, updatedReservation);
        console.log('예약 수정 완료:', updatedReservation);
      } else {
        // 생성 모드
        const newReservation = await createReservation(formData);
        console.log('새 예약 생성 완료:', newReservation);
      }
      setShowAppointmentForm(false);
    } catch (error) {
      console.error(editingReservation ? '예약 수정 실패:' : '예약 생성 실패:', error);
      setError(editingReservation ? '예약 수정에 실패했습니다.' : '예약 생성에 실패했습니다.');
    }
  };

  const handleAppointmentCancel = () => {
    setEditingReservation(null);
    setShowAppointmentForm(false);
  };

  const handleAddReservation = () => {
    setEditingReservation(null);
    setShowAppointmentForm(true);
  };

  const handleSearch = (filters: ReservationSearchFilters) => {
    setSearchFilters(filters);
    console.log('검색 필터 적용:', filters);
  };

  const handleResetSearch = () => {
    setSearchFilters({});
    console.log('검색 필터 초기화');
  };

  // 필터가 적용된 예약 목록
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      if (searchFilters.customerName && !reservation.customerName.toLowerCase().includes(searchFilters.customerName.toLowerCase())) {
        return false;
      }
      if (searchFilters.designerName && reservation.designerName !== searchFilters.designerName) {
        return false;
      }
      if (searchFilters.status && reservation.status !== searchFilters.status) {
        return false;
      }
      if (searchFilters.service && reservation.service !== searchFilters.service) {
        return false;
      }
      if (searchFilters.dateFrom && reservation.date < searchFilters.dateFrom) {
        return false;
      }
      if (searchFilters.dateTo && reservation.date > searchFilters.dateTo) {
        return false;
      }
      return true;
    });
  }, [reservations, searchFilters]);

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
            reservations={reservations}
            isLoading={isLoading}
            onHolidaySelect={handleHolidaySelect}
          />
        </div>

        {/* Appointment Registration Form */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              {editingReservation ? '✏️ 예약 수정' : '✏️ 예약 등록'}
            </h2>
            <button
              onClick={handleAddReservation}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
            >
              + 새 예약
            </button>
          </div>
          {!showAppointmentForm ? (
            <div className="text-center py-8 text-gray-500">
              위의 "새 예약" 버튼을 클릭하여 예약을 등록하세요.
            </div>
          ) : (
            <AppointmentForm
              onSubmit={handleAppointmentSubmit}
              onCancel={handleAppointmentCancel}
              initialData={editingReservation ? {
                customerName: editingReservation.customerName,
                customerPhone: editingReservation.customerPhone,
                customerEmail: editingReservation.customerEmail,
                designerName: editingReservation.designerName,
                service: editingReservation.service,
                date: editingReservation.date,
                time: editingReservation.time,
                duration: editingReservation.duration,
                notes: editingReservation.notes,
                price: editingReservation.price
              } : { date: selectedDate }}
            />
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="w-full">
        <ReservationSearch
          onSearch={handleSearch}
          onReset={handleResetSearch}
          designers={designerNames}
          services={availableServices}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Section: Reservation List */}
      <div className="w-full">
        <ReservationTableWidget
          reservations={filteredReservations}
          onEdit={handleReservationEdit}
          onDelete={handleReservationDelete}
          onStatusChange={handleStatusChange}
          selectedDate={selectedDate}
          isStatusUpdateLoading={false}
        />
      </div>
    </div>
  );
};