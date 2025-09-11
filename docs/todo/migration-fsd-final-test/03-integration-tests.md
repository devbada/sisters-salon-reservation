# FSD 통합 테스트

## 🎯 목표
FSD 아키텍처 계층 간 상호작용을 검증하고, Pages 단위의 전체 워크플로우가 정상적으로 동작하는지 확인합니다.

## 📋 통합 테스트 범위

### Pages 계층 통합 테스트
1. **Reservations Page** - 예약 관리 페이지
2. **Customers Page** - 고객 관리 페이지
3. **Designers Page** - 디자이너 관리 페이지
4. **Business Hours Page** - 영업시간 관리 페이지
5. **Statistics Page** - 통계 대시보드 페이지

### 계층 간 데이터 흐름 검증
- Pages → Widgets → Features → Entities → Shared
- API 호출 및 응답 처리
- 상태 관리 및 업데이트 전파
- 에러 처리 및 로딩 상태

## 🧪 통합 테스트 전략

### 1. Page-Level Integration Test
**범위**: 전체 페이지 기능 통합 테스트
- 페이지 렌더링
- 사용자 워크플로우
- 데이터 CRUD 작업
- 페이지 간 네비게이션

### 2. Feature Integration Test  
**범위**: Feature별 통합 기능 테스트
- API와의 연동
- 상태 관리 시스템
- 에러 처리 메커니즘
- 로딩 상태 관리

### 3. Data Flow Test
**범위**: 계층 간 데이터 흐름 테스트
- 상향 데이터 전달
- 하향 상태 전파
- 사이드 이펙트 처리

## 📝 테스트 시나리오

### Scenario 1: 예약 관리 페이지 통합 테스트

#### 1.1 페이지 초기화 테스트
```typescript
// tests/integration/pages/reservations.test.tsx
describe('Reservations Page Integration', () => {
  test('페이지 초기 로딩 및 데이터 표시', async () => {
    // Given: API 목업 설정
    setupMockAPI();
    
    // When: 예약 페이지 렌더링
    render(<ReservationsPage />);
    
    // Then: 
    // - 로딩 상태 표시
    // - 예약 목록 로드 및 표시
    // - 캘린더 위젯 렌더링
    // - 예약 테이블 위젯 렌더링
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('reservation-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-table')).toBeInTheDocument();
    });
  });
});
```

#### 1.2 예약 생성 워크플로우 테스트
```typescript
test('새 예약 생성 전체 플로우', async () => {
  // Given: 초기 상태 설정
  render(<ReservationsPage />);
  await waitForElementToBeRemoved(screen.getByTestId('loading-spinner'));
  
  // When: 새 예약 생성 버튼 클릭
  fireEvent.click(screen.getByText('새 예약'));
  
  // Then: 예약 생성 모달 표시
  expect(screen.getByTestId('reservation-modal')).toBeInTheDocument();
  
  // When: 예약 정보 입력
  fireEvent.change(screen.getByLabelText('고객명'), { target: { value: '김철수' } });
  fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-1234-5678' } });
  fireEvent.click(screen.getByText('김디자이너'));
  fireEvent.click(screen.getByText('2025-09-15 14:00'));
  
  // When: 저장 버튼 클릭
  fireEvent.click(screen.getByText('저장'));
  
  // Then: 
  // - API 호출 확인
  // - 예약 목록 업데이트
  // - 성공 메시지 표시
  // - 모달 닫힘
  await waitFor(() => {
    expect(screen.queryByTestId('reservation-modal')).not.toBeInTheDocument();
    expect(screen.getByText('예약이 생성되었습니다')).toBeInTheDocument();
  });
});
```

#### 1.3 예약 충돌 처리 테스트
```typescript
test('예약 시간 충돌 처리', async () => {
  // Given: 기존 예약이 있는 시간대 설정
  setupMockAPIWithConflict();
  render(<ReservationsPage />);
  
  // When: 중복 시간대 예약 시도
  // ... 예약 생성 과정
  fireEvent.click(screen.getByText('저장'));
  
  // Then: 충돌 알림 표시
  await waitFor(() => {
    expect(screen.getByText('해당 시간에 이미 예약이 있습니다')).toBeInTheDocument();
    expect(screen.getByTestId('conflict-modal')).toBeInTheDocument();
  });
  
  // When: 대안 시간 선택
  fireEvent.click(screen.getByText('15:00으로 변경'));
  
  // Then: 예약 생성 성공
  await waitFor(() => {
    expect(screen.getByText('예약이 생성되었습니다')).toBeInTheDocument();
  });
});
```

### Scenario 2: 고객 관리 페이지 통합 테스트

