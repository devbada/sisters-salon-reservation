import React from 'react';
import type { Reservation } from '~/entities/reservation';

interface ReservationTableRowProps {
  reservation: Reservation;
  index: number;
  hasConflict?: boolean;
  onEdit: (reservation: Reservation, index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (reservation: Reservation) => void;
}

export const ReservationTableRow: React.FC<ReservationTableRowProps> = ({
  reservation,
  index,
  hasConflict = false,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
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

  const getServiceDisplayName = (serviceType: string) => {
    const names = {
      'Haircut': '헤어컷',
      'Coloring': '염색',
      'Styling': '스타일링',
      'Treatment': '트리트먼트'
    };
    return names[serviceType as keyof typeof names] || serviceType;
  };

  return (
    <tr 
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
          {getServiceDisplayName(reservation.serviceType)}
        </span>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onStatusChange(reservation)}
          className="hover:scale-105 transition-transform duration-200"
        >
          {/* Status badge will be rendered here */}
        </button>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="flex justify-center space-x-3">
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
      </td>
    </tr>
  );
};