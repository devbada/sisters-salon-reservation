import React, { useState, useMemo } from 'react';
import { useReservationStore } from '~/features/reservation-management';
import { ReservationTableRow } from './ReservationTableRow';
import { ReservationTableActions } from './ReservationTableActions';
import type { Reservation } from '~/entities/reservation';

interface ReservationTableWidgetProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation, index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (reservationId: string, newStatus: string, reason?: string, notes?: string) => void;
  selectedDate: string;
  isStatusUpdateLoading?: boolean;
}

export const ReservationTableWidget: React.FC<ReservationTableWidgetProps> = ({
  reservations,
  onEdit,
  onDelete,
  onStatusChange,
  selectedDate,
  isStatusUpdateLoading = false
}) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { conflicts } = useReservationStore();

  // Conflict detection logic
  const conflictMap = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    
    const activeReservations = reservations.filter(reservation => 
      ['pending', 'confirmed'].includes(reservation.status || 'pending')
    );
    
    activeReservations.forEach(reservation => {
      const key = `${reservation.time}-${reservation.stylist}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(reservation);
    });
    
    const conflictsMap = new Map<string, Reservation[]>();
    map.forEach((reservationList, key) => {
      if (reservationList.length > 1) {
        conflictsMap.set(key, reservationList);
      }
    });
    
    return conflictsMap;
  }, [reservations]);

  const getConflictInfo = (reservation: Reservation) => {
    const key = `${reservation.time}-${reservation.stylist}`;
    const conflictingReservations = conflictMap.get(key);
    return conflictingReservations && conflictingReservations.length > 1;
  };

  const handleStatusChangeModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    // Open status modal - implementation would depend on the modal component
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full mx-auto glass-card p-8 reservation-table animate-fadeInUp">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {isToday ? '📅 오늘의 예약 목록' : `📅 ${formattedDate} 예약 목록`}
        </h2>
        <div className="glass-card px-4 py-2 text-gray-800 font-semibold">
          📊 총 {reservations.length}건
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-float">📅</div>
          <div className="glass-card p-8 max-w-md mx-auto">
            <p className="text-gray-700 text-xl font-medium">
              {isToday ? '🌙 오늘 예약이 없습니다.' : '📭 선택한 날짜에 예약이 없습니다.'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              새로운 예약을 추가해보세요!
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full" role="table" aria-label="예약 목록 테이블">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">👤 고객</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">📅 날짜</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">⏰ 시간</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">✂️ 담당자</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">✨ 서비스</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-800" scope="col">📊 상태</th>
                  <th className="py-4 px-6 text-center font-semibold text-gray-800" scope="col">🛠 관리</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation, index) => {
                  const hasConflict = getConflictInfo(reservation);
                  
                  return (
                    <tr 
                      key={reservation.id || index} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors duration-200 ${
                        hasConflict ? 'conflict-table-row flash-conflict' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {reservation.customerName}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(reservation.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-mono">
                        {reservation.time}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <span className="inline-flex items-center">
                          <span className="mr-1">✂️</span>
                          {reservation.stylist}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <span className="inline-flex items-center glass-card px-3 py-1 rounded-full text-sm text-gray-800">
                          <span className="mr-1">✨</span>
                          {reservation.serviceType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleStatusChangeModal(reservation)}
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          <span className="glass-card px-3 py-1 rounded-full text-sm">
                            {reservation.status || 'pending'}
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <ReservationTableActions
                          reservation={reservation}
                          index={index}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onStatusChange={handleStatusChangeModal}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};