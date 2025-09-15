# Features 계층 마이그레이션

Features 계층은 사용자 관점에서의 비즈니스 기능들을 구현하는 계층입니다. Entities와 Shared 계층을 활용하여 완전한 기능을 제공합니다.

## Features 식별 및 분류

### 주요 Features 목록

1. **Authentication** - 로그인, 회원가입, 인증 관리
2. **Reservation Management** - 예약 생성, 수정, 삭제, 상태 관리
3. **Customer Management** - 고객 정보 관리, 검색
4. **Designer Management** - 디자이너 정보 관리
5. **Business Hours** - 영업시간 설정 및 관리

## Feature별 마이그레이션 계획

### 1. Authentication Feature

#### UI 컴포넌트 마이그레이션

**기존 파일들**:
- `components/LoginForm.tsx`
- `components/AdminRegister.tsx`  
- `contexts/AuthContext.tsx`

**새로운 구조**:
```
features/authentication/
├── ui/
│   ├── LoginForm.tsx
│   ├── AdminRegister.tsx
│   └── index.ts
├── model/
│   ├── authStore.ts
│   ├── types.ts
│   └── index.ts
├── api/
│   ├── authApi.ts
│   └── index.ts
└── index.ts
```

#### 타입 정의

**src/features/authentication/model/types.ts**:
```typescript
import { BaseEntity } from '~/shared/lib/types';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'staff' | 'designer';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### API 로직

**src/features/authentication/api/authApi.ts**:
```typescript
import { apiClient } from '~/shared/api';
import { User, LoginCredentials, RegisterData } from '../model/types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
};
```

#### 상태 관리 (Model)

**src/features/authentication/model/authStore.ts**:
```typescript
import { create } from 'zustand';
import { AuthState, User } from './types';

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    set({ token });
  },

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));
```

#### UI 컴포넌트 리팩터링

**src/features/authentication/ui/LoginForm.tsx** (기존 컴포넌트 개선):
```typescript
import React from 'react';
import { useAuthStore } from '../model/authStore';
import { authApi } from '../api/authApi';
import { LoginCredentials } from '../model/types';

