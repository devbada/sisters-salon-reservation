# FSD E2E (End-to-End) 테스트

## 🎯 목표
실제 사용자 관점에서 Sisters Salon Reservation System의 전체 비즈니스 워크플로우를 검증합니다.

## 📋 E2E 테스트 범위

### 핵심 사용자 시나리오
1. **신규 고객 예약 생성** - 고객 등록부터 예약 완료까지
2. **기존 고객 예약 관리** - 예약 수정, 취소, 상태 변경
3. **디자이너 스케줄 관리** - 근무시간 설정, 휴무일 관리
4. **매장 운영 관리** - 영업시간 설정, 통계 확인
5. **예약 충돌 처리** - 중복 예약 방지 및 대안 제시

### 브라우저 호환성 검증
- Chrome (최신)
- Firefox (최신)  
- Safari (최신)
- Edge (최신)

## 🧪 E2E 테스트 도구

### Primary: Playwright
**선택 이유**:
- TypeScript 네이티브 지원
- 다중 브라우저 지원
- 강력한 네트워크 모킹
- 스크린샷/비디오 녹화
- 병렬 실행 지원

### Alternative: Cypress (비교 검토용)
**장점**: 개발자 친화적 디버깅 도구
**단점**: 단일 브라우저 탭 제한

## 📝 E2E 테스트 시나리오

### Scenario 1: 신규 고객 예약 생성 플로우

#### 1.1 완전 신규 고객 예약
```typescript
// tests/e2e/reservation-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('신규 고객 예약 생성', () => {
  test('고객 등록부터 예약 완료까지 전체 플로우', async ({ page }) => {
    // Given: 애플리케이션 로드
    await page.goto('/');
    
    // When: 예약 페이지로 이동
    await page.click('[data-testid="nav-reservations"]');
    await expect(page).toHaveURL('/reservations');
    
    // When: 새 예약 생성 버튼 클릭
    await page.click('[data-testid="new-reservation-btn"]');
    await expect(page.locator('[data-testid="reservation-modal"]')).toBeVisible();
    
    // When: 신규 고객 정보 입력
    await page.fill('[data-testid="customer-name"]', '이영희');
    await page.fill('[data-testid="customer-phone"]', '010-1234-5678');
    await page.fill('[data-testid="customer-email"]', 'lee@example.com');
    
    // When: 서비스 선택
    await page.click('[data-testid="service-dropdown"]');
    await page.click('[data-testid="service-cut-color"]');
    
    // When: 디자이너 선택
    await page.click('[data-testid="designer-dropdown"]');
    await page.click('[data-testid="designer-kim"]');
    
    // When: 날짜 및 시간 선택
    await page.click('[data-testid="calendar-date-2025-09-15"]');
    await page.click('[data-testid="time-slot-14:00"]');
    
    // When: 예약 생성
    await page.click('[data-testid="save-reservation-btn"]');
    
    // Then: 성공 메시지 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 생성되었습니다');
    
    // Then: 예약 목록에 추가 확인
    await expect(page.locator('[data-testid="reservation-table"]')).toContainText('이영희');
    await expect(page.locator('[data-testid="reservation-table"]')).toContainText('2025-09-15 14:00');
    
    // Then: 고객이 고객 목록에도 추가되었는지 확인
    await page.click('[data-testid="nav-customers"]');
    await expect(page.locator('[data-testid="customer-list"]')).toContainText('이영희');
  });
});
```

#### 1.2 예약 시간 충돌 처리
```typescript
test('예약 시간 충돌 시 대안 시간 제시', async ({ page }) => {
  // Given: 이미 예약이 있는 시간대
  await setupExistingReservation(page, '2025-09-15 14:00');
  
  await page.goto('/reservations');
  await page.click('[data-testid="new-reservation-btn"]');
  
  // When: 동일한 시간대 예약 시도
  await fillReservationForm(page, {
    customer: '박철수',
    phone: '010-9876-5432',
    designer: '김디자이너',
    date: '2025-09-15',
    time: '14:00'
  });
  
  await page.click('[data-testid="save-reservation-btn"]');
  
  // Then: 충돌 알림 모달 표시
  await expect(page.locator('[data-testid="conflict-modal"]')).toBeVisible();
  await expect(page.locator('[data-testid="conflict-message"]')).toContainText('해당 시간에 이미 예약이 있습니다');
  
  // Then: 대안 시간 제시
  await expect(page.locator('[data-testid="alternative-times"]')).toBeVisible();
  
  // When: 대안 시간 선택
  await page.click('[data-testid="alternative-time-15:00"]');
  await page.click('[data-testid="confirm-alternative-btn"]');
  
  // Then: 수정된 시간으로 예약 생성
  await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 생성되었습니다');
  await expect(page.locator('[data-testid="reservation-table"]')).toContainText('박철수');
  await expect(page.locator('[data-testid="reservation-table"]')).toContainText('15:00');
});
```

