# 현재 구조 분석 및 FSD 매핑

## 현재 프로젝트 구조
```
salon-reservation-client/src/
├── components/           # 23개 컴포넌트 (평면적 구조)
├── contexts/            # AuthContext
├── hooks/               # useDebounce
├── services/           # holidayService
├── styles/             # CSS 파일들
├── types/              # customer.ts
├── utils/              # businessHours.ts
├── mocks/              # 모킹 데이터
├── App.tsx
├── AppContent.tsx      # 메인 애플리케이션 로직
└── index.tsx
```

## 컴포넌트 분석 및 FSD 매핑

### 현재 컴포넌트 목록 → FSD 계층 매핑

#### App 계층 (app/)
- `App.tsx` → `app/App.tsx`
- `AppContent.tsx` → `app/AppContent.tsx` (라우팅 및 전역 상태)
- `AppWrapper.tsx` → `app/providers/AuthProvider.tsx`
- `ProtectedRoute.tsx` → `app/providers/ProtectedRoute.tsx`

#### Pages 계층 (pages/)
현재는 탭 기반이지만 향후 라우팅으로 분리 예정:
- 예약 관리 페이지 → `pages/reservations/`
- 고객 관리 페이지 → `pages/customers/`
- 디자이너 관리 페이지 → `pages/designers/`
- 영업시간 관리 페이지 → `pages/business-hours/`
- 통계 페이지 → `pages/statistics/`

#### Widgets 계층 (widgets/)
독립적인 UI 블록들:
- `Header.tsx` → `widgets/header/`
- `StatisticsDashboard.tsx` → `widgets/statistics-dashboard/`
- `Calendar.tsx` → `widgets/calendar/`
- `ReservationTable.tsx` → `widgets/reservation-table/`
- `CustomerList.tsx` → `widgets/customer-list/`
- `DesignerTable.tsx` → `widgets/designer-table/`

#### Features 계층 (features/)
비즈니스 기능별 그룹화:

**예약 관리 (reservation-management)**
- `AppointmentForm.tsx` → `features/reservation-management/ui/AppointmentForm.tsx`
- `ReservationStatusModal.tsx` → `features/reservation-management/ui/ReservationStatusModal.tsx`
- `ReservationStatusBadge.tsx` → `features/reservation-management/ui/ReservationStatusBadge.tsx`
- `ConflictBadge.tsx` → `features/reservation-management/ui/ConflictBadge.tsx`
- `SearchFilter.tsx` → `features/reservation-management/ui/SearchFilter.tsx`

**고객 관리 (customer-management)**
- `CustomerManagement.tsx` → `features/customer-management/ui/CustomerManagement.tsx`
- `CustomerForm.tsx` → `features/customer-management/ui/CustomerForm.tsx`
- `CustomerProfile.tsx` → `features/customer-management/ui/CustomerProfile.tsx`
- `CustomerSearchInput.tsx` → `features/customer-management/ui/CustomerSearchInput.tsx`

**디자이너 관리 (designer-management)**
- `DesignerManagement.tsx` → `features/designer-management/ui/DesignerManagement.tsx`
- `DesignerForm.tsx` → `features/designer-management/ui/DesignerForm.tsx`

**영업시간 관리 (business-hours)**
- `BusinessHours.tsx` → `features/business-hours/ui/BusinessHours.tsx`

**인증 (authentication)**
- `LoginForm.tsx` → `features/authentication/ui/LoginForm.tsx`
- `AdminRegister.tsx` → `features/authentication/ui/AdminRegister.tsx`

#### Entities 계층 (entities/)
비즈니스 엔티티별:

**예약 (reservation)**
- 타입 정의, API 호출, 비즈니스 로직

**고객 (customer)**
- `types/customer.ts` → `entities/customer/model/types.ts`
- 고객 관련 API 호출 로직

**디자이너 (designer)**
- 디자이너 관련 타입 및 로직

**영업시간 (business-hours)**
- `utils/businessHours.ts` → `entities/business-hours/lib/utils.ts`

#### Shared 계층 (shared/)

**UI 컴포넌트 (shared/ui/)**
- `StatCard.tsx` → `shared/ui/stat-card/`

**유틸리티 (shared/lib/)**
- `hooks/useDebounce.ts` → `shared/lib/hooks/useDebounce.ts`

**API (shared/api/)**
- 공통 axios 설정
- `services/holidayService.ts` → `shared/api/holiday.ts`

**설정 (shared/config/)**
- 환경 변수, 상수 등

## 의존성 분석

### 현재 의존성 문제점
1. **순환 참조**: 일부 컴포넌트 간 순환 의존성 존재
2. **강결합**: 컴포넌트 간 직접적인 의존성
3. **혼재된 책임**: UI와 비즈니스 로직이 한 파일에 혼재

### FSD 적용 후 예상 의존성
```
app (전역 상태, 라우팅)
  ↓
pages (페이지별 조합)
  ↓  
widgets (복합 UI 블록)
  ↓
features (비즈니스 기능)
  ↓
entities (비즈니스 엔티티)
  ↓
shared (공통 코드)
```

## 마이그레이션 우선순위

### Phase 1: 기반 작업
1. FSD 폴더 구조 생성
2. Shared 계층 마이그레이션
3. 공통 타입 및 유틸리티 이동

### Phase 2: 엔티티 분리
1. 예약 엔티티
2. 고객 엔티티  
3. 디자이너 엔티티
4. 영업시간 엔티티

### Phase 3: 기능 모듈화
1. 인증 기능
2. 예약 관리 기능
3. 고객 관리 기능
4. 디자이너 관리 기능
5. 영업시간 관리 기능

### Phase 4: 위젯 및 페이지
1. 위젯 컴포넌트 분리
2. 페이지 컴포넌트 구성
3. 라우팅 설정

### Phase 5: 앱 계층 및 정리
1. 앱 초기화 로직 정리
2. 기존 구조 제거
3. 테스트 및 검증

## 주의사항

### 기존 기능 보존
- 모든 마이그레이션 단계에서 기존 기능이 정상 작동해야 함
- 테스트를 통한 검증 필수

### 점진적 마이그레이션
- 한 번에 모든 구조를 변경하지 않음
- 각 단계별로 검증 후 다음 단계 진행

### 의존성 규칙 준수
- FSD 의존성 규칙을 엄격히 준수
- 순환 참조 방지

---

**다음 단계**: `02-setup.md`에서 기본 폴더 구조 설정