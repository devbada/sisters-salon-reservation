// 예약 충돌 관련 타입 정의

/**
 * 예약 충돌 정보
 */
export interface ReservationConflict {
  /** 충돌 ID */
  id: string;
  
  /** 충돌이 발생한 날짜 (YYYY-MM-DD) */
  date: string;
  
  /** 충돌 유형 */
  conflictType: 'time_overlap' | 'designer_unavailable' | 'double_booking';
  
  /** 충돌하는 예약 ID들 */
  reservations: string[];
  
  /** 충돌 설명 메시지 */
  message: string;
  
  /** 충돌 심각도 */
  severity: 'warning' | 'error';
  
  /** 생성 시간 */
  createdAt?: string;
}

/**
 * 날짜별 충돌 정보 (백업 호환성)
 */
export interface ConflictInfo {
  /** 충돌이 발생한 날짜 (YYYY-MM-DD) */
  date: string;
  
  /** 해당 날짜의 충돌 목록 */
  conflicts: ReservationConflict[];
}

/**
 * 충돌 체크 요청 데이터
 */
export interface ConflictCheckRequest {
  /** 예약 날짜 */
  date: string;
  
  /** 예약 시간 */
  time: string;
  
  /** 디자이너 이름 */
  designerName: string;
  
  /** 서비스 소요 시간 (분) */
  duration: number;
  
  /** 제외할 예약 ID (수정 시) */
  excludeReservationId?: string;
}

/**
 * 충돌 체크 응답 데이터
 */
export interface ConflictCheckResponse {
  /** 충돌 여부 */
  hasConflict: boolean;
  
  /** 충돌 목록 */
  conflicts: ReservationConflict[];
  
  /** 검증 성공 여부 */
  success: boolean;
  
  /** 에러 메시지 (있는 경우) */
  error?: string;
}

/**
 * 충돌 해결 제안
 */
export interface ConflictResolution {
  /** 제안 유형 */
  type: 'reschedule' | 'change_designer' | 'adjust_time';
  
  /** 제안 메시지 */
  message: string;
  
  /** 대안 제안 */
  alternatives: Array<{
    date: string;
    time: string;
    designerName?: string;
  }>;
}