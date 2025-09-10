import React, { useState } from 'react';
import { ConflictInfo } from './AppointmentForm';

interface ConflictBadgeProps {
  conflictCount: number;
  conflictInfo?: ConflictInfo;
  customerNames?: string[];
  reservationIds?: string[];
  showModal?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'warning' | 'danger';
}

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictInfo?: ConflictInfo;
  customerNames?: string[];
}

// 중복 예약 상세 정보 모달
const ConflictModal: React.FC<ConflictModalProps> = ({ 
  isOpen, 
  onClose, 
  conflictInfo,
  customerNames = []
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full mx-4 p-6 animate-fadeInScale">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            ⚠️ 중복 예약 상세 정보
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {conflictInfo && (
          <div className="space-y-4">
            <div className="glass-card p-4 bg-orange-50/20">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">날짜:</span>
                  <p className="text-gray-800">{conflictInfo.date}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">시간:</span>
                  <p className="text-gray-800">{conflictInfo.time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">디자이너:</span>
                  <p className="text-gray-800">{conflictInfo.stylist}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">중복 수:</span>
                  <p className="text-orange-600 font-bold">{conflictInfo.conflictCount}건</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">중복된 예약 고객:</h4>
              <div className="space-y-2">
                {customerNames.length > 0 ? (
                  customerNames.map((name, index) => (
                    <div key={index} className="glass-card p-3 bg-red-50/20">
                      <span className="font-medium text-gray-800">👤 {name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">고객 정보를 불러올 수 없습니다.</p>
                )}
              </div>
            </div>

            <div className="glass-card p-4 bg-blue-50/20">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 text-lg">💡</span>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">관리자 안내:</p>
                  <p>동일한 디자이너의 같은 시간대에 여러 예약이 있습니다. 일정을 조정하거나 고객에게 연락하여 시간 변경을 안내해주세요.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-card hover:bg-white/30 transition-all duration-200 text-gray-700 font-medium rounded-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

// 메인 ConflictBadge 컴포넌트
const ConflictBadge: React.FC<ConflictBadgeProps> = ({
  conflictCount,
  conflictInfo,
  customerNames = [],
  reservationIds = [],
  showModal = true,
  size = 'medium',
  variant = 'warning'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!conflictCount || conflictCount <= 1) {
    return null;
  }

  // 크기별 스타일
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-xs',
    medium: 'px-2 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm'
  };

  // 변형별 스타일
  const variantClasses = {
    warning: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white border-orange-300',
    danger: 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300'
  };

  const handleClick = () => {
    if (showModal) {
      setIsModalOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        className={`
          inline-flex items-center space-x-1 rounded-full font-bold border-2 
          ${sizeClasses[size]} ${variantClasses[variant]}
          ${showModal ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}
          transition-all duration-200 animate-pulse-slow
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={showModal ? 0 : -1}
        role={showModal ? 'button' : 'status'}
        aria-label={`중복 예약 ${conflictCount}건${showModal ? ', 클릭하여 상세 정보 확인' : ''}`}
        title={`⚠️ 중복 예약 ${conflictCount}건${showModal ? '\n클릭하여 상세 정보를 확인하세요.' : ''}`}
      >
        <span className="text-white">⚠️</span>
        <span>{conflictCount}</span>
        {showModal && size !== 'small' && (
          <span className="text-white/80">👥</span>
        )}
      </div>

      {/* 중복 예약 상세 정보 모달 */}
      <ConflictModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conflictInfo={conflictInfo}
        customerNames={customerNames}
      />
    </>
  );
};

export default ConflictBadge;