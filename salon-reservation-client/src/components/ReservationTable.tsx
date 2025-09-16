import React, { useState, useMemo } from 'react';
import { AppointmentData } from './AppointmentForm';
import ReservationStatusBadge, { ReservationStatus } from './ReservationStatusBadge';
import ReservationStatusModal from './ReservationStatusModal';
import ConflictBadge from './ConflictBadge';

interface ReservationTableProps {
  reservations: AppointmentData[];
  onEdit: (reservation: AppointmentData, index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (reservationId: string, newStatus: ReservationStatus, reason?: string, notes?: string) => void;
  selectedDate: string;
  isStatusUpdateLoading?: boolean;
}

const ReservationTable: React.FC<ReservationTableProps> = ({ 
  reservations, 
  onEdit, 
  onDelete,
  onStatusChange,
  selectedDate,
  isStatusUpdateLoading = false
}) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<AppointmentData | null>(null);
  
  // 중복 예약 감지 로직
  const conflictMap = useMemo(() => {
    const map = new Map<string, AppointmentData[]>();
    
    // 유효한 예약만 필터링 (pending, confirmed 상태)
    const activeReservations = reservations.filter(reservation => 
      ['pending', 'confirmed'].includes(reservation.status || 'pending')
    );
    
    // 시간대+디자이너별로 그룹화
    activeReservations.forEach(reservation => {
      const key = `${reservation.time}-${reservation.stylist}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(reservation);
    });
    
    // 중복이 있는 것만 반환
    const conflicts = new Map<string, AppointmentData[]>();
    map.forEach((reservationList, key) => {
      if (reservationList.length > 1) {
        conflicts.set(key, reservationList);
      }
    });
    
    return conflicts;
  }, [reservations]);

  // 특정 예약의 중복 정보 가져오기
  const getConflictInfo = (reservation: AppointmentData) => {
    const key = `${reservation.time}-${reservation.stylist}`;
    const conflictingReservations = conflictMap.get(key);
    
    if (!conflictingReservations || conflictingReservations.length <= 1) {
      return null;
    }
    
    return {
      conflictCount: conflictingReservations.length,
      customerNames: conflictingReservations.map(r => r.customerName),
      reservationIds: conflictingReservations.map(r => r._id || ''),
      conflictInfo: {
        date: reservation.date,
        time: reservation.time,
        stylist: reservation.stylist,
        conflictCount: conflictingReservations.length,
        reservationIds: conflictingReservations.map(r => r._id || ''),
        customerNames: conflictingReservations.map(r => r.customerName)
      }
    };
  };

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      'Haircut': '💇‍♀️',
      'Coloring': '🎨', 
      'Styling': '💫',
      'Treatment': '🧴'
    };
    return icons[serviceType as keyof typeof icons] || '✨';
  };

  const getStylistIcon = (stylist: string) => {
    const icons = {
      'John': '👨‍🎨',
      'Sarah': '👩‍🦰',
      'Michael': '👨‍🦱',
      'Emma': '👩‍🦳'
    };
    return icons[stylist as keyof typeof icons] || '✂️';
  };

  const handleStatusChange = (reservation: AppointmentData) => {
    setSelectedReservation(reservation);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (reservationId: string, newStatus: ReservationStatus, reason?: string, notes?: string) => {
    onStatusChange(reservationId, newStatus, reason, notes);
    setStatusModalOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="w-full mx-auto glass-card p-8 reservation-table animate-fadeInUp">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {selectedDate === new Date().toISOString().split('T')[0] 
            ? '📅 오늘의 예약 목록' 
            : `📅 ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
              })} 예약 목록`}
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
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? '🌙 오늘 예약이 없습니다.' 
                : '📭 선택한 날짜에 예약이 없습니다.'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              새로운 예약을 추가해보세요!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
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
                      const conflictInfo = getConflictInfo(reservation);
                      const hasConflict = conflictInfo !== null;
                      
                      return (
                        <tr 
                          key={reservation._id || index} 
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
                            <span className="mr-1">{getStylistIcon(reservation.stylist)}</span>
                            {reservation.stylist}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          <span className="inline-flex items-center glass-card px-3 py-1 rounded-full text-sm text-gray-800">
                            <span className="mr-1">{getServiceIcon(reservation.serviceType)}</span>
                            {reservation.serviceType === 'Haircut' ? '헤어컷' :
                             reservation.serviceType === 'Coloring' ? '염색' :
                             reservation.serviceType === 'Styling' ? '스타일링' :
                             reservation.serviceType === 'Treatment' ? '트리트먼트' :
                             reservation.serviceType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <ReservationStatusBadge 
                              status={reservation.status || 'pending'} 
                              notes={reservation.notes}
                              statusUpdatedAt={reservation.status_updated_at}
                              statusUpdatedBy={reservation.status_updated_by}
                            />
                            {hasConflict && conflictInfo && (
                              <ConflictBadge
                                conflictCount={conflictInfo.conflictCount}
                                conflictInfo={conflictInfo.conflictInfo}
                                customerNames={conflictInfo.customerNames}
                                reservationIds={conflictInfo.reservationIds}
                                size="small"
                                variant="warning"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleStatusChange(reservation)}
                              className="glass-button px-3 py-2 text-blue-600 font-medium text-sm rounded-lg hover:scale-105 transition-all duration-200"
                              aria-label={`${reservation.customerName} 예약 상태 변경`}
                            >
                              📊 상태
                            </button>
                            <button
                              onClick={() => onEdit(reservation, index)}
                              className="glass-button px-3 py-2 text-gray-800 font-medium text-sm rounded-lg hover:scale-105 transition-all duration-200"
                              aria-label={`${reservation.customerName} 예약 수정`}
                            >
                              ✏️ 수정
                            </button>
                            <button
                              onClick={() => onDelete(index)}
                              className="glass-button px-3 py-2 text-red-300 font-medium text-sm rounded-lg hover:scale-105 hover:bg-red-500/20 transition-all duration-200"
                              aria-label={`${reservation.customerName} 예약 삭제`}
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                        </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {reservations.map((reservation, index) => {
              const conflictInfo = getConflictInfo(reservation);
              const hasConflict = conflictInfo !== null;
              
              return (
                <div 
                  key={reservation._id || index}
                  className={`glass-card p-6 hover:scale-[1.02] transition-all duration-300 ${
                    hasConflict ? 'conflict-reservation flash-conflict' : ''
                  }`}
                >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    <span className="mr-2">👤</span>{reservation.customerName}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(reservation)}
                      className="glass-button px-3 py-1 text-blue-600 text-sm rounded-lg hover:scale-105"
                      aria-label={`${reservation.customerName} 예약 상태 변경`}
                    >
                      📊
                    </button>
                    <button
                      onClick={() => onEdit(reservation, index)}
                      className="glass-button px-3 py-1 text-gray-800 text-sm rounded-lg hover:scale-105"
                      aria-label={`${reservation.customerName} 예약 수정`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="glass-button px-3 py-1 text-red-300 text-sm rounded-lg hover:scale-105 hover:bg-red-500/20"
                      aria-label={`${reservation.customerName} 예약 삭제`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">📅</span>
                      {new Date(reservation.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-gray-700 font-mono">
                      <span className="mr-2">⏰</span>
                      {reservation.time}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">{getStylistIcon(reservation.stylist)}</span>
                      {reservation.stylist}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="glass-card px-2 py-1 rounded-full text-xs text-gray-800">
                        <span className="mr-1">{getServiceIcon(reservation.serviceType)}</span>
                        {reservation.serviceType === 'Haircut' ? '헤어컷' :
                         reservation.serviceType === 'Coloring' ? '염색' :
                         reservation.serviceType === 'Styling' ? '스타일링' :
                         reservation.serviceType === 'Treatment' ? '트리트먼트' :
                         reservation.serviceType}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ReservationStatusBadge 
                        status={reservation.status || 'pending'} 
                        notes={reservation.notes}
                        statusUpdatedAt={reservation.status_updated_at}
                        statusUpdatedBy={reservation.status_updated_by}
                      />
                      {hasConflict && conflictInfo && (
                        <ConflictBadge
                          conflictCount={conflictInfo.conflictCount}
                          conflictInfo={conflictInfo.conflictInfo}
                          customerNames={conflictInfo.customerNames}
                          reservationIds={conflictInfo.reservationIds}
                          size="medium"
                          variant="warning"
                        />
                      )}
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Status Change Modal */}
      {selectedReservation && (
        <ReservationStatusModal
          reservation={selectedReservation}
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setSelectedReservation(null);
          }}
          onStatusChange={handleStatusUpdate}
          isLoading={isStatusUpdateLoading}
        />
      )}
    </div>
  );
};

export default React.memo(ReservationTable);