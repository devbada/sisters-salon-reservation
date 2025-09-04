---
# 백엔드 API 테스트 시스템 (Backend API Testing)

## Status
- [x] 완성

## Description
Node.js/Express 서버의 모든 API 엔드포인트를 테스트하는 종합적인 테스트 시스템입니다. 각 CRUD 작업별로 독립적인 테스트 파일을 제공하며, 실제 HTTP 요청을 통해 API 동작을 검증합니다.

## Implementation Details
### 테스트 구조
- **위치**: `salon-reservation-server/test/`
- **테스트 방식**: 실제 HTTP 요청 기반
- **HTTP 클라이언트**: axios 사용

### 개별 테스트 파일들

#### 1. GET 작업 테스트
- **파일**: `testReservationGet.js`
- **기능**:
  - 모든 예약 조회 테스트
  - 특정 ID 예약 조회 테스트
  - 존재하지 않는 ID 처리 테스트 (404 에러)
- **구현**: 
  - API URL 설정 (`http://localhost:4000`)
  - 성공/실패 케이스 모두 검증
  - 콘솔 로그로 결과 표시

#### 2. POST 작업 테스트
- **파일**: `testReservationPost.js`
- **기능**:
  - 새 예약 생성 테스트
  - 목 데이터로 여러 예약 생성
- **목 데이터**: `test/data/mockReservations.js`
- **검증 항목**:
  - 성공적인 예약 생성
  - 응답 데이터 구조 확인

#### 3. DELETE 작업 테스트
- **파일**: `testReservationDelete.js`
- **기능**:
  - 예약 삭제 테스트
  - 존재하지 않는 예약 삭제 시 에러 처리

#### 4. PUT 작업 테스트
- **파일**: `testReservationPut.js`
- **기능**:
  - 예약 수정 테스트
  - 유효성 검증 테스트

#### 5. 사용자 관련 테스트
- **파일**: `testUsers.js`
- **기능**: 사용자 관련 API 테스트

#### 6. 홈페이지 테스트
- **파일**: `testHomePage.js`
- **기능**: 메인 페이지 접근 테스트

### 목 데이터 시스템
- **파일**: `test/data/mockReservations.js`
- **내용**: 5개의 샘플 예약 데이터
- **구조**:
```javascript
{
  customerName: "Kim Minjae",
  date: "2023-11-15",
  time: "10:00",
  stylist: "John", 
  serviceType: "Haircut"
}
```

### 테스트 실행 방식
```bash
# 서버 실행 후 개별 테스트 실행
node test/testReservationGet.js
node test/testReservationPost.js
node test/testReservationDelete.js
node test/testReservationPut.js
```

## Requirements
### 테스트 시나리오 커버리지
1. **GET /reservations**: 전체 예약 목록 조회
2. **GET /reservations/:id**: 특정 예약 조회
3. **POST /reservations**: 새 예약 생성
4. **PUT /reservations/:id**: 예약 정보 수정
5. **DELETE /reservations/:id**: 예약 삭제
6. **에러 케이스**: 404, 400 에러 처리

### 검증 기준
- HTTP 상태 코드 확인
- 응답 데이터 구조 검증
- 성공/실패 시나리오 모두 테스트
- 에러 메시지 확인

### 테스트 환경 요구사항
- 서버가 `localhost:4000`에서 실행 중이어야 함
- 테스트 실행 전 서버 시작 필요
- 각 테스트는 독립적으로 실행 가능

## Dependencies
### Node.js 모듈
- **axios**: HTTP 요청 클라이언트
- **기본 Node.js 모듈**: require, module.exports

### 서버 의존성
- Express.js 서버 실행 필수
- reservations 라우트 활성화 필요

### 연관 기능
- 모든 백엔드 API 엔드포인트
- 데이터 모델 구조
- 에러 처리 시스템

## TODO
### 완료된 항목
- ✅ GET 엔드포인트 테스트 완성
- ✅ POST 엔드포인트 테스트 완성  
- ✅ DELETE 엔드포인트 테스트 완성
- ✅ PUT 엔드포인트 테스트 완성
- ✅ 목 데이터 시스템 구축
- ✅ 에러 케이스 처리 테스트
- ✅ 독립적인 테스트 파일 구조
- ✅ 사용자 친화적 로그 출력
- ✅ 실제 HTTP 요청 기반 테스트

## Playwright Testing
N/A - 백엔드 테스트 시스템은 서버사이드 기능이므로 Playwright 테스트 불필요

## Issues Found & Resolved
백엔드 API 테스트 시스템이 완전히 작동하며 별도 이슈 없음