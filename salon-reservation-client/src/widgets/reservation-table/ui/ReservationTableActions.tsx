import React from 'react';
import type { Reservation } from '~/entities/reservation';

interface ReservationTableActionsProps {
  reservation: Reservation;
  index: number;
  onEdit: (reservation: Reservation, index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (reservation: Reservation) => void;
}

export const ReservationTableActions: React.FC<ReservationTableActionsProps> = ({
  reservation,
  index,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="flex justify-center space-x-3">
      <button
        onClick={() => onStatusChange(reservation)}
        className="glass-card px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors duration-200 font-medium hover:scale-105"
        title="상태 변경"
      >
        📊 상태
      </button>
      <button
        onClick={() => onEdit(reservation, index)}
        className="glass-card px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium hover:scale-105"
        title="예약 수정"
      >
        ✏️ 수정
      </button>
      <button
        onClick={() => onDelete(index)}
        className="glass-card px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium hover:scale-105"
        title="예약 삭제"
      >
        🗑️ 삭제
      </button>
    </div>
  );
};