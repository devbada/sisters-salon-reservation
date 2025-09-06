# 🧪 자동화된 테스트 수트 구축

**Priority**: 🔥 High  
**Phase**: 1 (품질 보장)  
**Estimated Time**: 16-20 hours  

## 📋 현재 상황

### 테스트 현황
- 현재 커버리지: ~30%
- 기본적인 렌더링 테스트만 존재
- 비즈니스 로직 테스트 부족
- E2E 테스트 없음

## ✅ 목표 커버리지

### 테스트 유형별 목표
- **Unit Tests**: 90% 이상
- **Integration Tests**: 80% 이상  
- **E2E Tests**: 주요 사용자 플로우 100%
- **전체 커버리지**: 85% 이상

## 🔧 구현 방안

### 1. 테스트 환경 구성

```bash
# 백엔드 테스트 패키지
cd salon-reservation-server
npm install --save-dev jest supertest @types/jest @types/supertest

# 프론트엔드 테스트 패키지 (CRA에 기본 포함)
cd salon-reservation-client  
npm install --save-dev @testing-library/jest-dom @testing-library/user-event cypress
```

### 2. Jest 설정 파일

```javascript
// salon-reservation-server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'db/**/*.js',
    '!db/database.db*',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ]
};
```

### 3. 백엔드 Unit Tests

```javascript
// tests/unit/auth.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../db/database');

describe('Authentication', () => {
  beforeEach(() => {
    // 테스트용 데이터베이스 초기화
    db.exec('DELETE FROM administrators');
  });

  describe('POST /api/auth/register', () => {
    test('should create new admin with valid data', async () => {
      const adminData = {
        username: 'testadmin',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('생성되었습니다');
    });

    test('should reject weak passwords', async () => {
      const adminData = {
        username: 'testadmin',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(400);

      expect(response.body.error).toContain('8자 이상');
    });

    test('should prevent duplicate usernames', async () => {
      const adminData = {
        username: 'testadmin',
        password: 'testpass123'
      };

      // 첫 번째 등록
      await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      // 중복 등록 시도
      await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 테스트용 관리자 생성
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testadmin', password: 'testpass123' });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'testpass123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('admin');
    });

    test('should reject incorrect password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'wrongpass' })
        .expect(401);
    });

    test('should reject non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'testpass123' })
        .expect(401);
    });
  });
});
```

### 4. 예약 시스템 Integration Tests

```javascript
// tests/integration/reservations.test.js
const request = require('supertest');
const app = require('../../app');

describe('Reservations Integration', () => {
  let authToken;

  beforeEach(async () => {
    // 관리자 생성 및 로그인
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testadmin', password: 'testpass123' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'testpass123' });

    authToken = loginResponse.body.token;
  });

  test('should create, update, and delete reservation', async () => {
    // 1. 예약 생성
    const reservationData = {
      customerName: '김테스트',
      date: '2025-09-10',
      time: '10:00',
      stylist: '김민주',
      serviceType: '헤어컷'
    };

    const createResponse = await request(app)
      .post('/api/reservations')
      .send(reservationData)
      .expect(201);

    const reservationId = createResponse.body._id;

    // 2. 예약 조회
    const getResponse = await request(app)
      .get(`/api/reservations/${reservationId}`)
      .expect(200);

    expect(getResponse.body.customerName).toBe('김테스트');

    // 3. 예약 수정
    const updateData = { customerName: '김수정' };
    await request(app)
      .put(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    // 4. 예약 삭제
    await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 5. 삭제 확인
    await request(app)
      .get(`/api/reservations/${reservationId}`)
      .expect(404);
  });

  test('should prevent double booking', async () => {
    const reservationData = {
      customerName: '김테스트',
      date: '2025-09-10',
      time: '10:00',
      stylist: '김민주',
      serviceType: '헤어컷'
    };

    // 첫 번째 예약
    await request(app)
      .post('/api/reservations')
      .send(reservationData)
      .expect(201);

    // 같은 시간대 중복 예약 시도
    await request(app)
      .post('/api/reservations')
      .send({ ...reservationData, customerName: '박테스트' })
      .expect(409);
  });
});
```

### 5. 프론트엔드 Component Tests

```typescript
// src/components/__tests__/ReservationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationForm from '../ReservationForm';
import { AuthProvider } from '../../contexts/AuthContext';

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('ReservationForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all form fields', () => {
    render(
      <MockAuthProvider>
        <ReservationForm selectedDate="2025-09-10" onSubmit={mockOnSubmit} />
      </MockAuthProvider>
    );

    expect(screen.getByLabelText(/고객 이름/)).toBeInTheDocument();
    expect(screen.getByLabelText(/예약 시간/)).toBeInTheDocument();
    expect(screen.getByLabelText(/헤어 디자이너/)).toBeInTheDocument();
    expect(screen.getByLabelText(/서비스 유형/)).toBeInTheDocument();
  });

  test('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <MockAuthProvider>
        <ReservationForm selectedDate="2025-09-10" onSubmit={mockOnSubmit} />
      </MockAuthProvider>
    );

    // 빈 폼 제출 시도
    const submitButton = screen.getByText('예약하기');
    await user.click(submitButton);

    expect(screen.getByText(/고객님의 성함을 입력해주세요/)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <MockAuthProvider>
        <ReservationForm selectedDate="2025-09-10" onSubmit={mockOnSubmit} />
      </MockAuthProvider>
    );

    // 폼 입력
    await user.type(screen.getByLabelText(/고객 이름/), '김테스트');
    await user.selectOptions(screen.getByLabelText(/예약 시간/), '10:00');
    await user.selectOptions(screen.getByLabelText(/헤어 디자이너/), '김민주');
    await user.selectOptions(screen.getByLabelText(/서비스 유형/), '헤어컷');

    // 폼 제출
    await user.click(screen.getByText('예약하기'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        customerName: '김테스트',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      });
    });
  });

  test('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <MockAuthProvider>
        <ReservationForm selectedDate="2025-09-10" onSubmit={mockOnSubmit} />
      </MockAuthProvider>
    );

    const nameInput = screen.getByLabelText(/고객 이름/);
    nameInput.focus();

    // Tab으로 다음 필드로 이동
    await user.tab();
    expect(screen.getByLabelText(/예약 시간/)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/헤어 디자이너/)).toHaveFocus();
  });
});
```

