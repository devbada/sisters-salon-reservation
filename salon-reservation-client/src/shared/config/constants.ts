export const APP_CONFIG = {
  API_TIMEOUT: 10000,
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const BUSINESS_HOURS = {
  DEFAULT_START: '09:00',
  DEFAULT_END: '18:00',
  SLOT_DURATION: 30, // minutes
} as const;