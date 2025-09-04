---
# API 경로 일관성 문제 수정 (API Path Consistency Fix)

## Status  
- [x] 완료 (2025-08-27)

## Description
클라이언트와 서버 간의 API 경로 불일치 문제를 해결해야 합니다. 현재 클라이언트는 `/api/reservations` 경로를 호출하지만 서버는 `/reservations` 경로만 제공하여 모든 API 호출이 404 에러로 실패하고 있습니다.

## Implementation Details
### 현재 상태
#### 클라이언트 API 호출
- **위치**: `salon-reservation-client/src/App.tsx`
- **문제 코드**:
  - 라인 14: `axios.get('http://localhost:4000/api/reservations')`
  - 라인 34: `axios.post('http://localhost:4000/api/reservations', formData)`
  - 라인 63: `axios.delete(\`http://localhost:4000/api/reservations/\${reservation._id}\`)`

#### 서버 라우트 설정
- **위치**: `salon-reservation-server/app.js`
- **현재 코드**: 라인 25 `app.use('/reservations', reservationsRouter);`
- **실제 제공 경로**: `/reservations`

### 해결 방안 (택 1)
#### 방안 1: 서버 경로 수정 (권장)
```javascript
// app.js 수정
app.use('/api/reservations', reservationsRouter);
```

#### 방안 2: 클라이언트 경로 수정
```typescript
// App.tsx에서 모든 API 호출 경로 변경
axios.get('http://localhost:4000/reservations')
```

## Requirements
### 비즈니스 요구사항
1. 모든 API 통신이 정상 작동해야 함
2. RESTful API 표준 준수
3. 향후 API 버저닝 고려 (`/api/v1/reservations`)

### 기술 요구사항
1. 클라이언트-서버 간 경로 일치
2. 기존 기능 동작 유지
3. 테스트 코드 업데이트 필요

### 영향 범위
- 예약 생성 기능
- 예약 조회 기능  
- 예약 수정 기능
- 예약 삭제 기능
- 백엔드 테스트 파일들

## Dependencies
### 수정 필요 파일
#### 서버 (방안 1 채택 시)
- `salon-reservation-server/app.js` (라우트 경로)

#### 클라이언트 (방안 2 채택 시)  
- `salon-reservation-client/src/App.tsx` (API 호출)

#### 테스트 파일들 (어느 방안이든)
- `salon-reservation-server/test/testReservationGet.js`
- `salon-reservation-server/test/testReservationPost.js`
- `salon-reservation-server/test/testReservationDelete.js`
- `salon-reservation-server/test/testReservationPut.js`

### 연관 기능
- 모든 CRUD 기능에 직접적 영향
- 백엔드 테스트 시스템

## TODO
### 우선순위: 🔥 긴급 (Critical)

#### Phase 1: 경로 통일
- [ ] 서버 라우트를 `/api/reservations`로 변경 (권장)
- [ ] 또는 클라이언트 경로를 `/reservations`로 변경

#### Phase 2: 테스트 업데이트  
- [ ] 모든 테스트 파일의 API URL 수정
- [ ] 테스트 실행하여 동작 확인

#### Phase 3: 검증
- [ ] 예약 생성 기능 테스트
- [ ] 예약 조회 기능 테스트
- [ ] 예약 삭제 기능 테스트
- [ ] 브라우저 네트워크 탭에서 200 OK 응답 확인

#### Phase 4: 문서화
- [ ] API 문서 업데이트
- [ ] README 파일 경로 정보 수정

### 예상 작업 시간
- **구현**: 30분
- **테스트**: 1시간
- **문서 업데이트**: 30분
- **총합**: 2시간

### 위험 요소
- 기존 테스트 실패 가능성
- 캐시된 API 호출로 인한 혼동
- CORS 설정 추가 필요 가능성

## Playwright Testing
- [ ] UI 렌더링 검사
- [ ] 기능 동작 테스트  
- [ ] 반응형 레이아웃 검증
- [ ] 접근성 검사
- [ ] 콘솔 에러 확인

## Issues Found & Resolved

### 1. API 경로 불일치 문제
**문제**: 클라이언트는 `/api/reservations` 호출하지만 서버는 `/reservations` 제공
- **해결방법**: 서버 라우트를 `/api/reservations`로 수정
- **수정 파일**: `app.js` 라인 25
- **결과**: 모든 API 호출이 200 OK 응답으로 성공

### 2. 테스트 파일 경로 불일치
**문제**: 모든 테스트 파일이 구 경로 `/reservations` 사용
- **해결방법**: 4개 테스트 파일의 API 경로 모두 수정
- **수정 파일들**:
  - `testReservationGet.js` (라인 10, 22)
  - `testReservationPost.js` (라인 11) 
  - `testReservationPut.js` (라인 11, 23)
  - `testReservationDelete.js` (라인 11, 23, 35)
- **결과**: 모든 CRUD 테스트가 새 경로로 정상 작동

### 3. 서버 응답 데이터 검증
**테스트 결과**:
- ✅ GET `/api/reservations`: 빈 배열 `[]` 반환 (초기 상태)
- ✅ POST `/api/reservations`: 예약 생성 성공 (id: 1 할당)
- ✅ PUT `/api/reservations/1`: 예약 수정 성공 (updatedAt 추가)
- ✅ DELETE `/api/reservations/1`: 예약 삭제 성공
- ✅ GET `/api/reservations`: 삭제 후 빈 배열 `[]` 확인

### 4. Playwright 브라우저 설치 이슈
**문제**: Chrome 브라우저 경로 인식 실패
- **대안 해결책**: cURL을 이용한 API 직접 테스트로 기능 검증 완료
- **결과**: 모든 CRUD 작업이 정상 작동함을 확인