import React, { useState } from 'react';
import { AppointmentData } from './AppointmentForm';
import ReservationStatusBadge, { ReservationStatus } from './ReservationStatusBadge';

interface StatusTransition {
  value: ReservationStatus;
  label: string;
  requiresReason: boolean;
}

interface ReservationStatusModalProps {
  reservation: AppointmentData;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (reservationId: string, newStatus: ReservationStatus, reason?: string, notes?: string) => void;
  isLoading?: boolean;
}

const ReservationStatusModal: React.FC<ReservationStatusModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onStatusChange,
  isLoading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus>(reservation.status || 'pending');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const getAvailableTransitions = (currentStatus: ReservationStatus): StatusTransition[] => {
    const transitions: Record<ReservationStatus, StatusTransition[]> = {
      pending: [
        { value: 'confirmed', label: '확정', requiresReason: false },
        { value: 'cancelled', label: '취소', requiresReason: true }
      ],
      confirmed: [
        { value: 'completed', label: '완료', requiresReason: false },
        { value: 'cancelled', label: '취소', requiresReason: true },
        { value: 'no_show', label: '노쇼', requiresReason: true }
      ],
      completed: [],
      cancelled: [
        { value: 'confirmed', label: '확정', requiresReason: false }
      ],
      no_show: []
    };

    return transitions[currentStatus] || [];
  };

  const availableTransitions = getAvailableTransitions(reservation.status || 'pending');
  const selectedTransition = availableTransitions.find(t => t.value === selectedStatus);

  const handleSubmit = () => {
    if (selectedStatus !== reservation.status && reservation._id) {
      onStatusChange(reservation._id, selectedStatus, reason || undefined, notes || undefined);
    }
    onClose();
  };

  const resetForm = () => {
    setSelectedStatus(reservation.status || 'pending');
    setReason('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-6 max-w-lg w-full mx-4 animate-fadeInUp">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            예약 상태 변경
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="모달 닫기"
          >
            ×
          </button>
        </div>
        
        {/* 예약 정보 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">예약 정보</div>
          <div className="font-medium text-gray-800">{reservation.customerName}님</div>
          <div className="text-sm text-gray-600">
            {new Date(reservation.date + 'T00:00:00').toLocaleDateString('ko-KR')} {reservation.time}
          </div>
          <div className="text-sm text-gray-600">{reservation.stylist} - {reservation.serviceType}</div>
        </div>
        
        {/* 현재 상태 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <ReservationStatusBadge 
                status={reservation.status || 'pending'} 
                notes={reservation.notes}
                statusUpdatedAt={reservation.status_updated_at}
                statusUpdatedBy={reservation.status_updated_by}
              />
            </div>
            {reservation.status_updated_at && (
              <div className="text-xs text-gray-600 mt-2">
                <div>변경일: {new Date(reservation.status_updated_at).toLocaleString('ko-KR')}</div>
                {reservation.status_updated_by && (
                  <div>변경자: {reservation.status_updated_by}</div>
                )}
                {reservation.notes && (
                  <div className="mt-1">
                    <span className="font-medium">메모:</span> {reservation.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 변경할 상태 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">변경할 상태</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ReservationStatus)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={availableTransitions.length === 0}
          >
            <option value={reservation.status || 'pending'}>현재 상태 유지</option>
            {availableTransitions.map(transition => (
              <option key={transition.value} value={transition.value}>
                {transition.label}
              </option>
            ))}
          </select>
          {availableTransitions.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              현재 상태에서는 더 이상 변경할 수 없습니다.
            </p>
          )}
        </div>
        
        {/* 변경 사유 (필수일 때만) */}
        {selectedTransition?.requiresReason && selectedStatus !== reservation.status && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              변경 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="상태 변경 사유를 입력하세요..."
              required
            />
          </div>
        )}
        
        {/* 추가 메모 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">추가 메모</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="추가 메모를 입력하세요... (선택사항)"
          />
        </div>
        
        {/* 버튼 */}
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={
              isLoading || 
              selectedStatus === reservation.status || 
              (selectedTransition?.requiresReason && !reason.trim()) ||
              availableTransitions.length === 0
            }
            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '변경 중...' : '상태 변경'}
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationStatusModal;