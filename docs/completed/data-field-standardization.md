---
# 데이터 필드 표준화 (Data Field Standardization)

## Status
- [x] 완료 (2025-08-27)

## Description
클라이언트와 서버 간의 ID 필드 불일치 문제를 해결해야 합니다. 클라이언트는 `_id` (문자열)을 사용하고 서버는 `id` (숫자)를 사용하여 수정/삭제 기능이 정상적으로 작동하지 않습니다.

## Implementation Details
### 현재 상태
#### 클라이언트 데이터 모델
- **위치**: `salon-reservation-client/src/components/AppointmentForm.tsx`
- **라인**: 3-10
```typescript
export interface AppointmentData {
  _id?: string;    // MongoDB 스타일
  customerName: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
}
```

#### 서버 데이터 모델
- **위치**: `salon-reservation-server/routes/reservations.js`
- **라인**: 34-42
```javascript
{
  id: nextId++,           // 숫자형 ID
  customerName,
  date,
  time,
  stylist,
  serviceType,
  createdAt: new Date()
}
```

### 문제 발생 지점
1. **삭제 기능**: `reservation._id`가 undefined이므로 API 호출 실패
2. **수정 기능**: ID 불일치로 데이터 매칭 불가
3. **테이블 표시**: key prop에서 일관성 부족

## Requirements
### 해결 방안 (택 1)
#### 방안 1: 서버를 클라이언트에 맞추기 (권장)
- 서버 ID 필드를 `_id: string`으로 변경
- UUID 또는 문자열 ID 생성 로직 구현
- 향후 MongoDB 연동 시 호환성 확보

#### 방안 2: 클라이언트를 서버에 맞추기  
- 클라이언트 인터페이스를 `id: number`로 변경
- 모든 컴포넌트에서 `_id` → `id` 변경

#### 방안 3: 어댑터 패턴 구현
- API 응답 시 클라이언트 형식으로 변환
- 요청 시 서버 형식으로 변환

### 비즈니스 요구사항
1. 수정 기능이 정상 작동해야 함
2. 삭제 기능이 정상 작동해야 함  
3. 데이터 일관성 유지
4. 향후 데이터베이스 연동 고려

## Dependencies
### 영향받는 파일들
#### 클라이언트 (방안 2 채택 시)
- `src/components/AppointmentForm.tsx` (인터페이스 정의)
- `src/components/ReservationTable.tsx` (테이블 렌더링)
- `src/App.tsx` (상태 관리, API 호출)

#### 서버 (방안 1 채택 시)
- `routes/reservations.js` (전체 CRUD 로직)
- `test/` 폴더의 모든 테스트 파일

#### 공통
- API 통신 형식
- 테스트 데이터 구조

### 연관 기능
- 예약 수정 기능 (현재 동작 안함)
- 예약 삭제 기능 (현재 동작 안함)
- 테이블 렌더링 최적화 (React key prop)

## TODO
### 우선순위: 🔥 긴급 (Critical)

#### Phase 1: 표준화 방향 결정
- [ ] MongoDB/NoSQL 방향성 고려하여 `_id: string` 채택 (권장)
- [ ] 또는 SQL 데이터베이스 고려하여 `id: number` 채택

#### Phase 2A: 서버 표준화 (방안 1)
- [ ] `uuid` 패키지 설치: `npm install uuid @types/uuid`
- [ ] ID 생성 로직을 `_id: uuid()` 방식으로 변경
- [ ] 모든 CRUD 연산에서 `_id` 필드 사용
- [ ] 테스트 데이터 및 목 데이터 업데이트

#### Phase 2B: 클라이언트 표준화 (방안 2)
- [ ] `AppointmentData` 인터페이스에서 `_id` → `id` 변경
- [ ] 모든 컴포넌트에서 `_id` 참조를 `id`로 수정
- [ ] TypeScript 타입을 `string`에서 `number`로 변경

#### Phase 3: 호환성 확보
- [ ] 기존 데이터와의 호환성 검증
- [ ] 마이그레이션 로직 구현 (필요시)

#### Phase 4: 검증 및 테스트
- [ ] 수정 기능 정상 작동 확인
- [ ] 삭제 기능 정상 작동 확인
- [ ] 모든 API 테스트 통과 확인
- [ ] 브라우저에서 E2E 테스트

#### Phase 5: 문서 업데이트
- [ ] 데이터 모델 문서 업데이트
- [ ] API 문서 스키마 수정
- [ ] 개발 가이드라인 업데이트

### 예상 작업 시간
- **설계 및 결정**: 1시간
- **구현**: 2-3시간  
- **테스트**: 2시간
- **문서화**: 1시간
- **총합**: 6-7시간

### 위험 요소
- 대량 코드 수정으로 인한 버그 발생 가능성
- 테스트 데이터 불일치
- 타입 에러 발생 가능성
- 기존 저장된 데이터와의 충돌

## Playwright Testing
- [ ] UI 렌더링 검사
- [ ] 기능 동작 테스트  
- [ ] 반응형 레이아웃 검증
- [ ] 접근성 검사
- [ ] 콘솔 에러 확인

## Issues Found & Resolved

### 1. ID 필드 불일치 문제
**문제**: 클라이언트는 `_id: string` 사용, 서버는 `id: number` 사용
- **영향**: 예약 수정/삭제 기능이 완전히 작동하지 않음
- **해결방법**: 서버를 클라이언트 표준에 맞춰 `_id: string` UUID로 변경
- **수정 파일**: `routes/reservations.js` 전체 CRUD 로직
- **결과**: 모든 CRUD 작업이 일관된 데이터 구조로 동작

### 2. UUID 패키지 설치 필요
**문제**: 서버에서 문자열 ID 생성 방법 부재
- **해결방법**: `uuid` 패키지 설치 및 `uuidv4()` 사용
- **명령어**: `npm install uuid`
- **결과**: MongoDB 호환 가능한 문자열 ID 생성

### 3. 테스트 파일 데이터 타입 불일치
**문제**: 모든 테스트가 `id: number` 기준으로 작성됨
- **해결방법**: 4개 테스트 파일에서 `id` → `_id` 변경
- **수정 파일들**:
  - `testReservationGet.js` (라인 48, 64)
  - `testReservationPut.js` (라인 48, 57, 70, 87)
  - `testReservationDelete.js` (라인 64, 65, 71, 84)
- **결과**: 모든 테스트가 새로운 UUID 구조와 호환

### 4. 서버 CRUD 로직 완전 표준화
**수정 내용**:
- ✅ POST: `id: nextId++` → `_id: uuidv4()`
- ✅ GET by ID: `parseInt(req.params.id)` → `req.params.id` 
- ✅ PUT: `r.id === id` → `r._id === id`
- ✅ DELETE: `r.id === id` → `r._id === id`

### 5. 기능 검증 결과
**테스트 완료**:
- ✅ POST: UUID 생성 성공 (`_id: "0ace2d1e-dec3-4a47-8f31-23f8a44f25b9"`)
- ✅ PUT: UUID로 수정 성공 (`updatedAt` 필드 추가)
- ✅ DELETE: UUID로 삭제 성공
- ✅ GET by ID: 삭제된 항목에 대해 404 반환 확인