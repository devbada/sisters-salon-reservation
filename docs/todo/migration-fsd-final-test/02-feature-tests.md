# FSD 기능별 단위 테스트

## 🎯 목표
FSD 아키텍처의 각 Feature와 Entity 계층별 기능을 개별적으로 테스트하여 비즈니스 로직의 정확성을 검증합니다.

## 📋 테스트 범위

### Features 계층 (비즈니스 기능)
1. **authentication** - 인증 기능
2. **reservation-management** - 예약 관리
3. **customer-management** - 고객 관리  
4. **designer-management** - 디자이너 관리
5. **business-hours** - 영업시간 관리

### Entities 계층 (비즈니스 엔티티)
1. **reservation** - 예약 엔티티
2. **customer** - 고객 엔티티
3. **designer** - 디자이너 엔티티
4. **business-hours** - 영업시간 엔티티

### Widgets 계층 (복합 UI 블록)
1. **header** - 헤더 위젯
2. **calendar** - 캘린더 위젯
3. **reservation-table** - 예약 테이블 위젯
4. **customer-list** - 고객 목록 위젯
5. **designer-table** - 디자이너 테이블 위젯
6. **statistics-dashboard** - 통계 대시보드 위젯

## 🧪 테스트 전략

### 1. Unit Test (단위 테스트)
**도구**: Jest + React Testing Library
- 개별 컴포넌트 렌더링 테스트
- 비즈니스 로직 함수 테스트
- 훅(hooks) 동작 테스트

### 2. Component Test (컴포넌트 테스트)  
**도구**: React Testing Library
- 사용자 상호작용 테스트
- 상태 변경 테스트
- 이벤트 처리 테스트

### 3. API Integration Test (API 통합 테스트)
**도구**: MSW (Mock Service Worker)
- API 호출 로직 테스트
- 에러 처리 테스트
- 로딩 상태 관리 테스트

## 📝 테스트 계획

### Phase 1: Entities 계층 테스트

#### 1.1 Customer Entity
```typescript
// tests/entities/customer.test.ts
describe('Customer Entity', () => {
  test('고객 데이터 유효성 검증', () => {
    // 고객 정보 필수 필드 검증
    // 전화번호 형식 검증
    // 이메일 형식 검증 (선택사항)
  });
  
  test('고객 검색 기능', () => {
    // 이름으로 검색
    // 전화번호로 검색
    // 부분 검색 기능
  });
});
```

#### 1.2 Reservation Entity
```typescript
// tests/entities/reservation.test.ts
describe('Reservation Entity', () => {
  test('예약 시간 유효성 검증', () => {
    // 과거 시간 예약 방지
    // 영업시간 내 예약 검증
    // 중복 예약 방지
  });
  
  test('예약 상태 변경', () => {
    // pending → confirmed
    // confirmed → completed
    // 취소 처리
  });
});
```

#### 1.3 Designer Entity
```typescript
// tests/entities/designer.test.ts
describe('Designer Entity', () => {
  test('디자이너 스케줄 관리', () => {
    // 근무 시간 설정
    // 휴무일 설정
    // 예약 가능 시간 계산
  });
});
```

#### 1.4 BusinessHours Entity
```typescript
// tests/entities/business-hours.test.ts
describe('BusinessHours Entity', () => {
  test('영업시간 설정', () => {
    // 요일별 영업시간
    // 공휴일 설정
    // 특별 영업시간
  });
});
```

### Phase 2: Features 계층 테스트

#### 2.1 Customer Management
```typescript
// tests/features/customer-management.test.ts
describe('Customer Management Feature', () => {
  test('useCustomers 훅 테스트', () => {
    // 고객 목록 로드
    // 고객 생성
    // 고객 수정
    // 고객 삭제
    // 검색 기능
  });
  
  test('고객 관리 UI 테스트', () => {
    // 고객 목록 렌더링
    // 고객 추가 폼
    // 고객 수정 폼
    // 삭제 확인 다이얼로그
  });
});
```

#### 2.2 Reservation Management
```typescript
// tests/features/reservation-management.test.ts
describe('Reservation Management Feature', () => {
  test('useReservations 훅 테스트', () => {
    // 예약 목록 로드
    // 예약 생성
    // 예약 수정
    // 예약 삭제
    // 상태 변경
  });
  
  test('예약 충돌 처리', () => {
    // 중복 시간 체크
    // 충돌 알림
    // 대안 시간 제안
  });
});
```

