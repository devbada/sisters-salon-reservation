# FSD 빌드 오류 수정

## 🎯 목표
FSD 아키텍처 마이그레이션 후 발생한 빌드 오류를 수정하여 프로젝트가 정상적으로 컴파일되고 실행되도록 합니다.

## 🚨 현재 상태
- **빌드 상태**: FAIL
- **주요 오류**: `Property 'deleteCustomer' does not exist on type`
- **에러 위치**: `salon-reservation-client/src/widgets/customer-list/ui/CustomerList.tsx:11`

## 📋 발견된 문제들

### 1. 누락된 메서드/속성
```typescript
// 에러 위치: CustomerList.tsx:11
const { deleteCustomer } = useCustomers(); // deleteCustomer 메서드가 없음
```

### 2. ESLint 플러그인 문제
```
Cannot find ESLint plugin (ESLintWebpackPlugin).
```

### 3. 기타 TypeScript 오류들
- import/export 경로 문제
- 타입 불일치 문제

## 🔧 수정 계획

### Phase 1: 핵심 빌드 오류 수정
1. **useCustomers 훅 수정**
   - deleteCustomer 메서드 추가
   - 기타 누락된 메서드 확인 및 추가

2. **타입 정의 검증**
   - Customer, Reservation 등 entity 타입 일관성 확인
   - 누락된 속성 추가

3. **Import/Export 경로 수정**
   - FSD 구조에 맞는 경로 수정
   - index.ts public API 확인

### Phase 2: ESLint 및 도구 설정
1. **ESLint 설정 수정**
   - webpack 플러그인 설정 확인
   - 불필요한 설정 제거

2. **TypeScript 설정 검증**
   - tsconfig.json 경로 별칭 확인
   - 컴파일러 옵션 최적화

### Phase 3: 통합 검증
1. **빌드 테스트**
   - `npm run build` 성공 확인
   - 번들 사이즈 확인

2. **개발 서버 테스트**
   - `npm start` 정상 실행 확인
   - Hot reload 동작 확인

## 📝 작업 순서

### Step 1: 에러 분석
- [ ] 빌드 로그 전체 확인
- [ ] 각 에러별 원인 파악
- [ ] 수정 우선순위 결정

### Step 2: useCustomers 훅 수정
- [ ] `features/customer-management/model/hooks.ts` 확인
- [ ] deleteCustomer 메서드 구현
- [ ] 다른 누락된 메서드 추가
- [ ] 타입 정의 업데이트

### Step 3: 타입 정의 일관성 확보
- [ ] entity 타입 정의 검증
- [ ] feature별 인터페이스 통일
- [ ] shared 타입과의 일관성 확인

### Step 4: Import/Export 경로 수정
- [ ] 잘못된 import 경로 수정
- [ ] index.ts public API 완성
- [ ] 순환 참조 제거

### Step 5: 빌드 도구 설정 수정
- [ ] ESLint 설정 수정
- [ ] webpack 플러그인 설정 검토
- [ ] craco 설정 최적화

## 🧪 검증 방법

### 필수 검증 항목
```bash
# 1. TypeScript 컴파일 체크
npx tsc --noEmit

# 2. 빌드 성공 확인
npm run build

# 3. 개발 서버 구동 확인
npm start

# 4. 린터 체크
npm run lint (있는 경우)
```

### 기능 검증 체크리스트
- [ ] 고객 목록 페이지 정상 렌더링
- [ ] 고객 추가 기능 동작
- [ ] 고객 수정 기능 동작
- [ ] 고객 삭제 기능 동작
- [ ] 고객 검색 기능 동작

## 🔍 예상 수정 사항

### useCustomers 훅 추가 메서드
```typescript
// features/customer-management/model/hooks.ts
export const useCustomers = () => {
  // ... 기존 코드
  
  const deleteCustomer = async (customerId: string) => {
    // 삭제 로직 구현
  };
  
  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
    // 업데이트 로직 구현  
  };
  
  return {
    customers,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    createCustomer,
    deleteCustomer, // 추가
    updateCustomer, // 추가 (필요시)
    // ... 기타 메서드
  };
};
```

### CustomerList 컴포넌트 수정
```typescript
// widgets/customer-list/ui/CustomerList.tsx
const { 
  customers, 
  deleteCustomer, 
  updateCustomer 
} = useCustomers();
```

## ⚠️ 주의사항

### 데이터 무결성
- 고객 삭제 시 관련 예약 데이터 처리
- 트랜잭션 처리 고려

### 사용자 경험
- 삭제 확인 다이얼로그
- 로딩 상태 표시
- 에러 메시지 처리

### 성능 고려사항
- 대량 데이터 처리 시 페이징
- 검색 디바운싱
- 메모리 누수 방지

## 📊 성공 기준
- [ ] `npm run build` 에러 없이 완료
- [ ] `npm start` 정상 실행
- [ ] TypeScript 컴파일 에러 0개
- [ ] ESLint 에러 0개 (critical만)
- [ ] 모든 페이지 정상 렌더링
- [ ] CRUD 기본 기능 동작

## 🔄 롤백 계획
문제 발생 시 이전 커밋으로 롤백:
```bash
git checkout feature/migrate-to-fsd
git checkout -b feature/fsd-integration-test-rollback
```

## 📅 예상 소요 시간
- **최소**: 2시간 (단순 메서드 추가)
- **평균**: 4시간 (타입 정리 포함)
- **최대**: 8시간 (구조 변경 필요시)

## 📌 체크포인트
- [ ] 빌드 오류 목록 작성 완료
- [ ] 핵심 오류 수정 완료
- [ ] 빌드 성공 확인
- [ ] 기본 기능 동작 확인
- [ ] 다음 단계 준비 완료

---

**다음 단계**: [02-feature-tests.md](02-feature-tests.md)  
**작업 브랜치**: feature/fsd-integration-test  
**예상 완료**: Day 1