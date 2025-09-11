# Entities 계층 마이그레이션

Entities 계층은 비즈니스 엔티티(도메인 객체)들을 관리하는 계층입니다. 각 엔티티는 독립적이며, Shared 계층에만 의존할 수 있습니다.

## 엔티티 식별 및 분류

### 주요 비즈니스 엔티티

1. **Reservation (예약)** - 예약 데이터 및 로직
2. **Customer (고객)** - 고객 정보 및 관리
3. **Designer (디자이너)** - 디자이너 정보 및 관리
4. **BusinessHours (영업시간)** - 영업시간 설정 및 관리

## 엔티티별 마이그레이션 계획

### 1. Reservation Entity

#### 타입 정의 분석
현재 `AppointmentForm.tsx`와 `AppContent.tsx`에 산재된 예약 관련 타입들을 통합:

**src/entities/reservation/model/types.ts**:
```typescript
import { BaseEntity, Status } from '~/shared/lib/types';

export interface Reservation extends BaseEntity {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  designerName: string;
  service: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: ReservationStatus;
  notes?: string;
  price: number;
  isConflict?: boolean;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  designerName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  price: number;
}

export interface ReservationConflict {
  reservationId: string;
  conflictType: 'time_overlap' | 'designer_unavailable' | 'double_booking';
  message: string;
}
```

#### API 로직 분리
현재 `AppContent.tsx`에 있는 예약 관련 API 호출을 분리:

**src/entities/reservation/api/reservationApi.ts**:
```typescript
import { apiClient } from '~/shared/api';
import { Reservation, ReservationFormData } from '../model/types';

export const reservationApi = {
  async getReservations(): Promise<Reservation[]> {
    const response = await apiClient.get('/appointments');
    return response.data;
  },

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    const response = await apiClient.get(`/appointments?date=${date}`);
    return response.data;
  },

  async createReservation(data: ReservationFormData): Promise<Reservation> {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },

  async updateReservation(id: string, data: Partial<ReservationFormData>): Promise<Reservation> {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  },

  async deleteReservation(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  async checkConflicts(data: ReservationFormData): Promise<ReservationConflict[]> {
    const response = await apiClient.post('/appointments/check-conflicts', data);
    return response.data;
  },
};
```

#### 비즈니스 로직 (Lib)
예약 관련 유틸리티 함수들:

**src/entities/reservation/lib/reservationUtils.ts**:
```typescript
import { Reservation, ReservationStatus } from '../model/types';

export const reservationUtils = {
  isConflicting(reservation1: Reservation, reservation2: Reservation): boolean {
    if (reservation1.date !== reservation2.date) return false;
    if (reservation1.designerName !== reservation2.designerName) return false;
    
    const start1 = new Date(`${reservation1.date}T${reservation1.time}`);
    const end1 = new Date(start1.getTime() + reservation1.duration * 60000);
    
    const start2 = new Date(`${reservation2.date}T${reservation2.time}`);
    const end2 = new Date(start2.getTime() + reservation2.duration * 60000);
    
    return (start1 < end2) && (start2 < end1);
  },

  getStatusColor(status: ReservationStatus): string {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#10b981', 
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  },

  getStatusLabel(status: ReservationStatus): string {
    const labels = {
      pending: '대기중',
      confirmed: '확정',
      completed: '완료',
      cancelled: '취소'
    };
    return labels[status] || status;
  },

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  },

  calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
};
```

#### Public API 정의

**src/entities/reservation/index.ts**:
```typescript
export * from './model/types';
export * from './api/reservationApi';
export * from './lib/reservationUtils';
```

### 2. Customer Entity

#### 타입 정의
현재 `types/customer.ts`를 기반으로 확장:

**src/entities/customer/model/types.ts**:
```typescript
import { BaseEntity } from '~/shared/lib/types';

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  isVip: boolean;
  lastVisit?: string;
  totalVisits: number;
  preferences?: CustomerPreferences;
}

export interface CustomerPreferences {
  preferredDesigner?: string;
  preferredServices: string[];
  allergies?: string[];
  notes?: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
}

export interface CustomerSearchParams {
  query?: string;
  phone?: string;
  email?: string;
  isVip?: boolean;
  limit?: number;
  offset?: number;
}
```

#### API 로직