#### 2.3 Designer Management
```typescript
// tests/features/designer-management.test.ts
describe('Designer Management Feature', () => {
  test('useDesigners 훅 테스트', () => {
    // 디자이너 목록 로드
    // 디자이너 추가
    // 디자이너 정보 수정
    // 디자이너 삭제
  });
});
```

#### 2.4 Authentication
```typescript
// tests/features/authentication.test.ts
describe('Authentication Feature', () => {
  test('useAuth 훅 테스트', () => {
    // 로그인 처리
    // 로그아웃 처리
    // 인증 상태 관리
    // 토큰 갱신
  });
});
```

### Phase 3: Widgets 계층 테스트

#### 3.1 Customer List Widget
```typescript
// tests/widgets/customer-list.test.ts
describe('CustomerList Widget', () => {
  test('고객 목록 렌더링', () => {
    // 고객 데이터 표시
    // 페이지네이션
    // 검색 인터페이스
  });
  
  test('상호작용 테스트', () => {
    // 고객 선택
    // 고객 편집
    // 고객 삭제
  });
});
```

#### 3.2 Reservation Table Widget
```typescript
// tests/widgets/reservation-table.test.ts
describe('ReservationTable Widget', () => {
  test('예약 테이블 렌더링', () => {
    // 예약 데이터 표시
    // 정렬 기능
    // 필터 기능
  });
  
  test('예약 관리 기능', () => {
    // 예약 상태 변경
    // 예약 편집
    // 예약 삭제
  });
});
```

#### 3.3 Calendar Widget
```typescript
// tests/widgets/calendar.test.ts
describe('Calendar Widget', () => {
  test('캘린더 렌더링', () => {
    // 월별 뷰
    // 일별 뷰
    // 예약 표시
  });
  
  test('캘린더 상호작용', () => {
    // 날짜 선택
    // 시간대 선택
    // 예약 생성
  });
});
```

## 🔧 테스트 환경 설정

### Jest 설정
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^features/(.*)$': '<rootDir>/src/features/$1',
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/mocks/**',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### MSW 설정
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // 고객 API
  rest.get('/api/customers', (req, res, ctx) => {
    return res(ctx.json(mockCustomers));
  }),
  
  rest.post('/api/customers', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  
  // 예약 API
  rest.get('/api/reservations', (req, res, ctx) => {
    return res(ctx.json(mockReservations));
  }),
  
  // 디자이너 API
  rest.get('/api/designers', (req, res, ctx) => {
    return res(ctx.json(mockDesigners));
  }),
];
```

## 📊 테스트 실행 및 검증

### 명령어
```bash
# 모든 테스트 실행
npm test

# 특정 테스트 실행
npm test -- --testPathPattern=customer

# 커버리지 포함 실행
npm test -- --coverage

# watch 모드
npm test -- --watch
```

### 성공 기준
- [ ] 모든 테스트 PASS
- [ ] 코드 커버리지 70% 이상
- [ ] 테스트 실행 시간 30초 이내
- [ ] 메모리 누수 없음

## 🐛 예상 이슈 및 해결방안

### 1. Mock 데이터 불일치
**문제**: 실제 API 응답과 mock 데이터 구조 차이
**해결**: API 스펙 문서 기반으로 mock 데이터 정확히 작성

### 2. 비동기 테스트 문제
**문제**: Promise, async/await 처리 오류
**해결**: waitFor, act 등 적절한 비동기 테스트 유틸리티 사용

### 3. 컴포넌트 의존성 문제
**문제**: Context, Provider 의존성으로 테스트 실패
**해결**: 테스트용 Provider wrapper 생성

## 📅 작업 스케줄

### Day 2
- **오전**: 테스트 환경 설정
- **오후**: Entities 계층 테스트 작성

### Day 3
- **오전**: Features 계층 테스트 작성
- **오후**: Widgets 계층 테스트 작성 및 실행

## 📌 체크포인트
- [ ] 테스트 환경 설정 완료
- [ ] Mock 데이터 및 핸들러 작성 완료
- [ ] Entities 계층 테스트 작성 완료
- [ ] Features 계층 테스트 작성 완료  
- [ ] Widgets 계층 테스트 작성 완료
- [ ] 모든 테스트 통과
- [ ] 코드 커버리지 목표 달성

---

**이전 단계**: [01-build-fixes.md](01-build-fixes.md)  
**다음 단계**: [03-integration-tests.md](03-integration-tests.md)  
**작업 브랜치**: feature/fsd-integration-test  
**예상 완료**: Day 2-3