#### 2.1 고객 검색 및 필터링 테스트
```typescript
// tests/integration/pages/customers.test.tsx
describe('Customers Page Integration', () => {
  test('고객 검색 및 필터링 통합', async () => {
    // Given: 고객 데이터 목업
    setupCustomersMockAPI();
    render(<CustomersPage />);
    
    // When: 검색어 입력
    const searchInput = screen.getByPlaceholderText('고객명 또는 전화번호 검색');
    fireEvent.change(searchInput, { target: { value: '김' } });
    
    // Then: 
    // - 디바운싱된 검색 실행
    // - 필터링된 결과 표시
    // - 검색 결과 카운트 업데이트
    await waitFor(() => {
      expect(screen.getByText('검색 결과: 3명')).toBeInTheDocument();
      expect(screen.getByText('김철수')).toBeInTheDocument();
      expect(screen.getByText('김영희')).toBeInTheDocument();
    });
  });
  
  test('고객 생성부터 예약까지 연계 플로우', async () => {
    // Given: 초기 상태
    render(<CustomersPage />);
    
    // When: 새 고객 생성
    fireEvent.click(screen.getByText('새 고객 등록'));
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '이민수' } });
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { value: '010-9876-5432' } });
    fireEvent.click(screen.getByText('저장'));
    
    // Then: 고객 생성 완료
    await waitFor(() => {
      expect(screen.getByText('이민수')).toBeInTheDocument();
    });
    
    // When: 해당 고객으로 예약 생성 버튼 클릭
    fireEvent.click(screen.getByTestId('create-reservation-for-이민수'));
    
    // Then: 예약 페이지로 이동하며 고객 정보 자동 입력
    expect(mockNavigate).toHaveBeenCalledWith('/reservations', { 
      state: { preselectedCustomer: expect.objectContaining({ name: '이민수' }) }
    });
  });
});
```

### Scenario 3: 디자이너 관리 페이지 통합 테스트

#### 3.1 디자이너 스케줄 관리 테스트
```typescript
// tests/integration/pages/designers.test.tsx
describe('Designers Page Integration', () => {
  test('디자이너 스케줄 및 예약 연동', async () => {
    // Given: 디자이너와 예약 데이터 설정
    setupDesignersMockAPI();
    render(<DesignersPage />);
    
    // When: 특정 디자이너 선택
    fireEvent.click(screen.getByText('김디자이너'));
    
    // Then: 
    // - 디자이너 상세 정보 표시
    // - 스케줄 위젯 표시
    // - 해당 디자이너 예약 목록 표시
    await waitFor(() => {
      expect(screen.getByTestId('designer-schedule')).toBeInTheDocument();
      expect(screen.getByTestId('designer-reservations')).toBeInTheDocument();
    });
    
    // When: 휴무일 설정
    fireEvent.click(screen.getByText('휴무일 설정'));
    fireEvent.click(screen.getByText('2025-09-20'));
    fireEvent.click(screen.getByText('적용'));
    
    // Then: 
    // - API 호출 확인
    // - 스케줄 업데이트
    // - 해당일 예약 불가 상태로 변경
    await waitFor(() => {
      expect(screen.getByText('2025-09-20 (휴무)')).toBeInTheDocument();
    });
  });
});
```

### Scenario 4: 영업시간 관리 페이지 통합 테스트

#### 4.1 영업시간 설정 및 예약 시스템 연동 테스트
```typescript
// tests/integration/pages/business-hours.test.tsx
describe('Business Hours Page Integration', () => {
  test('영업시간 변경이 예약 시스템에 즉시 반영', async () => {
    // Given: 현재 영업시간 설정
    setupBusinessHoursMockAPI();
    render(<BusinessHoursPage />);
    
    // When: 영업시간 변경
    fireEvent.change(screen.getByLabelText('평일 오픈'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('평일 마감'), { target: { value: '20:00' } });
    fireEvent.click(screen.getByText('저장'));
    
    // Then: 
    // - API 호출 확인
    // - 글로벌 상태 업데이트
    // - 예약 가능 시간 재계산
    await waitFor(() => {
      expect(screen.getByText('영업시간이 변경되었습니다')).toBeInTheDocument();
    });
    
    // 다른 페이지에서 변경사항 확인
    // (실제로는 별도 테스트에서 검증)
  });
});
```

### Scenario 5: 통계 페이지 통합 테스트

#### 5.1 실시간 데이터 연동 테스트
```typescript
// tests/integration/pages/statistics.test.tsx
describe('Statistics Page Integration', () => {
  test('실시간 통계 데이터 업데이트', async () => {
    // Given: 통계 API 목업 설정
    setupStatisticsMockAPI();
    render(<StatisticsPage />);
    
    // Then: 
    // - 대시보드 위젯들 로딩
    // - 차트 렌더링
    // - 주요 지표 표시
    await waitFor(() => {
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-stats')).toBeInTheDocument();
      expect(screen.getByTestId('customer-stats')).toBeInTheDocument();
    });
    
    // When: 날짜 범위 변경
    fireEvent.click(screen.getByText('지난 30일'));
    
    // Then: 
    // - 새로운 데이터 요청
    // - 차트 업데이트
    // - 통계 지표 업데이트
    await waitFor(() => {
      expect(screen.getByText('30일 간 총 매출: ₩1,250,000')).toBeInTheDocument();
    });
  });
});
```