### Scenario 2: 예약 관리 플로우

#### 2.1 예약 수정 및 상태 변경
```typescript
test.describe('예약 관리', () => {
  test('예약 수정 및 상태 변경 플로우', async ({ page }) => {
    // Given: 기존 예약 데이터
    await setupExistingReservation(page, {
      customer: '김철수',
      date: '2025-09-15',
      time: '14:00',
      status: 'pending'
    });
    
    await page.goto('/reservations');
    
    // When: 예약 수정
    await page.click('[data-testid="reservation-김철수"] [data-testid="edit-btn"]');
    await page.fill('[data-testid="edit-time"]', '15:00');
    await page.click('[data-testid="save-edit-btn"]');
    
    // Then: 수정 반영 확인
    await expect(page.locator('[data-testid="reservation-김철수"]')).toContainText('15:00');
    
    // When: 예약 확정 처리
    await page.click('[data-testid="reservation-김철수"] [data-testid="status-dropdown"]');
    await page.click('[data-testid="status-confirmed"]');
    
    // Then: 상태 변경 확인
    await expect(page.locator('[data-testid="reservation-김철수"] [data-testid="status"]')).toContainText('확정됨');
    
    // When: 예약 완료 처리
    await page.click('[data-testid="reservation-김철수"] [data-testid="complete-btn"]');
    await page.click('[data-testid="confirm-complete-btn"]');
    
    // Then: 완료 상태로 변경 확인
    await expect(page.locator('[data-testid="reservation-김철수"] [data-testid="status"]')).toContainText('완료됨');
  });
  
  test('예약 취소 플로우', async ({ page }) => {
    // Given: 기존 예약
    await setupExistingReservation(page, { customer: '이민수', status: 'confirmed' });
    await page.goto('/reservations');
    
    // When: 예약 취소
    await page.click('[data-testid="reservation-이민수"] [data-testid="cancel-btn"]');
    
    // Then: 취소 확인 다이얼로그
    await expect(page.locator('[data-testid="cancel-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-message"]')).toContainText('예약을 취소하시겠습니까?');
    
    // When: 취소 사유 입력
    await page.fill('[data-testid="cancel-reason"]', '고객 요청으로 인한 취소');
    await page.click('[data-testid="confirm-cancel-btn"]');
    
    // Then: 취소 상태로 변경 확인
    await expect(page.locator('[data-testid="reservation-이민수"] [data-testid="status"]')).toContainText('취소됨');
    
    // Then: 해당 시간대 다시 예약 가능 확인
    await page.click('[data-testid="new-reservation-btn"]');
    // 해당 시간대가 선택 가능한지 확인하는 로직
  });
});
```

### Scenario 3: 고객 관리 플로우

#### 3.1 고객 생성, 수정, 삭제 플로우
```typescript
test.describe('고객 관리', () => {
  test('고객 CRUD 전체 플로우', async ({ page }) => {
    await page.goto('/customers');
    
    // 고객 생성
    await page.click('[data-testid="new-customer-btn"]');
    await page.fill('[data-testid="customer-name"]', '정민호');
    await page.fill('[data-testid="customer-phone"]', '010-5555-6666');
    await page.fill('[data-testid="customer-notes"]', 'VIP 고객');
    await page.click('[data-testid="save-customer-btn"]');
    
    // 생성 확인
    await expect(page.locator('[data-testid="customer-list"]')).toContainText('정민호');
    
    // 고객 정보 수정
    await page.click('[data-testid="customer-정민호"] [data-testid="edit-btn"]');
    await page.fill('[data-testid="edit-notes"]', 'VVIP 고객 - 단골');
    await page.click('[data-testid="save-edit-btn"]');
    
    // 수정 확인
    await expect(page.locator('[data-testid="customer-정민호"]')).toContainText('VVIP 고객');
    
    // 고객 예약 내역 조회
    await page.click('[data-testid="customer-정민호"] [data-testid="view-reservations-btn"]');
    await expect(page.locator('[data-testid="customer-reservations-modal"]')).toBeVisible();
    
    // 고객 삭제 (예약이 없는 경우)
    await page.click('[data-testid="close-modal-btn"]');
    await page.click('[data-testid="customer-정민호"] [data-testid="delete-btn"]');
    await page.fill('[data-testid="delete-confirmation"]', '정민호');
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // 삭제 확인
    await expect(page.locator('[data-testid="customer-list"]')).not.toContainText('정민호');
  });
  
  test('고객 검색 및 필터링', async ({ page }) => {
    // Given: 여러 고객 데이터
    await setupMultipleCustomers(page);
    await page.goto('/customers');
    
    // When: 이름으로 검색
    await page.fill('[data-testid="search-input"]', '김');
    
    // Then: 검색 결과 필터링 확인
    await expect(page.locator('[data-testid="customer-list"]')).toContainText('김철수');
    await expect(page.locator('[data-testid="customer-list"]')).toContainText('김영희');
    await expect(page.locator('[data-testid="customer-list"]')).not.toContainText('이민수');
    
    // When: 전화번호로 검색
    await page.fill('[data-testid="search-input"]', '010-1234');
    
    // Then: 전화번호 기반 검색 결과
    await expect(page.locator('[data-testid="search-results"]')).toContainText('1건 검색됨');
  });
});
```

