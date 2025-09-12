# 1단계: Holiday Service 및 타입 정의 구현

## 📋 작업 개요

CalendarWidget의 공휴일 표시 기능을 복원하기 위한 Holiday Service와 관련 타입 정의를 구현합니다.

## 🎯 목표

1. 백업 구현체와 동일한 공휴일 관리 기능 복원
2. FSD 아키텍처에 맞는 구조로 재설계
3. Legacy 타입과 Modern 타입 간 변환 지원

## ✅ 완료된 작업

### 1. 타입 정의 확장
**파일:** `src/shared/lib/types/businessHours.ts`

- ✅ `BusinessHoliday` 인터페이스에 `isClosed`, `isSubstitute` 필드 추가
- ✅ `LegacyBusinessHoliday` 인터페이스 확장 (백업 호환성)

```typescript
export interface BusinessHoliday {
  id: string;
  date: string;
  name: string;
  type: 'public' | 'custom';
  isRecurring?: boolean;
  isClosed: boolean;      // 추가됨
  isSubstitute: boolean;  // 추가됨
  notes?: string;
}
```

### 2. Holiday Service 초기 구현
**파일:** `src/shared/api/holidayService.ts`

- ✅ `HolidayService` 클래스 기본 구조 구현
- ✅ API 호출 메서드들 정의
- ✅ 타입 변환 함수 구현

## 🚀 진행할 작업

### 3. Holiday Service 완성
- [ ] API 엔드포인트 정의 정리
- [ ] 에러 핸들링 개선
- [ ] 캐싱 로직 추가 (필요시)

### 4. 유틸리티 함수 구현
- [ ] 날짜 관련 헬퍼 함수
- [ ] 공휴일 필터링 함수
- [ ] 달력용 데이터 변환 함수

### 5. Index 파일 수정
- [ ] `src/shared/api/index.ts`에 holidayService export 추가
- [ ] `src/shared/lib/types/index.ts`에서 새 타입 export

## 📁 파일 구조

```
src/
├── shared/
│   ├── api/
│   │   ├── holidayService.ts      ✅ 구현됨
│   │   └── index.ts               🔄 수정 필요
│   └── lib/
│       └── types/
│           ├── businessHours.ts   ✅ 확장됨
│           └── index.ts           🔄 수정 필요
```

## 🔍 백업 구현체와의 비교

### 백업 버전 특징
- 완전한 공휴일 API 연동
- 연도별 공휴일 조회
- 실시간 공휴일 확인
- Map 기반 빠른 조회

### 현재 구현체의 개선점
- FSD 아키텍처 준수
- TypeScript 타입 안정성
- Modern/Legacy 타입 변환 지원
- 에러 핸들링 강화

## 🎨 API 설계

### 필요한 엔드포인트
1. `GET /api/holidays` - 전체 공휴일 조회
2. `GET /api/holidays/:year` - 연도별 공휴일 조회
3. `GET /api/holidays/date/:date` - 특정 날짜 공휴일 확인
4. `GET /api/holidays/today` - 오늘 공휴일 확인

## 📝 다음 단계 준비

1단계 완료 후 다음 작업:
- 2단계: Conflicts API 구현
- MSW 핸들러에 공휴일 API 추가
- CalendarWidget에서 holidayService 사용

## ✨ 예상 결과

- ✅ 공휴일 데이터 조회 가능
- ✅ 대체공휴일 구분 가능
- ✅ 날짜별 빠른 공휴일 확인
- ✅ FSD 아키텍처 준수