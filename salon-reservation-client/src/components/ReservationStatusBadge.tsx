import React from 'react';

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface ReservationStatusBadgeProps {
  status?: ReservationStatus;
  className?: string;
  notes?: string; // 상태 변경 사유나 메모
  statusUpdatedAt?: string; // 상태 변경 시간
  statusUpdatedBy?: string; // 상태 변경자
}

const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({ 
  status = 'pending', 
  className = '',
  notes,
  statusUpdatedAt,
  statusUpdatedBy
}) => {
  const statusConfig = {
    pending: { 
      label: '대기', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: '⏳' 
    },
    confirmed: { 
      label: '확정', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: '✅' 
    },
    completed: { 
      label: '완료', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: '🎉' 
    },
    cancelled: { 
      label: '취소', 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: '❌' 
    },
    no_show: { 
      label: '노쇼', 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: '👻' 
    }
  };
  
  const config = statusConfig[status];
  
  // tooltip 내용 생성
  const getTooltipContent = () => {
    const parts = [];
    parts.push(`상태: ${config.label}`);
    
    if (statusUpdatedAt) {
      const date = new Date(statusUpdatedAt);
      parts.push(`변경일: ${date.toLocaleString('ko-KR')}`);
    }
    
    if (statusUpdatedBy) {
      parts.push(`변경자: ${statusUpdatedBy}`);
    }
    
    if (notes) {
      parts.push(`메모: ${notes}`);
    }
    
    return parts.join('\n');
  };

  const tooltipContent = getTooltipContent();
  const hasTooltip = statusUpdatedAt || statusUpdatedBy || notes;
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className} ${hasTooltip ? 'cursor-help' : ''}`}
      role="status"
      aria-label={`예약 상태: ${config.label}`}
      title={hasTooltip ? tooltipContent : undefined}
    >
      <span className="mr-1" aria-hidden="true">{config.icon}</span>
      {config.label}
      {hasTooltip && (
        <span className="ml-1 text-xs opacity-70" aria-hidden="true">ℹ️</span>
      )}
    </span>
  );
};

export default ReservationStatusBadge;