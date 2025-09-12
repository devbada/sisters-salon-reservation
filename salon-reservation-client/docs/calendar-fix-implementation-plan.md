# 📅 CalendarWidget 버그 수정 및 기능 복원 구현 계획서

## 📋 개요

현재 FSD 마이그레이션 후 CalendarWidget의 데이터 페칭이 누락되어 달력에 예약, 공휴일, 특별 영업시간이 표시되지 않는 문제를 해결합니다.

## 🔍 문제 분석

### 1. 주요 문제점
- **데이터 페칭 누락**: 모든 데이터가 빈 배열로 하드코딩됨
- **Holiday 타입 불일치**: `is_substitute`, `is_closed` 필드 누락  
- **Conflicts API 미구현**: 중복 예약 확인 기능 없음
- **실제 데이터 바인딩 부재**: useBusinessHours 훅 미사용

### 2. 백업 구현체와의 차이점
- 백업: 완전한 API 호출 및 데이터 처리
- 현재: TODO 주석과 빈 배열만 존재

## 🚀 구현 계획

### 1단계: Holiday Service 및 타입 정의 [브랜치: feature/holiday-service]
**작업 내용:**
- `BusinessHoliday` 타입에 `isClosed`, `isSubstitute` 필드 추가
- `holidayService.ts` 구현 (백업 버전 기반)
- Legacy 타입 변환 함수 구현

**브랜치 명:** `feature/holiday-service`

### 2단계: Conflicts API 구현 [브랜치: feature/conflicts-api]
**작업 내용:**
- `ReservationConflict` 타입 정의
- `reservationApi.ts`에 `getConflicts` 메서드 추가
- ConflictInfo 인터페이스 정의

**브랜치 명:** `feature/conflicts-api`

### 3단계: MSW 핸들러 보완 [브랜치: feature/msw-calendar-handlers]
**작업 내용:**
- `/api/holidays/:year` 엔드포인트 추가
- `/api/reservations/conflicts` 엔드포인트 추가
- 기존 MockHolidays 데이터에 `is_substitute`, `is_closed` 필드 추가

**브랜치 명:** `feature/msw-calendar-handlers`

### 4단계: CalendarWidget 실제 데이터 연동 [브랜치: feature/calendar-data-integration]
**작업 내용:**
- useBusinessHours, holidayService, conflicts API 사용
- 하드코딩된 빈 배열 제거
- 실제 데이터 바인딩 및 로딩 상태 관리

**브랜치 명:** `feature/calendar-data-integration`

### 5단계: 통합 테스트 및 최적화 [브랜치: feature/calendar-optimization]
**작업 내용:**
- E2E 테스트 작성
- 성능 최적화
- 에러 핸들링 개선

**브랜치 명:** `feature/calendar-optimization`

## 📁 파일 변경 사항

### 신규 파일
- `src/shared/api/holidayService.ts`
- `src/entities/reservation/model/conflictTypes.ts`

### 수정할 파일
- `src/shared/lib/types/businessHours.ts` (Holiday 타입 확장)
- `src/entities/reservation/api/reservationApi.ts` (Conflicts API 추가)
- `src/shared/api/mocks/handlers.ts` (MSW 핸들러 보완)
- `src/widgets/calendar/ui/CalendarWidget.tsx` (실제 데이터 연동)

## ⚡ 개발 가이드 준수 사항

1. **FSD 아키텍처 준수**
   - Entities, Features, Shared 레이어 구분
   - 의존성 방향 준수

2. **타입스크립트 엄격 모드**
   - 모든 타입 명시
   - any 타입 금지

3. **에러 핸들링**
   - try-catch 블록 사용
   - 사용자 친화적 에러 메시지

4. **성능 최적화**
   - 메모이제이션 활용
   - 불필요한 리렌더링 방지

## 🎯 예상 결과

- ✅ 달력에 예약 상태 표시 (보라색 점)
- ✅ 공휴일 표시 (빨간색, 이름 표시)
- ✅ 대체공휴일 구분 표시 (주황색)
- ✅ 중복 예약 경고 (⚠️ 아이콘)
- ✅ 특별 영업시간 표시 (파란색)
- ✅ 휴무일 스타일 적용

## 📝 작업 순서

1. 현재 브랜치 확인 및 정리
2. 각 단계별 브랜치 생성
3. 순차적 구현 및 테스트
4. 메인 브랜치로 순차적 머지
5. 최종 통합 테스트