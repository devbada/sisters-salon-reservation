# Widgets 계층 마이그레이션

Widgets 계층은 독립적이고 재사용 가능한 UI 블록들을 관리하는 계층입니다. Features를 조합하여 완전한 기능을 가진 복합 컴포넌트를 구성합니다.

## Widgets 식별 및 분류

### 주요 Widgets 목록

1. **Header** - 네비게이션 및 사용자 정보 표시
2. **Calendar** - 예약 캘린더 위젯 
3. **ReservationTable** - 예약 목록 테이블
4. **CustomerList** - 고객 목록 위젯
5. **DesignerTable** - 디자이너 관리 테이블
6. **StatisticsDashboard** - 통계 대시보드

## Widget별 마이그레이션 계획

### 1. Header Widget

#### 현재 분석
**기존**: `components/Header.tsx` - 단순한 헤더 컴포넌트

**새로운 구조**:
```
widgets/header/
├── ui/
│   ├── Header.tsx
│   ├── UserMenu.tsx
│   ├── NavigationTabs.tsx
│   └── index.ts
├── model/
│   ├── useNavigation.ts
│   └── index.ts
└── index.ts
```

#### 기능 확장 및 분리

**src/widgets/header/ui/Header.tsx**:
```typescript
import React from 'react';
import { UserMenu } from './UserMenu';
import { NavigationTabs } from './NavigationTabs';
import { useAuthStore } from '~/features/authentication';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Sisters Salon
            </h1>
            {isAuthenticated && (
              <NavigationTabs 
                activeTab={activeTab} 
                onTabChange={onTabChange} 
              />
            )}
          </div>
          
          {isAuthenticated && user && (
            <UserMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
};
```

**src/widgets/header/ui/NavigationTabs.tsx**:
```typescript
import React from 'react';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'reservations', label: '예약 관리' },
  { id: 'customers', label: '고객 관리' },
  { id: 'designers', label: '디자이너 관리' },
  { id: 'business-hours', label: '영업시간' },
  { id: 'statistics', label: '통계' },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
```

#### 네비게이션 로직

**src/widgets/header/model/useNavigation.ts**:
```typescript
import { useState, useCallback } from 'react';

export const useNavigation = (initialTab: string = 'reservations') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // 향후 라우팅으로 대체할 수 있음
    // history.push(`/${tab}`);
  }, []);

  return {
    activeTab,
    handleTabChange,
  };
};
```

### 2. Calendar Widget

#### 현재 분석
**기존**: `components/Calendar.tsx` - 복잡한 캘린더 로직

**새로운 구조**:
```
widgets/calendar/
├── ui/
│   ├── Calendar.tsx
│   ├── CalendarDay.tsx
│   ├── CalendarHeader.tsx
│   └── index.ts
├── model/
│   ├── useCalendar.ts
│   ├── calendarUtils.ts
│   └── index.ts
└── index.ts
```

#### 캘린더 위젯 리팩터링

**src/widgets/calendar/model/useCalendar.ts**:
```typescript
import { useState, useMemo } from 'react';
import { Reservation } from '~/entities/reservation';
import { businessHoursUtils } from '~/entities/business-hours';

interface UseCalendarProps {
  reservations: Reservation[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const useCalendar = ({ 
  reservations, 
  selectedDate, 
  onDateSelect 
}: UseCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 날들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayReservations = reservations.filter(r => r.date === dateStr);
      
      days.push({
        date: dateStr,
        day,
        reservations: dayReservations,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
        isBusinessDay: businessHoursUtils.isBusinessDay(dateStr),
      });
    }
    
    return days;
  }, [currentMonth, reservations, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return {
    currentMonth,
    calendarDays,
    navigateMonth,
    onDateSelect,
  };
};
```

### 3. ReservationTable Widget

#### 구조 설계
```
widgets/reservation-table/
├── ui/
│   ├── ReservationTable.tsx
│   ├── ReservationRow.tsx
│   ├── ReservationActions.tsx
│   └── index.ts
├── model/
│   ├── useReservationTable.ts
│   └── index.ts
└── index.ts
```

