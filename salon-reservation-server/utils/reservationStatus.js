const crypto = require('crypto');

// UUID 생성 함수
function generateId() {
  return crypto.randomUUID();
}

// 예약 상태 상수
const RESERVATION_STATUS = {
  PENDING: 'pending',     // 대기
  CONFIRMED: 'confirmed', // 확정
  COMPLETED: 'completed', // 완료
  CANCELLED: 'cancelled', // 취소
  NO_SHOW: 'no_show'     // 노쇼
};

// 상태별 한국어 이름
const STATUS_NAMES = {
  [RESERVATION_STATUS.PENDING]: '대기',
  [RESERVATION_STATUS.CONFIRMED]: '확정',
  [RESERVATION_STATUS.COMPLETED]: '완료',
  [RESERVATION_STATUS.CANCELLED]: '취소',
  [RESERVATION_STATUS.NO_SHOW]: '노쇼'
};

// 상태별 색상 (프론트엔드용)
const STATUS_COLORS = {
  [RESERVATION_STATUS.PENDING]: 'yellow',
  [RESERVATION_STATUS.CONFIRMED]: 'blue',
  [RESERVATION_STATUS.COMPLETED]: 'green',
  [RESERVATION_STATUS.CANCELLED]: 'red',
  [RESERVATION_STATUS.NO_SHOW]: 'gray'
};

// 유효한 상태 목록
const VALID_STATUSES = Object.values(RESERVATION_STATUS);

// 상태 변경 가능성 검증 매트릭스
const STATUS_TRANSITIONS = {
  [RESERVATION_STATUS.PENDING]: [
    RESERVATION_STATUS.CONFIRMED,
    RESERVATION_STATUS.CANCELLED
  ],
  [RESERVATION_STATUS.CONFIRMED]: [
    RESERVATION_STATUS.COMPLETED,
    RESERVATION_STATUS.CANCELLED,
    RESERVATION_STATUS.NO_SHOW
  ],
  [RESERVATION_STATUS.COMPLETED]: [],  // 완료된 예약은 변경 불가
  [RESERVATION_STATUS.CANCELLED]: [    // 취소된 예약은 다시 확정 가능
    RESERVATION_STATUS.CONFIRMED
  ],  
  [RESERVATION_STATUS.NO_SHOW]: []     // 노쇼된 예약은 변경 불가
};

/**
 * 상태 변경 가능성 검증
 * @param {string} currentStatus 현재 상태
 * @param {string} newStatus 새로운 상태
 * @returns {boolean} 변경 가능 여부
 */
function validateStatusTransition(currentStatus, newStatus) {
  // 같은 상태로의 변경은 허용하지 않음
  if (currentStatus === newStatus) {
    return false;
  }
  
  // 유효하지 않은 상태는 거부
  if (!VALID_STATUSES.includes(currentStatus) || !VALID_STATUSES.includes(newStatus)) {
    return false;
  }
  
  // 현재 상태에서 허용된 변경인지 확인
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * 상태가 유효한지 검증
 * @param {string} status 검증할 상태
 * @returns {boolean} 유효 여부
 */
function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

/**
 * 상태의 한국어 이름 반환
 * @param {string} status 상태
 * @returns {string} 한국어 이름
 */
function getStatusName(status) {
  return STATUS_NAMES[status] || status;
}

/**
 * 상태의 색상 반환
 * @param {string} status 상태
 * @returns {string} 색상
 */
function getStatusColor(status) {
  return STATUS_COLORS[status] || 'gray';
}

/**
 * 현재 상태에서 변경 가능한 상태 목록 반환
 * @param {string} currentStatus 현재 상태
 * @returns {Array<string>} 변경 가능한 상태 목록
 */
function getAvailableTransitions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * 예약 상태 변경 시 필요한 이유 검증
 * @param {string} newStatus 새로운 상태
 * @returns {boolean} 이유가 필요한지 여부
 */
function requiresReason(newStatus) {
  return newStatus === RESERVATION_STATUS.CANCELLED || newStatus === RESERVATION_STATUS.NO_SHOW;
}

module.exports = {
  generateId,
  RESERVATION_STATUS,
  STATUS_NAMES,
  STATUS_COLORS,
  VALID_STATUSES,
  validateStatusTransition,
  isValidStatus,
  getStatusName,
  getStatusColor,
  getAvailableTransitions,
  requiresReason
};