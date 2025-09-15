# Shared 계층 마이그레이션

Shared 계층은 FSD 아키텍처의 가장 하위 계층으로, 프로젝트 전반에서 재사용 가능한 코드들을 포함합니다. 다른 모든 계층이 의존할 수 있는 기반 코드입니다.

## 마이그레이션 대상 파일 분석

### 현재 공통 코드 현황
```
salon-reservation-client/src/
├── hooks/
│   └── useDebounce.ts          → shared/lib/hooks/
├── services/
│   └── holidayService.ts       → shared/api/
├── types/
│   └── customer.ts             → shared/lib/types/ (일부)
├── utils/
│   └── businessHours.ts        → shared/lib/utils/
├── components/
│   └── StatCard.tsx            → shared/ui/
└── styles/                     → shared/ui/styles/
```

## 단계별 마이그레이션 계획

### 1단계: Shared UI 컴포넌트 마이그레이션

#### StatCard 컴포넌트 마이그레이션

**기존**: `src/components/StatCard.tsx`
**새 위치**: `src/shared/ui/stat-card/StatCard.tsx`

```bash
# 디렉터리 생성
mkdir -p src/shared/ui/stat-card

# 파일 이동 (복사 후 나중에 삭제)
cp src/components/StatCard.tsx src/shared/ui/stat-card/StatCard.tsx
```

**src/shared/ui/stat-card/index.ts** 생성:
```typescript
export { default as StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';
```

#### 공통 스타일 마이그레이션

**src/shared/ui/styles/** 디렉터리 생성 후 공통 CSS 이동:

```bash
mkdir -p src/shared/ui/styles
cp -r src/styles/* src/shared/ui/styles/
```

**src/shared/ui/styles/index.ts** 생성:
```typescript
import './index.css';
import './Calendar.css';
// 기타 스타일 파일들
```

### 2단계: Shared Lib 마이그레이션

#### Hooks 마이그레이션

**기존**: `src/hooks/useDebounce.ts`
**새 위치**: `src/shared/lib/hooks/useDebounce.ts`

```bash
mkdir -p src/shared/lib/hooks
cp src/hooks/useDebounce.ts src/shared/lib/hooks/useDebounce.ts
```

**src/shared/lib/hooks/index.ts** 생성:
```typescript
export { useDebounce } from './useDebounce';
```

#### Utils 마이그레이션

**기존**: `src/utils/businessHours.ts`
**새 위치**: `src/shared/lib/utils/businessHours.ts`

```bash
mkdir -p src/shared/lib/utils
cp src/utils/businessHours.ts src/shared/lib/utils/businessHours.ts
```

**src/shared/lib/utils/index.ts** 생성:
```typescript
export * from './businessHours';
```

#### 공통 타입 정의

**src/shared/lib/types/** 디렉터리에 공통 타입들 정의:

**src/shared/lib/types/common.ts**:
```typescript
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled';
```

**src/shared/lib/types/index.ts**:
```typescript
export * from './common';
```

### 3단계: Shared API 마이그레이션

#### 기본 API 설정

**src/shared/api/base.ts** 생성:
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Holiday Service 마이그레이션

**기존**: `src/services/holidayService.ts`
**새 위치**: `src/shared/api/holiday.ts`

```bash
mkdir -p src/shared/api
cp src/services/holidayService.ts src/shared/api/holiday.ts
```

**holiday.ts 리팩터링**:
```typescript
import { apiClient } from './base';

export interface Holiday {
  date: string;
  name: string;
}

export const holidayApi = {
  async getHolidays(year: number): Promise<Holiday[]> {
    const response = await apiClient.get(`/holidays/${year}`);
    return response.data;
  },
};
```

**src/shared/api/index.ts** 생성:
```typescript
export * from './base';
export * from './holiday';
```

### 4단계: Shared Config 설정

#### 상수 정의

**src/shared/config/constants.ts**:
```typescript
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
```

**src/shared/config/index.ts**:
```typescript
export * from './constants';
```

### 5단계: Public API 정의

#### 메인 Shared Index

**src/shared/index.ts** 생성:
```typescript
// UI Components
export * from './ui';

// Library utilities
export * from './lib';

// API utilities
export * from './api';

// Configuration
export * from './config';
```

**src/shared/ui/index.ts** 업데이트:
```typescript
// Components
export * from './stat-card';

// Styles
export * from './styles';
```

**src/shared/lib/index.ts** 업데이트:
```typescript
export * from './hooks';
export * from './utils';
export * from './types';
```

## 마이그레이션 체크리스트

### UI 컴포넌트
- [ ] StatCard 컴포넌트 마이그레이션
- [ ] 공통 스타일 파일 마이그레이션
- [ ] UI index 파일 생성

### 라이브러리
- [ ] useDebounce hook 마이그레이션
- [ ] businessHours utils 마이그레이션
- [ ] 공통 타입 정의 및 마이그레이션
- [ ] Lib index 파일 생성

### API
- [ ] 기본 API 클라이언트 설정
- [ ] Holiday service 마이그레이션
- [ ] API index 파일 생성

### 설정
- [ ] 상수 정의 및 마이그레이션
- [ ] Config index 파일 생성

### Public API
- [ ] 각 세그먼트별 index 파일 생성
- [ ] Shared 메인 index 파일 생성

## 검증 및 테스트

### 1. Import 경로 업데이트 테스트

마이그레이션 완료 후, 일부 컴포넌트에서 새로운 경로로 import 테스트:

```typescript
// 기존
import { useDebounce } from '../hooks/useDebounce';
import StatCard from './StatCard';

// 새로운 FSD 경로
import { useDebounce } from '~/shared/lib/hooks';
import { StatCard } from '~/shared/ui/stat-card';
```

### 2. 빌드 및 런타임 검증

```bash
# TypeScript 컴파일 검증
npm run type-check

# 애플리케이션 빌드 검증
npm run build

# 개발 서버 실행 검증
npm start
```

### 3. 기능 테스트

- [ ] 통계 대시보드 StatCard 정상 렌더링
- [ ] Debounce hook 정상 작동
- [ ] 영업시간 유틸리티 함수 정상 작동
- [ ] Holiday API 정상 호출

## 주의사항

### 점진적 마이그레이션
- 기존 파일은 즉시 삭제하지 말고 복사본으로 작업
- 각 단계별 검증 후 다음 단계 진행

### 의존성 확인
- Shared 계층은 다른 계층에 의존하면 안 됨
- 순수한 공통 코드만 포함

### TypeScript 경로
- tsconfig.json의 경로 설정 확인
- 절대 경로 import 적극 활용

## 다음 단계

Shared 계층 마이그레이션 완료 후:

1. **Entities 계층** - 비즈니스 엔티티 분리
2. **Features 계층** - 비즈니스 기능 모듈화

---

**다음 단계**: `04-entities-layer.md`에서 Entities 계층 마이그레이션 진행