#### 테이블 위젯 구현

**src/widgets/reservation-table/ui/ReservationTable.tsx**:
```typescript
import React from 'react';
import { Reservation } from '~/entities/reservation';
import { ReservationRow } from './ReservationRow';
import { ReservationStatusBadge } from '~/features/reservation-management';

interface ReservationTableProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: ReservationStatus) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ReservationTable: React.FC<ReservationTableProps> = ({
  reservations,
  onStatusChange,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        예약이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              고객
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              디자이너
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              서비스
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              일시
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 4. CustomerList Widget

#### 구조 설계
```
widgets/customer-list/
├── ui/
│   ├── CustomerList.tsx
│   ├── CustomerCard.tsx
│   ├── CustomerSearchBar.tsx
│   └── index.ts
├── model/
│   ├── useCustomerList.ts
│   └── index.ts
└── index.ts
```

#### 고객 목록 위젯

**src/widgets/customer-list/ui/CustomerList.tsx**:
```typescript
import React from 'react';
import { Customer } from '~/entities/customer';
import { CustomerCard } from './CustomerCard';
import { CustomerSearchBar } from './CustomerSearchBar';

interface CustomerListProps {
  customers: Customer[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerEdit: (customer: Customer) => void;
  isLoading?: boolean;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  searchQuery,
  onSearchChange,
  onCustomerSelect,
  onCustomerEdit,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <CustomerSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="고객명, 전화번호로 검색..."
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">검색 중...</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? '검색 결과가 없습니다.' : '고객을 검색해주세요.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSelect={() => onCustomerSelect(customer)}
              onEdit={() => onCustomerEdit(customer)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 5. DesignerTable Widget

#### 구조 설계
```
widgets/designer-table/
├── ui/
│   ├── DesignerTable.tsx
│   ├── DesignerRow.tsx
│   ├── DesignerSchedulePreview.tsx
│   └── index.ts
├── model/
│   ├── useDesignerTable.ts
│   └── index.ts
└── index.ts
```

### 6. StatisticsDashboard Widget

#### 현재 분석
**기존**: `components/StatisticsDashboard.tsx` - 복잡한 통계 로직

**새로운 구조**:
```
widgets/statistics-dashboard/
├── ui/
│   ├── StatisticsDashboard.tsx
│   ├── StatChart.tsx
│   ├── StatSummary.tsx
│   └── index.ts
├── model/
│   ├── useStatistics.ts
│   ├── statisticsUtils.ts
│   └── index.ts
└── index.ts
```

#### 통계 위젯 리팩터링

**src/widgets/statistics-dashboard/model/useStatistics.ts**:
```typescript
import { useState, useEffect, useMemo } from 'react';
import { Reservation, reservationApi } from '~/entities/reservation';
import { Customer, customerApi } from '~/entities/customer';

export const useStatistics = (dateRange: { start: string; end: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [reservationData, customerData] = await Promise.all([
          reservationApi.getReservationsByDateRange(dateRange.start, dateRange.end),
          customerApi.getCustomers()
        ]);
        
        setReservations(reservationData);
        setCustomers(customerData);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const statistics = useMemo(() => {
    return {
      totalReservations: reservations.length,
      completedReservations: reservations.filter(r => r.status === 'completed').length,
      totalRevenue: reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.price, 0),
      totalCustomers: customers.length,
      newCustomers: customers.filter(c => 
        new Date(c.createdAt) >= new Date(dateRange.start)
      ).length,
      averageServiceTime: calculateAverageServiceTime(reservations),
      popularServices: getPopularServices(reservations),
      dailyStats: getDailyStatistics(reservations, dateRange),
    };
  }, [reservations, customers, dateRange]);

  return {
    statistics,
    isLoading,
  };
};
```

## Widget별 Public API 정의

### 각 Widget의 index.ts 파일

**src/widgets/header/index.ts**:
```typescript
export { Header } from './ui/Header';
export { useNavigation } from './model/useNavigation';
```

**src/widgets/calendar/index.ts**:
```typescript
export { Calendar } from './ui/Calendar';
export { useCalendar } from './model/useCalendar';
```

**src/widgets/reservation-table/index.ts**:
```typescript
export { ReservationTable } from './ui/ReservationTable';
export { useReservationTable } from './model/useReservationTable';
```

**src/widgets/customer-list/index.ts**:
```typescript
export { CustomerList } from './ui/CustomerList';
export { useCustomerList } from './model/useCustomerList';
```

**src/widgets/designer-table/index.ts**:
```typescript
export { DesignerTable } from './ui/DesignerTable';
export { useDesignerTable } from './model/useDesignerTable';
```

**src/widgets/statistics-dashboard/index.ts**:
```typescript
export { StatisticsDashboard } from './ui/StatisticsDashboard';
export { useStatistics } from './model/useStatistics';
```

## 마이그레이션 체크리스트

### Header Widget
- [ ] 기존 Header 컴포넌트 분석 및 분리
- [ ] UserMenu, NavigationTabs 컴포넌트 생성
- [ ] 네비게이션 로직 훅 구현
- [ ] Public API 정의

### Calendar Widget
- [ ] 복잡한 캘린더 로직 분리
- [ ] CalendarDay, CalendarHeader 컴포넌트 생성
- [ ] useCalendar 훅 구현
- [ ] 캘린더 유틸리티 함수 분리
- [ ] Public API 정의

### ReservationTable Widget
- [ ] 기존 테이블 컴포넌트 리팩터링
- [ ] ReservationRow, ReservationActions 분리
- [ ] 테이블 로직 훅 구현
- [ ] Public API 정의

### CustomerList Widget
- [ ] 고객 목록 컴포넌트 분리
- [ ] CustomerCard, CustomerSearchBar 생성
- [ ] 고객 목록 로직 훅 구현
- [ ] Public API 정의

### DesignerTable Widget
- [ ] 디자이너 테이블 컴포넌트 분리
- [ ] DesignerRow, SchedulePreview 생성
- [ ] 디자이너 테이블 로직 구현
- [ ] Public API 정의

### StatisticsDashboard Widget
- [ ] 통계 대시보드 분해 및 리팩터링
- [ ] StatChart, StatSummary 컴포넌트 분리
- [ ] 통계 로직 훅 구현
- [ ] 통계 유틸리티 함수 분리
- [ ] Public API 정의

## 검증 및 테스트

### 1. Widget 독립성 확인
각 Widget이 독립적으로 작동할 수 있는지 테스트:

```typescript
// Widget을 독립적으로 사용할 수 있어야 함
import { ReservationTable } from '~/widgets/reservation-table';

const MyPage = () => {
  return (
    <ReservationTable 
      reservations={[]}
      onStatusChange={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
};
```

### 2. 기능 통합 테스트
Widget이 Feature들을 올바르게 조합하는지 확인.

### 3. 반응형 UI 테스트
각 Widget이 다양한 화면 크기에서 올바르게 표시되는지 확인.

## 주의사항

### Widget 책임 범위
- Widget은 특정 UI 영역의 완전한 기능을 담당
- 비즈니스 로직은 Features에서 가져와서 사용
- 독립적으로 재사용 가능해야 함

### 상태 관리
- Widget 자체의 UI 상태만 관리
- 비즈니스 상태는 Features에서 가져와서 사용

### 컴포넌트 합성
- 작은 컴포넌트들을 조합하여 큰 Widget 구성
- 각 하위 컴포넌트는 단일 책임을 가져야 함

## 다음 단계

Widgets 계층 완료 후:

1. **Pages 계층** - Widgets을 조합한 전체 페이지 구성
2. **App 계층** - 애플리케이션 초기화 및 라우팅

---

**다음 단계**: `07-pages-layer.md`에서 Pages 계층 마이그레이션 진행