## 🔧 통합 테스트 설정

### React Testing Library 설정
```typescript
// tests/utils/test-utils.tsx
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClient>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClient>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
```

### MSW 통합 목업 설정
```typescript
// tests/mocks/integration-handlers.ts
export const integrationHandlers = [
  // 복합 API 시나리오
  rest.post('/api/reservations', async (req, res, ctx) => {
    const reservation = await req.json();
    
    // 충돌 체크 로직
    if (hasTimeConflict(reservation)) {
      return res(
        ctx.status(409),
        ctx.json({ 
          error: 'CONFLICT', 
          alternatives: getAlternativeTimes(reservation) 
        })
      );
    }
    
    return res(ctx.json({ success: true, id: generateId() }));
  }),
  
  // 연관 데이터 로딩
  rest.get('/api/customers/:id/reservations', (req, res, ctx) => {
    const customerId = req.params.id;
    return res(ctx.json(getReservationsByCustomer(customerId)));
  }),
];
```

## 📊 성능 및 품질 검증

### 성능 테스트
```typescript
// tests/integration/performance.test.ts
describe('Performance Integration', () => {
  test('페이지 로딩 성능', async () => {
    const startTime = performance.now();
    
    render(<ReservationsPage />);
    await waitForElementToBeRemoved(screen.getByTestId('loading-spinner'));
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3초 이내
  });
  
  test('대량 데이터 처리 성능', async () => {
    setupMockAPIWithLargeData(1000); // 1000개 예약
    
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('reservation-table')).toBeInTheDocument();
    });
    
    // 메모리 사용량 체크
    expect(getMemoryUsage()).toBeLessThan(100); // 100MB 이내
  });
});
```

### 접근성 테스트
```typescript
// tests/integration/accessibility.test.ts
describe('Accessibility Integration', () => {
  test('모든 페이지 접근성 준수', async () => {
    const pages = [
      <ReservationsPage />,
      <CustomersPage />,
      <DesignersPage />,
      <BusinessHoursPage />,
      <StatisticsPage />,
    ];
    
    for (const page of pages) {
      const { container } = render(page);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
```

## 🐛 에러 시나리오 테스트

### API 실패 처리
```typescript
test('API 장애 시 에러 처리', async () => {
  // Given: API 실패 목업
  server.use(
    rest.get('/api/reservations', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  
  // When: 페이지 로드
  render(<ReservationsPage />);
  
  // Then: 에러 상태 표시
  await waitFor(() => {
    expect(screen.getByText('데이터를 불러오는데 실패했습니다')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });
  
  // When: 재시도 버튼 클릭
  server.resetHandlers(); // API 정상화
  fireEvent.click(screen.getByText('다시 시도'));
  
  // Then: 정상 로딩
  await waitFor(() => {
    expect(screen.getByTestId('reservation-table')).toBeInTheDocument();
  });
});
```

### 네트워크 지연 처리
```typescript
test('느린 네트워크 환경에서 로딩 처리', async () => {
  // Given: 지연된 API 응답
  server.use(
    rest.get('/api/reservations', (req, res, ctx) => {
      return res(ctx.delay(5000), ctx.json(mockReservations));
    })
  );
  
  // When: 페이지 로드
  render(<ReservationsPage />);
  
  // Then: 로딩 상태 유지
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  
  // 5초 후 데이터 표시
  await waitFor(() => {
    expect(screen.getByTestId('reservation-table')).toBeInTheDocument();
  }, { timeout: 6000 });
});
```

## 📅 실행 계획

### Day 4
- **오전**: 통합 테스트 환경 설정
- **오후**: 예약/고객 페이지 통합 테스트

### Day 5  
- **오전**: 디자이너/영업시간 페이지 통합 테스트
- **오후**: 통계 페이지 및 에러 시나리오 테스트

## 📌 체크포인트
- [ ] 통합 테스트 환경 설정 완료
- [ ] 모든 페이지 기본 렌더링 테스트 통과
- [ ] 주요 워크플로우 테스트 통과
- [ ] 에러 처리 시나리오 테스트 통과
- [ ] 성능 테스트 통과
- [ ] 접근성 테스트 통과

---

**이전 단계**: [02-feature-tests.md](02-feature-tests.md)  
**다음 단계**: [04-e2e-tests.md](04-e2e-tests.md)  
**작업 브랜치**: feature/fsd-integration-test  
**예상 완료**: Day 4-5