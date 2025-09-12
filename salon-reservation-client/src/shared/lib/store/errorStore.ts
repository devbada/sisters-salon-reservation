import { create } from 'zustand';

export interface ErrorInfo {
  id: string;
  message: string;
  code?: string;
  context?: string;
  timestamp: Date;
  isRecoverable: boolean;
}

interface ErrorState {
  errors: ErrorInfo[];
  criticalError: ErrorInfo | null;
}

interface ErrorActions {
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  setCriticalError: (error: ErrorInfo | null) => void;
  clearErrors: () => void;
}

type ErrorStore = ErrorState & ErrorActions;

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errors: [],
  criticalError: null,

  addError: (error) => {
    const errorInfo: ErrorInfo = {
      ...error,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => ({
      errors: [...state.errors, errorInfo],
      criticalError: !error.isRecoverable ? errorInfo : state.criticalError,
    }));

    console.error('Application Error:', errorInfo);
  },

  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter(error => error.id !== id),
      criticalError: state.criticalError?.id === id ? null : state.criticalError,
    }));
  },

  setCriticalError: (error) => {
    set({ criticalError: error });
  },

  clearErrors: () => {
    set({ errors: [], criticalError: null });
  },
}));

export const logError = (message: string, context?: string, code?: string, isRecoverable = true) => {
  const { addError } = useErrorStore.getState();
  addError({
    message,
    code,
    context,
    isRecoverable,
  });
};