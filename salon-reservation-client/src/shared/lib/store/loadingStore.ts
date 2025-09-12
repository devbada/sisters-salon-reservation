import { create } from 'zustand';

interface LoadingState {
  activeRequests: Set<string>;
  isLoading: boolean;
}

interface LoadingActions {
  startLoading: (requestId: string) => void;
  stopLoading: (requestId: string) => void;
  isRequestLoading: (requestId: string) => boolean;
  reset: () => void;
}

type LoadingStore = LoadingState & LoadingActions;

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  activeRequests: new Set<string>(),
  isLoading: false,

  startLoading: (requestId: string) => {
    const { activeRequests } = get();
    const newRequests = new Set(activeRequests);
    newRequests.add(requestId);
    
    set({
      activeRequests: newRequests,
      isLoading: newRequests.size > 0
    });
  },

  stopLoading: (requestId: string) => {
    const { activeRequests } = get();
    const newRequests = new Set(activeRequests);
    newRequests.delete(requestId);
    
    set({
      activeRequests: newRequests,
      isLoading: newRequests.size > 0
    });
  },

  isRequestLoading: (requestId: string) => {
    const { activeRequests } = get();
    return activeRequests.has(requestId);
  },

  reset: () => {
    set({
      activeRequests: new Set<string>(),
      isLoading: false
    });
  },
}));

export const LOADING_KEYS = {
  RESERVATIONS: {
    FETCH: 'reservations-fetch',
    CREATE: 'reservations-create',
    UPDATE: 'reservations-update',
    DELETE: 'reservations-delete',
    STATUS_CHANGE: 'reservations-status-change'
  },
  CUSTOMERS: {
    FETCH: 'customers-fetch',
    CREATE: 'customers-create',
    UPDATE: 'customers-update',
    DELETE: 'customers-delete',
    SEARCH: 'customers-search'
  },
  DESIGNERS: {
    FETCH: 'designers-fetch',
    CREATE: 'designers-create',
    UPDATE: 'designers-update',
    DELETE: 'designers-delete'
  },
  BUSINESS_HOURS: {
    FETCH: 'business-hours-fetch',
    UPDATE: 'business-hours-update',
    SPECIAL_HOURS_CREATE: 'special-hours-create',
    SPECIAL_HOURS_UPDATE: 'special-hours-update',
    SPECIAL_HOURS_DELETE: 'special-hours-delete',
    HOLIDAYS_CREATE: 'holidays-create',
    HOLIDAYS_UPDATE: 'holidays-update',
    HOLIDAYS_DELETE: 'holidays-delete'
  },
  AUTH: {
    LOGIN: 'auth-login',
    LOGOUT: 'auth-logout',
    REFRESH: 'auth-refresh'
  }
} as const;