### Scenario 4: 디자이너 및 스케줄 관리

#### 4.1 디자이너 스케줄 관리 플로우
```typescript
test.describe('디자이너 관리', () => {
  test('디자이너 스케줄 설정 및 예약 연동', async ({ page }) => {
    await page.goto('/designers');
    
    // When: 디자이너 선택
    await page.click('[data-testid="designer-김디자이너"]');
    
    // Then: 스케줄 위젯 표시
    await expect(page.locator('[data-testid="designer-schedule"]')).toBeVisible();
    
    // When: 휴무일 설정
    await page.click('[data-testid="schedule-settings-btn"]');
    await page.click('[data-testid="calendar-2025-09-20"]');
    await page.click('[data-testid="set-holiday-btn"]');
    
    // Then: 휴무일 표시 확인
    await expect(page.locator('[data-testid="calendar-2025-09-20"]')).toHaveClass(/holiday/);
    
    // When: 해당 날짜 예약 시도 (다른 탭에서)
    await page.goto('/reservations');
    await page.click('[data-testid="new-reservation-btn"]');
    await page.click('[data-testid="designer-dropdown"]');
    await page.click('[data-testid="designer-kim"]');
    await page.click('[data-testid="calendar-date-2025-09-20"]');
    
    // Then: 예약 불가 상태 확인
    await expect(page.locator('[data-testid="date-unavailable"]')).toContainText('선택한 날짜는 휴무일입니다');
  });
  
  test('디자이너별 근무시간 설정', async ({ page }) => {
    await page.goto('/designers');
    await page.click('[data-testid="designer-이디자이너"]');
    
    // When: 개별 근무시간 설정
    await page.click('[data-testid="work-hours-settings-btn"]');
    await page.selectOption('[data-testid="monday-start"]', '10:00');
    await page.selectOption('[data-testid="monday-end"]', '19:00');
    await page.click('[data-testid="save-work-hours-btn"]');
    
    // Then: 설정 반영 확인
    await expect(page.locator('[data-testid="monday-schedule"]')).toContainText('10:00 - 19:00');
    
    // When: 예약 생성 시 해당 시간만 선택 가능한지 확인
    await page.goto('/reservations');
    await page.click('[data-testid="new-reservation-btn"]');
    await page.click('[data-testid="designer-dropdown"]');
    await page.click('[data-testid="designer-lee"]');
    await page.click('[data-testid="calendar-monday"]');
    
    // Then: 근무시간 내 시간대만 활성화
    await expect(page.locator('[data-testid="time-slot-09:00"]')).toBeDisabled();
    await expect(page.locator('[data-testid="time-slot-10:00"]')).toBeEnabled();
    await expect(page.locator('[data-testid="time-slot-19:00"]')).toBeDisabled();
  });
});
```

### Scenario 5: 영업시간 및 시스템 설정

#### 5.1 영업시간 설정 및 전체 시스템 연동
```typescript
test.describe('시스템 설정', () => {
  test('영업시간 변경이 전체 시스템에 반영', async ({ page }) => {
    await page.goto('/business-hours');
    
    // When: 영업시간 변경
    await page.selectOption('[data-testid="weekday-open"]', '09:00');
    await page.selectOption('[data-testid="weekday-close"]', '21:00');
    await page.click('[data-testid="save-business-hours-btn"]');
    
    // Then: 저장 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText('영업시간이 저장되었습니다');
    
    // When: 예약 페이지에서 시간대 확인
    await page.goto('/reservations');
    await page.click('[data-testid="new-reservation-btn"]');
    
    // Then: 새로운 영업시간이 반영된 시간대 표시
    await expect(page.locator('[data-testid="time-slot-09:00"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-slot-21:00"]')).not.toBeVisible(); // 마감시간은 선택불가
    await expect(page.locator('[data-testid="time-slot-08:00"]')).not.toBeVisible(); // 오픈 전 시간 선택불가
    
    // When: 공휴일 설정
    await page.goto('/business-hours');
    await page.click('[data-testid="holidays-tab"]');
    await page.click('[data-testid="calendar-2025-12-25"]');
    await page.click('[data-testid="add-holiday-btn"]');
    
    // Then: 해당 날짜 예약 불가 확인
    await page.goto('/reservations');
    await page.click('[data-testid="new-reservation-btn"]');
    await page.click('[data-testid="calendar-date-2025-12-25"]');
    await expect(page.locator('[data-testid="holiday-notice"]')).toContainText('공휴일로 예약이 불가합니다');
  });
});
```