**src/entities/customer/api/customerApi.ts**:
```typescript
import { apiClient } from '~/shared/api';
import { Customer, CustomerFormData, CustomerSearchParams } from '../model/types';

export const customerApi = {
  async getCustomers(params?: CustomerSearchParams): Promise<Customer[]> {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const response = await apiClient.get('/customers/search', {
      params: { q: query }
    });
    return response.data;
  },

  async createCustomer(data: CustomerFormData): Promise<Customer> {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async getCustomerReservations(id: string): Promise<Reservation[]> {
    const response = await apiClient.get(`/customers/${id}/reservations`);
    return response.data;
  }
};
```

#### 비즈니스 로직

**src/entities/customer/lib/customerUtils.ts**:
```typescript
import { Customer } from '../model/types';

export const customerUtils = {
  formatPhone(phone: string): string {
    // 010-1234-5678 형식으로 변환
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phone;
  },

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  getCustomerGrade(customer: Customer): 'bronze' | 'silver' | 'gold' | 'vip' {
    if (customer.isVip) return 'vip';
    if (customer.totalVisits >= 20) return 'gold';
    if (customer.totalVisits >= 10) return 'silver';
    return 'bronze';
  },

  validatePhone(phone: string): boolean {
    const phoneRegex = /^01[0-9]-?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
```

### 3. Designer Entity

#### 타입 정의

**src/entities/designer/model/types.ts**:
```typescript
import { BaseEntity } from '~/shared/lib/types';

export interface Designer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  workSchedule: WorkSchedule;
  isActive: boolean;
  hireDate: string;
  rating: number;
  profileImage?: string;
}

export interface WorkSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DesignerFormData {
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  workSchedule: WorkSchedule;
}
```

### 4. BusinessHours Entity

#### 현재 utils를 entity로 변환

**src/entities/business-hours/model/types.ts**:
```typescript
import { BaseEntity } from '~/shared/lib/types';

export interface BusinessHours extends BaseEntity {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakTimes: TimeSlot[];
  isHoliday?: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface SpecialBusinessHours {
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string; // 임시 휴무, 연장 영업 등
}
```

## 마이그레이션 체크리스트

### Reservation Entity
- [ ] 타입 정의 작성 및 마이그레이션
- [ ] API 로직 분리 및 작성
- [ ] 비즈니스 로직(utils) 작성
- [ ] Public API 정의
- [ ] 기존 코드에서 import 테스트

### Customer Entity  
- [ ] 기존 customer.ts 타입 확장
- [ ] API 로직 작성
- [ ] 고객 관련 유틸리티 함수 작성
- [ ] Public API 정의
- [ ] 기존 코드에서 import 테스트

### Designer Entity
- [ ] 디자이너 타입 정의 작성
- [ ] API 로직 작성
- [ ] 디자이너 관련 유틸리티 함수 작성
- [ ] Public API 정의

### BusinessHours Entity
- [ ] 기존 businessHours.ts 확장 및 이동
- [ ] 타입 정의 강화
- [ ] API 로직 작성
- [ ] Public API 정의

## 검증 및 테스트

### 1. 타입 안전성 검증
```bash
# TypeScript 컴파일 확인
npx tsc --noEmit
```

### 2. 엔티티별 독립성 확인
각 엔티티가 다른 엔티티에 의존하지 않는지 확인:

```typescript
// ✅ 올바른 사용 - Shared에만 의존
import { BaseEntity } from '~/shared/lib/types';

// ❌ 잘못된 사용 - 다른 엔티티에 의존
import { Customer } from '~/entities/customer';
```

### 3. API 기능 테스트
각 엔티티의 API 함수들이 정상 작동하는지 테스트:

```typescript
// 예시: Reservation API 테스트
import { reservationApi } from '~/entities/reservation';

// API 호출 테스트
const reservations = await reservationApi.getReservations();
console.log('예약 목록:', reservations);
```

## 주의사항

### 엔티티 독립성 유지
- 각 엔티티는 다른 엔티티에 의존하면 안 됨
- Shared 계층에만 의존 가능
- 순환 참조 방지

### 비즈니스 로직 집중
- 각 엔티티는 해당 도메인의 비즈니스 로직만 포함
- UI 관련 코드는 포함하지 않음

### API vs Lib 구분
- **API**: 외부 서버와의 통신 로직
- **Lib**: 도메인 내부의 비즈니스 로직 및 유틸리티

## 다음 단계

Entities 계층 완료 후 Features 계층에서 이 엔티티들을 활용:

1. **Features 계층** - 엔티티들을 조합한 비즈니스 기능 구현
2. **Widgets 계층** - 기능들을 조합한 복합 UI 블록 구성

---

**다음 단계**: `05-features-layer.md`에서 Features 계층 마이그레이션 진행