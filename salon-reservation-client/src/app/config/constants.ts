// API 관련 상수
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// 애플리케이션 메타데이터
export const APP_CONFIG = {
  NAME: '헤어 살롱 예약 시스템',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DESCRIPTION: '관리자 대시보드',
  AUTHOR: 'Sisters Salon',
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// 페이지별 설정
export const PAGES = {
  RESERVATIONS: 'reservations',
  CUSTOMERS: 'customers',
  DESIGNERS: 'designers',
  BUSINESS_HOURS: 'business-hours',
  STATISTICS: 'statistics',
} as const;

// 예약 상태
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// 서비스 유형
export const SERVICE_TYPES = {
  HAIRCUT: 'Haircut',
  COLORING: 'Coloring',
  STYLING: 'Styling',
  TREATMENT: 'Treatment',
} as const;

// 요일
export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

// 토스트 메시지 지속 시간
export const TOAST_DURATION = {
  SHORT: 3000,   // 3 seconds
  MEDIUM: 5000,  // 5 seconds
  LONG: 8000,    // 8 seconds
} as const;

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 검증 규칙
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_PATTERN: /^[0-9-+().\s]+$/,
  EMAIL_PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
} as const;

// 날짜/시간 형식
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
  TIME: 'HH:mm',
  DISPLAY_DATE: 'YYYY년 MM월 DD일',
  DISPLAY_DATETIME: 'YYYY년 MM월 DD일 HH:mm',
} as const;

// 환경별 설정
export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// 디버그 설정
export const DEBUG = {
  ENABLE_LOGS: ENV.IS_DEVELOPMENT,
  ENABLE_ERROR_OVERLAY: ENV.IS_DEVELOPMENT,
  ENABLE_REDUX_DEVTOOLS: ENV.IS_DEVELOPMENT,
} as const;