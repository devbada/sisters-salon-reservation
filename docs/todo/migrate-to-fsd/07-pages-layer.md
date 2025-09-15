# Pages 계층 마이그레이션

Pages 계층은 전체 페이지를 구성하는 최상위 UI 계층입니다. Widgets을 조합하여 완전한 사용자 화면을 제공하며, 향후 라우팅 기반 네비게이션의 기초가 됩니다.

## Pages 식별 및 설계

### 현재 탭 기반 구조에서 페이지 추출

현재 `AppContent.tsx`의 탭 기반 UI를 독립적인 페이지로 분리:

1. **ReservationsPage** - 예약 관리 (기본 페이지)
2. **CustomersPage** - 고객 관리
3. **DesignersPage** - 디자이너 관리  
4. **BusinessHoursPage** - 영업시간 관리
5. **StatisticsPage** - 통계 및 분석

## Page별 마이그레이션 계획

### 1. ReservationsPage (예약 관리 페이지)

#### 구조 설계
```
pages/reservations/
├── ui/
│   ├── ReservationsPage.tsx
│   ├── ReservationCreateModal.tsx
│   ├── ReservationEditModal.tsx
│   └── index.ts
├── model/
│   ├── useReservationsPage.ts
│   └── index.ts
└── index.ts
```

#### 페이지 구현

**src/pages/reservations/ui/ReservationsPage.tsx**:
```typescript
import React, { useState } from 'react';
import { Calendar } from '~/widgets/calendar';
import { ReservationTable } from '~/widgets/reservation-table';
import { AppointmentForm } from '~/features/reservation-management';
import { SearchFilter } from '~/features/reservation-management';
import { useReservations } from '~/features/reservation-management';
import { useReservationsPage } from '../model/useReservationsPage';

export const ReservationsPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingReservation,
    setEditingReservation,
    filteredReservations,
    searchFilters,
    setSearchFilters,
  } = useReservationsPage();

  const {
    reservations,
    isLoading,
    createReservation,
    updateReservationStatus,
    deleteReservation,
  } = useReservations(selectedDate);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          새 예약
        </button>
      </div>

      {/* 검색 및 필터 */}
      <SearchFilter
        filters={searchFilters}
        onChange={setSearchFilters}
      />

      {/* 메인 컨텐츠 - 캘린더와 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-1">
          <Calendar
            reservations={reservations}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* 예약 목록 */}
        <div className="lg:col-span-2">
          <ReservationTable
            reservations={filteredReservations}
            onStatusChange={updateReservationStatus}
            onEdit={setEditingReservation}
            onDelete={deleteReservation}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 모달들 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <AppointmentForm
              onSubmit={async (data) => {
                await createReservation(data);
                setIsCreateModalOpen(false);
              }}
              onCancel={() => setIsCreateModalOpen(false)}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      )}

      {editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <AppointmentForm
              initialData={editingReservation}
              onSubmit={async (data) => {
                await updateReservation(editingReservation.id, data);
                setEditingReservation(null);
              }}
              onCancel={() => setEditingReservation(null)}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 페이지 로직

**src/pages/reservations/model/useReservationsPage.ts**:
```typescript
import { useState, useMemo } from 'react';
import { Reservation } from '~/entities/reservation';

interface SearchFilters {
  customerName?: string;
  designerName?: string;
  status?: string;
  service?: string;
}

export const useReservationsPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const filteredReservations = useMemo(() => {
    // 필터링 로직은 실제로는 useReservations 훅에서 처리
    // 여기서는 예시로 보여줌
    return []; // 실제 구현에서는 필터링된 예약 목록 반환
  }, [searchFilters]);

  return {
    selectedDate,
    setSelectedDate,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingReservation,
    setEditingReservation,
    filteredReservations,
    searchFilters,
    setSearchFilters,
  };
};
```

### 2. CustomersPage (고객 관리 페이지)

#### 구조 설계
```
pages/customers/
├── ui/
│   ├── CustomersPage.tsx
│   ├── CustomerDetailModal.tsx
│   └── index.ts
├── model/
│   ├── useCustomersPage.ts
│   └── index.ts
└── index.ts
```

#### 페이지 구현

**src/pages/customers/ui/CustomersPage.tsx**:
```typescript
import React from 'react';
import { CustomerList } from '~/widgets/customer-list';
import { CustomerForm, CustomerProfile } from '~/features/customer-management';
import { useCustomers } from '~/features/customer-management';
import { useCustomersPage } from '../model/useCustomersPage';