export const LoginForm: React.FC = () => {
  const { setUser, setToken, setLoading, setError, isLoading } = useAuthStore();

  const handleSubmit = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, token } = await authApi.login(credentials);
      
      setUser(user);
      setToken(token);
    } catch (error) {
      setError('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 나머지 컴포넌트 로직...
};
```

### 2. Reservation Management Feature

#### 구조 설계
```
features/reservation-management/
├── ui/
│   ├── AppointmentForm.tsx
│   ├── ReservationStatusModal.tsx
│   ├── ReservationStatusBadge.tsx
│   ├── ConflictBadge.tsx
│   ├── SearchFilter.tsx
│   └── index.ts
├── model/
│   ├── reservationStore.ts
│   ├── useReservations.ts
│   └── index.ts
├── lib/
│   ├── reservationValidation.ts
│   └── index.ts
└── index.ts
```

#### 상태 관리

**src/features/reservation-management/model/reservationStore.ts**:
```typescript
import { create } from 'zustand';
import { Reservation } from '~/entities/reservation';

interface ReservationState {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

interface ReservationActions {
  setReservations: (reservations: Reservation[]) => void;
  setFilteredReservations: (reservations: Reservation[]) => void;
  setSelectedDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
}

export const useReservationStore = create<ReservationState & ReservationActions>((set, get) => ({
  reservations: [],
  filteredReservations: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),
  
  setFilteredReservations: (filteredReservations) => set({ filteredReservations }),
  
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  addReservation: (reservation) => {
    const { reservations } = get();
    set({ reservations: [...reservations, reservation] });
  },
  
  updateReservation: (id, updatedData) => {
    const { reservations } = get();
    const updated = reservations.map(r => 
      r.id === id ? { ...r, ...updatedData } : r
    );
    set({ reservations: updated });
  },
  
  removeReservation: (id) => {
    const { reservations } = get();
    set({ reservations: reservations.filter(r => r.id !== id) });
  },
}));
```

#### 커스텀 훅

**src/features/reservation-management/model/useReservations.ts**:
```typescript
import { useEffect } from 'react';
import { reservationApi } from '~/entities/reservation';
import { useReservationStore } from './reservationStore';

export const useReservations = (date?: string) => {
  const {
    reservations,
    filteredReservations,
    selectedDate,
    isLoading,
    error,
    setReservations,
    setLoading,
    setError
  } = useReservationStore();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = date 
          ? await reservationApi.getReservationsByDate(date)
          : await reservationApi.getReservations();
          
        setReservations(data);
      } catch (error) {
        setError('예약 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [date, selectedDate]);

  const createReservation = async (data: ReservationFormData) => {
    try {
      setLoading(true);
      const newReservation = await reservationApi.createReservation(data);
      useReservationStore.getState().addReservation(newReservation);
      return newReservation;
    } catch (error) {
      setError('예약 생성에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      const updated = await reservationApi.updateReservationStatus(id, status);
      useReservationStore.getState().updateReservation(id, updated);
      return updated;
    } catch (error) {
      setError('예약 상태 변경에 실패했습니다.');
      throw error;
    }
  };

  return {
    reservations,
    filteredReservations,
    isLoading,
    error,
    createReservation,
    updateReservationStatus,
  };
};
```

### 3. Customer Management Feature

#### 구조 설계
```
features/customer-management/
├── ui/
│   ├── CustomerForm.tsx
│   ├── CustomerProfile.tsx
│   ├── CustomerSearchInput.tsx
│   └── index.ts
├── model/
│   ├── customerStore.ts
│   ├── useCustomers.ts
│   └── index.ts
└── index.ts
```

#### 상태 관리 및 훅

**src/features/customer-management/model/useCustomers.ts**:
```typescript
import { useState, useEffect } from 'react';
import { Customer, customerApi } from '~/entities/customer';
import { useDebounce } from '~/shared/lib/hooks';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!debouncedSearchQuery) {
        setCustomers([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const results = await customerApi.searchCustomers(debouncedSearchQuery);
        setCustomers(results);
      } catch (error) {
        setError('고객 검색에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    searchCustomers();
  }, [debouncedSearchQuery]);

  return {
    customers,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
  };
};
```

### 4. Designer Management Feature

#### 구조 설계
```
features/designer-management/
├── ui/
│   ├── DesignerForm.tsx
│   ├── DesignerSchedule.tsx
│   └── index.ts
├── model/
│   ├── designerStore.ts
│   ├── useDesigners.ts
│   └── index.ts
└── index.ts
```

### 5. Business Hours Feature

#### 기존 컴포넌트 마이그레이션
```
features/business-hours/
├── ui/
│   ├── BusinessHoursForm.tsx
│   ├── SpecialHoursModal.tsx
│   └── index.ts
├── model/
│   ├── businessHoursStore.ts
│   ├── useBusinessHours.ts
│   └── index.ts
└── index.ts
```

## Feature별 Public API 정의

### 각 Feature의 index.ts 파일

**src/features/authentication/index.ts**:
```typescript
// UI Components
export { LoginForm } from './ui/LoginForm';
export { AdminRegister } from './ui/AdminRegister';

// Hooks
export { useAuthStore } from './model/authStore';

// Types
export type { User, AuthState, LoginCredentials, RegisterData } from './model/types';
```

**src/features/reservation-management/index.ts**:
```typescript
// UI Components
export { AppointmentForm } from './ui/AppointmentForm';
export { ReservationStatusModal } from './ui/ReservationStatusModal';
export { ConflictBadge } from './ui/ConflictBadge';

// Hooks
export { useReservations } from './model/useReservations';
export { useReservationStore } from './model/reservationStore';
```

## 마이그레이션 체크리스트

### Authentication Feature
- [ ] LoginForm 컴포넌트 마이그레이션 및 개선
- [ ] AdminRegister 컴포넌트 마이그레이션
- [ ] AuthContext를 Zustand 스토어로 변환
- [ ] API 로직 분리
- [ ] Public API 정의

### Reservation Management Feature
- [ ] AppointmentForm 컴포넌트 마이그레이션
- [ ] ReservationStatusModal 마이그레이션
- [ ] ConflictBadge 마이그레이션
- [ ] 예약 상태 관리 스토어 생성
- [ ] 커스텀 훅 구현
- [ ] Public API 정의

### Customer Management Feature
- [ ] CustomerForm 컴포넌트 마이그레이션
- [ ] CustomerProfile 마이그레이션
- [ ] CustomerSearchInput 마이그레이션
- [ ] 고객 검색 훅 구현
- [ ] Public API 정의

### Designer Management Feature
- [ ] DesignerForm 컴포넌트 마이그레이션
- [ ] 디자이너 관리 훅 구현
- [ ] Public API 정의

### Business Hours Feature
- [ ] BusinessHours 컴포넌트 마이그레이션
- [ ] 영업시간 관리 훅 구현
- [ ] Public API 정의

## 검증 및 테스트

### 1. Feature 독립성 확인
각 Feature가 다른 Feature에 직접 의존하지 않는지 확인:

```typescript
// ✅ 올바른 사용
import { Customer } from '~/entities/customer';
import { useDebounce } from '~/shared/lib/hooks';

// ❌ 잘못된 사용 - 다른 Feature에 직접 의존
import { useAuthStore } from '~/features/authentication';
```

### 2. 상태 관리 테스트
각 Feature의 스토어와 훅이 정상 작동하는지 테스트:

```typescript
// 예시: 예약 관리 기능 테스트
import { useReservations } from '~/features/reservation-management';

// 커스텀 훅 테스트
const { reservations, createReservation } = useReservations();
```

### 3. UI 컴포넌트 독립성 테스트
각 Feature의 UI 컴포넌트가 독립적으로 작동하는지 확인.

## 주의사항

### Feature 간 의존성 관리
- Feature는 다른 Feature에 직접 의존하면 안 됨
- 필요시 Entities 또는 Shared 계층을 통해 데이터 공유

### 상태 관리 일관성
- 각 Feature는 자체 상태 관리를 가짐
- 전역 상태가 필요한 경우 App 계층에서 관리

### 컴포넌트 재사용성
- Feature 내 UI 컴포넌트는 해당 Feature에만 특화
- 재사용 가능한 컴포넌트는 Shared UI로 분리

## 다음 단계

Features 계층 완료 후:

1. **Widgets 계층** - Features를 조합한 복합 UI 블록 구성
2. **Pages 계층** - Widgets을 조합한 전체 페이지 구성

---

**다음 단계**: `06-widgets-layer.md`에서 Widgets 계층 마이그레이션 진행