### Scenario 6: 통계 및 리포팅

#### 6.1 통계 대시보드 기능 검증
```typescript
test.describe('통계 대시보드', () => {
  test('실시간 통계 업데이트 확인', async ({ page, context }) => {
    // Given: 기본 데이터 설정
    await setupStatisticsData(page);
    
    // When: 통계 페이지 접속
    await page.goto('/statistics');
    
    // Then: 기본 통계 표시
    await expect(page.locator('[data-testid="total-reservations"]')).toContainText('15');
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('750,000');
    
    // When: 새 탭에서 예약 추가 (실시간 업데이트 테스트)
    const newPage = await context.newPage();
    await newPage.goto('/reservations');
    await createNewReservation(newPage, { amount: 50000 });
    
    // Then: 통계 페이지에서 실시간 업데이트 확인
    await page.reload(); // 또는 WebSocket을 통한 실시간 업데이트
    await expect(page.locator('[data-testid="total-reservations"]')).toContainText('16');
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText('800,000');
    
    // When: 날짜 범위 변경
    await page.click('[data-testid="date-range-picker"]');
    await page.click('[data-testid="last-30-days"]');
    
    // Then: 필터링된 통계 표시
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="period-label"]')).toContainText('최근 30일');
  });
});
```

## 🔧 Playwright 설정

### 기본 설정
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 테스트 유틸리티
```typescript
// tests/e2e/utils/test-helpers.ts
export async function fillReservationForm(page: Page, data: ReservationData) {
  await page.fill('[data-testid="customer-name"]', data.customer);
  await page.fill('[data-testid="customer-phone"]', data.phone);
  await page.click(`[data-testid="designer-${data.designer}"]`);
  await page.click(`[data-testid="calendar-date-${data.date}"]`);
  await page.click(`[data-testid="time-slot-${data.time}"]`);
}

export async function setupExistingReservation(page: Page, data: any) {
  // API 또는 데이터베이스를 통한 테스트 데이터 설정
  await page.request.post('/api/test/setup', { data });
}
```

## 📊 테스트 실행 및 모니터링

### 실행 명령어
```bash
# 모든 E2E 테스트 실행
npx playwright test

# 특정 브라우저에서만 실행
npx playwright test --project=chromium

# 헤드풀 모드로 실행 (디버깅용)
npx playwright test --headed

# 특정 테스트만 실행
npx playwright test reservation-creation

# UI 모드로 실행
npx playwright test --ui
```

### CI/CD 통합
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🐛 테스트 안정성 확보

### 대기 전략
```typescript
// 올바른 대기 방법
await expect(page.locator('[data-testid="loading"]')).toBeHidden();
await expect(page.locator('[data-testid="content"]')).toBeVisible();

// 잘못된 대기 방법 (지양)
await page.waitForTimeout(5000); // 하드코딩된 대기
```

### 데이터 격리
```typescript
test.beforeEach(async ({ page }) => {
  // 각 테스트마다 깨끗한 상태로 시작
  await page.request.post('/api/test/reset');
});

test.afterEach(async ({ page }) => {
  // 테스트 후 정리
  await page.request.post('/api/test/cleanup');
});
```

## 📅 실행 계획

### Day 6
- **오전**: Playwright 설정 및 기본 테스트 작성
- **오후**: 핵심 사용자 시나리오 테스트 구현

### Day 7
- **오전**: 나머지 시나리오 테스트 완성
- **오후**: 브라우저 호환성 테스트 및 최종 검증

## 📌 체크포인트
- [ ] Playwright 환경 설정 완료
- [ ] 테스트 데이터 설정 완료
- [ ] 신규 고객 예약 시나리오 테스트 통과
- [ ] 예약 관리 시나리오 테스트 통과
- [ ] 고객 관리 시나리오 테스트 통과
- [ ] 디자이너 관리 시나리오 테스트 통과
- [ ] 시스템 설정 시나리오 테스트 통과
- [ ] 통계 대시보드 시나리오 테스트 통과
- [ ] 모든 브라우저에서 테스트 통과
- [ ] CI/CD 파이프라인 통합 완료

---

**이전 단계**: [03-integration-tests.md](03-integration-tests.md)  
**다음 단계**: [05-final-validation.md](05-final-validation.md)  
**작업 브랜치**: feature/fsd-integration-test  
**예상 완료**: Day 6-7