### 6. E2E Tests with Cypress

```javascript
// cypress/integration/reservation-flow.spec.js
describe('Reservation Management Flow', () => {
  beforeEach(() => {
    // 테스트 데이터 준비
    cy.task('db:seed');
    cy.visit('/');
  });

  it('should complete full reservation workflow', () => {
    // 1. 로그인
    cy.get('[data-testid=username]').type('admin');
    cy.get('[data-testid=password]').type('admin123');
    cy.get('[data-testid=login-button]').click();

    // 2. 대시보드 확인
    cy.url().should('include', '/dashboard');
    cy.contains('헤어 살롱 예약 시스템').should('be.visible');

    // 3. 날짜 선택
    cy.get('[data-testid=calendar]').within(() => {
      cy.contains('10').click();
    });

    // 4. 예약 정보 입력
    cy.get('[data-testid=customer-name]').type('김테스트');
    cy.get('[data-testid=time-select]').select('10:00');
    cy.get('[data-testid=stylist-select]').select('김민주');
    cy.get('[data-testid=service-select]').select('헤어컷');

    // 5. 예약 생성
    cy.get('[data-testid=submit-reservation]').click();

    // 6. 성공 메시지 확인
    cy.contains('예약이 생성되었습니다').should('be.visible');

    // 7. 예약 목록에서 확인
    cy.get('[data-testid=reservation-list]').within(() => {
      cy.contains('김테스트').should('be.visible');
      cy.contains('김민주').should('be.visible');
    });

    // 8. 예약 수정
    cy.get('[data-testid=edit-reservation]').first().click();
    cy.get('[data-testid=customer-name]').clear().type('김수정');
    cy.get('[data-testid=update-reservation]').click();

    // 9. 수정 확인
    cy.contains('김수정').should('be.visible');

    // 10. 예약 삭제
    cy.get('[data-testid=delete-reservation]').first().click();
    cy.get('[data-testid=confirm-delete]').click();

    // 11. 삭제 확인
    cy.contains('김수정').should('not.exist');
  });

  it('should handle dark mode toggle', () => {
    // 로그인
    cy.get('[data-testid=username]').type('admin');
    cy.get('[data-testid=password]').type('admin123');
    cy.get('[data-testid=login-button]').click();

    // 다크모드 토글
    cy.get('[data-testid=theme-toggle]').click();

    // 다크모드 적용 확인
    cy.get('body').should('have.class', 'dark');

    // 라이트모드로 복귀
    cy.get('[data-testid=theme-toggle]').click();
    cy.get('body').should('not.have.class', 'dark');
  });
});
```

## 🔧 구현 단계

### Step 1: 테스트 환경 구성
- [ ] Jest 및 테스트 라이브러리 설치
- [ ] 테스트 설정 파일 생성
- [ ] 테스트 데이터베이스 분리
- [ ] CI/CD 테스트 파이프라인 구성

### Step 2: Unit Tests 작성
- [ ] 인증 시스템 테스트
- [ ] 예약 CRUD 테스트
- [ ] 디자이너 관리 테스트
- [ ] 영업시간 관리 테스트

### Step 3: Integration Tests 작성
- [ ] API 엔드포인트 통합 테스트
- [ ] 데이터베이스 연동 테스트
- [ ] 미들웨어 테스트
- [ ] 에러 처리 테스트

### Step 4: Frontend Component Tests
- [ ] 주요 컴포넌트 렌더링 테스트
- [ ] 사용자 상호작용 테스트
- [ ] 폼 검증 테스트
- [ ] 접근성 테스트

### Step 5: E2E Tests 작성
- [ ] 주요 사용자 플로우 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 테스트
- [ ] 성능 테스트

## 📊 테스트 명령어

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest tests/integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 🧪 품질 게이트

### CI/CD 통합
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd salon-reservation-server && npm ci
          cd ../salon-reservation-client && npm ci
      
      - name: Run backend tests
        run: cd salon-reservation-server && npm run test:coverage
      
      - name: Run frontend tests  
        run: cd salon-reservation-client && npm run test -- --coverage --watchAll=false
      
      - name: Run E2E tests
        run: cd salon-reservation-client && npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## 📊 완료 기준

### 커버리지 목표
- ✅ Unit Tests: 90% 이상
- ✅ Integration Tests: 80% 이상
- ✅ E2E Tests: 주요 플로우 100%
- ✅ 전체 코드 커버리지: 85% 이상

### 품질 체크리스트
- [ ] 모든 테스트 통과
- [ ] 커버리지 목표 달성
- [ ] CI/CD 파이프라인 통합
- [ ] 테스트 문서화 완료

## 🔄 후속 작업

1. **성능 테스트** → `todo/testing-performance.md`
2. **보안 테스트** → `todo/testing-security.md`
3. **접근성 테스트** → `todo/testing-accessibility.md`

---

**Created**: 2025-09-06  
**Status**: 📋 Ready to Start  
**Priority**: Critical for Production  
**Assignee**: TBD