export const CustomersPage: React.FC = () => {
  const {
    selectedCustomer,
    setSelectedCustomer,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingCustomer,
    setEditingCustomer,
  } = useCustomersPage();

  const {
    customers,
    searchQuery,
    setSearchQuery,
    isLoading,
    createCustomer,
    updateCustomer,
  } = useCustomers();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          새 고객 등록
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 고객 목록 */}
        <div className="lg:col-span-2">
          <CustomerList
            customers={customers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCustomerSelect={setSelectedCustomer}
            onCustomerEdit={(customer) => {
              setEditingCustomer(customer);
              setIsEditModalOpen(true);
            }}
            isLoading={isLoading}
          />
        </div>

        {/* 선택된 고객 정보 */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <CustomerProfile
              customer={selectedCustomer}
              onEdit={() => {
                setEditingCustomer(selectedCustomer);
                setIsEditModalOpen(true);
              }}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              고객을 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </div>
      </div>

      {/* 새 고객 등록 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <CustomerForm
              onSubmit={async (data) => {
                await createCustomer(data);
                setIsCreateModalOpen(false);
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 고객 정보 수정 모달 */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <CustomerForm
              initialData={editingCustomer}
              onSubmit={async (data) => {
                await updateCustomer(editingCustomer.id, data);
                setIsEditModalOpen(false);
                setEditingCustomer(null);
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. DesignersPage (디자이너 관리 페이지)

#### 구조 설계
```
pages/designers/
├── ui/
│   ├── DesignersPage.tsx
│   ├── DesignerScheduleModal.tsx
│   └── index.ts
├── model/
│   ├── useDesignersPage.ts
│   └── index.ts
└── index.ts
```

#### 페이지 구현

**src/pages/designers/ui/DesignersPage.tsx**:
```typescript
import React from 'react';
import { DesignerTable } from '~/widgets/designer-table';
import { DesignerForm } from '~/features/designer-management';
import { useDesigners } from '~/features/designer-management';
import { useDesignersPage } from '../model/useDesignersPage';

export const DesignersPage: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingDesigner,
    setEditingDesigner,
  } = useDesignersPage();

  const {
    designers,
    isLoading,
    createDesigner,
    updateDesigner,
    toggleDesignerStatus,
  } = useDesigners();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">디자이너 관리</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          새 디자이너 등록
        </button>
      </div>

      <DesignerTable
        designers={designers}
        onEdit={setEditingDesigner}
        onToggleStatus={toggleDesignerStatus}
        isLoading={isLoading}
      />

      {/* 모달 구현... */}
    </div>
  );
};
```

### 4. BusinessHoursPage (영업시간 관리 페이지)

#### 구조 설계
```
pages/business-hours/
├── ui/
│   ├── BusinessHoursPage.tsx
│   ├── SpecialHoursCalendar.tsx
│   └── index.ts
├── model/
│   ├── useBusinessHoursPage.ts
│   └── index.ts
└── index.ts
```

#### 페이지 구현

**src/pages/business-hours/ui/BusinessHoursPage.tsx**:
```typescript
import React from 'react';
import { BusinessHoursForm } from '~/features/business-hours';
import { useBusinessHours } from '~/features/business-hours';

export const BusinessHoursPage: React.FC = () => {
  const {
    businessHours,
    specialHours,
    isLoading,
    updateBusinessHours,
    addSpecialHours,
  } = useBusinessHours();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">영업시간 관리</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 영업시간 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">기본 영업시간</h2>
          <BusinessHoursForm
            businessHours={businessHours}
            onSave={updateBusinessHours}
            isLoading={isLoading}
          />
        </div>

        {/* 특별 영업시간 (휴무일, 연장영업 등) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">특별 영업시간</h2>
          {/* 특별 영업시간 캘린더 및 관리 UI */}
        </div>
      </div>
    </div>
  );
};
```

### 5. StatisticsPage (통계 페이지)

#### 구조 설계
```
pages/statistics/
├── ui/
│   ├── StatisticsPage.tsx
│   ├── DateRangePicker.tsx
│   └── index.ts
├── model/
│   ├── useStatisticsPage.ts
│   └── index.ts
└── index.ts
```

#### 페이지 구현

**src/pages/statistics/ui/StatisticsPage.tsx**:
```typescript
import React from 'react';
import { StatisticsDashboard } from '~/widgets/statistics-dashboard';
import { useStatistics } from '~/widgets/statistics-dashboard';
import { useStatisticsPage } from '../model/useStatisticsPage';

export const StatisticsPage: React.FC = () => {
  const {
    dateRange,
    setDateRange,
    selectedPeriod,
    setSelectedPeriod,
  } = useStatisticsPage();

  const { statistics, isLoading } = useStatistics(dateRange);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">통계 및 분석</h1>
        
        {/* 기간 선택 */}
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
            <option value="quarter">이번 분기</option>
            <option value="year">올해</option>
            <option value="custom">직접 선택</option>
          </select>
        </div>
      </div>

      <StatisticsDashboard
        statistics={statistics}
        dateRange={dateRange}
        isLoading={isLoading}
      />
    </div>
  );
};
```

## Pages 계층 통합

### 페이지 인덱스 파일

**src/pages/index.ts**:
```typescript
export { ReservationsPage } from './reservations';
export { CustomersPage } from './customers';
export { DesignersPage } from './designers';
export { BusinessHoursPage } from './business-hours';
export { StatisticsPage } from './statistics';
```

### 향후 라우팅 준비

현재는 탭 기반이지만 향후 React Router 도입을 위한 구조 준비:

**routes 설정 예시**:
```typescript
// 향후 app/routing/routes.tsx
import { ReservationsPage, CustomersPage, DesignersPage, BusinessHoursPage, StatisticsPage } from '~/pages';

export const routes = [
  { path: '/', component: ReservationsPage },
  { path: '/reservations', component: ReservationsPage },
  { path: '/customers', component: CustomersPage },
  { path: '/designers', component: DesignersPage },
  { path: '/business-hours', component: BusinessHoursPage },
  { path: '/statistics', component: StatisticsPage },
];
```

## 마이그레이션 체크리스트

### ReservationsPage
- [ ] 기존 예약 관리 UI를 페이지로 분리
- [ ] 캘린더와 테이블 위젯 조합
- [ ] 모달 상태 관리
- [ ] 페이지별 로직 훅 구현

### CustomersPage
- [ ] 고객 관리 UI를 페이지로 분리
- [ ] 고객 목록과 상세 정보 레이아웃
- [ ] 검색 및 필터 기능 통합
- [ ] 모달 상태 관리

### DesignersPage
- [ ] 디자이너 관리 UI를 페이지로 분리
- [ ] 디자이너 테이블 위젯 활용
- [ ] 스케줄 관리 기능 통합

### BusinessHoursPage
- [ ] 영업시간 관리 UI를 페이지로 분리
- [ ] 기본 영업시간과 특별 영업시간 분리
- [ ] 캘린더 기반 특별시간 관리

### StatisticsPage
- [ ] 통계 대시보드를 페이지로 분리
- [ ] 기간 선택 기능 추가
- [ ] 다양한 통계 차트 통합

## 검증 및 테스트

### 1. 페이지 독립성 테스트
각 페이지가 독립적으로 렌더링되고 작동하는지 확인:

```typescript
// 각 페이지를 독립적으로 테스트
import { ReservationsPage } from '~/pages/reservations';

const TestApp = () => <ReservationsPage />;
```

### 2. 위젯 조합 테스트
페이지가 여러 위젯을 올바르게 조합하는지 확인.

### 3. 상태 관리 테스트
페이지 내 상태가 올바르게 관리되는지 확인.

### 4. 반응형 레이아웃 테스트
다양한 화면 크기에서 페이지 레이아웃이 올바르게 표시되는지 확인.

## 주의사항

### 페이지 책임 범위
- 페이지는 레이아웃과 위젯 조합에 집중
- 비즈니스 로직은 Features에 위임
- UI 상태 관리는 최소한으로 유지

### 위젯 간 통신
- 위젯 간 직접 통신보다는 페이지에서 중재
- 공통 상태는 적절한 계층에서 관리

### 라우팅 준비
- 현재는 탭 기반이지만 향후 라우팅 전환을 고려한 구조
- 각 페이지는 독립적으로 작동할 수 있어야 함

## 다음 단계

Pages 계층 완료 후:

1. **App 계층** - 애플리케이션 초기화, 라우팅, 전역 상태 관리
2. **정리 및 검증** - 기존 구조 제거 및 최종 검증

---

**다음 단계**: `08-app-layer.md`에서 App 계층 마이그레이션 진행