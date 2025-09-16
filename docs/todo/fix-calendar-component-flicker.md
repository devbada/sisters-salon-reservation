---
# 캘린더 컴포넌트 깜빡임 최적화

## Status
- [ ] 미완성 / [ ] 완성

## Description
예약 캘린더 선택 시 발생하는 컴포넌트 깜빡임과 불필요한 리렌더링을 방지하여 사용자 경험을 개선합니다.

## Implementation Details

### 현재 문제점
1. **AppContent.tsx useEffect 의존성 문제**
   - `selectedDate`가 변경될 때마다 모든 API 함수들이 재실행됨
   - `fetchAllReservations()`과 `fetchActiveDesigners()`는 날짜와 무관한데도 매번 호출됨
   - 위치: `salon-reservation-client/src/AppContent.tsx:105-109`

2. **useCallback 함수 재생성 문제**
   - `fetchReservations`가 `addToast`를 의존성으로 가져 불필요한 재생성 발생
   - 위치: `salon-reservation-client/src/AppContent.tsx:80-102`

3. **Calendar 컴포넌트 내부 상태 관리**
   - `reservations` prop 변경 시마다 `reservationDates` Set이 매번 재계산됨
   - 여러 API 호출로 인한 로딩 상태 변경이 깜빡임 유발
   - 위치: `salon-reservation-client/src/components/Calendar.tsx:60-73`

4. **컴포넌트 구조적 문제**
   - 날짜 변경 시 전체 예약 관리 섹션이 리렌더링됨
   - 하위 컴포넌트들의 불필요한 재렌더링 발생

## Requirements

### 기능 요구사항
1. 캘린더 날짜 선택 시 깜빡임 완전 제거
2. 불필요한 API 호출 방지
3. 컴포넌트 리렌더링 최적화
4. 기존 기능 유지 (예약 표시, 공휴일 표시 등)

### 성능 요구사항
1. 날짜 변경 시 응답시간 200ms 이하
2. 메모리 사용량 증가 최소화
3. CPU 사용률 최적화

### 사용자 경험 요구사항
1. 부드러운 UI 전환
2. 로딩 상태 최소화
3. 시각적 깜빡임 제거

## Dependencies

### 기술적 의존성
- React 19.1.0 (useState, useEffect, useCallback, useMemo, React.memo)
- TypeScript 4.9.5
- Axios 1.6.2 (API 호출)

### 기능적 의존성
- AppointmentForm 컴포넌트
- ReservationTable 컴포넌트
- SearchFilter 컴포넌트
- Calendar 컴포넌트
- Holiday Service API
- Business Hours API
- Reservations API

### 파일 의존성
- `salon-reservation-client/src/AppContent.tsx`
- `salon-reservation-client/src/components/Calendar.tsx`
- `salon-reservation-client/src/components/AppointmentForm.tsx`
- `salon-reservation-client/src/components/ReservationTable.tsx`
- `salon-reservation-client/src/components/SearchFilter.tsx`

## TODO

### 1. AppContent.tsx 최적화
- [ ] useEffect 의존성 배열에서 `selectedDate` 제거
- [ ] 초기 로드와 날짜 변경 로직 분리
- [ ] `fetchReservations` 함수의 `addToast` 의존성 개선
- [ ] useRef를 활용한 함수 참조 안정화

### 2. Calendar.tsx 메모이제이션
- [ ] `reservationDates` 계산을 `useMemo`로 최적화
- [ ] `React.memo`로 컴포넌트 래핑
- [ ] props 변경 감지 최적화

### 3. 하위 컴포넌트 최적화
- [ ] AppointmentForm에 `React.memo` 적용
- [ ] ReservationTable에 `React.memo` 적용
- [ ] SearchFilter에 `React.memo` 적용
- [ ] props 비교 함수 최적화

### 4. 로딩 상태 개선
- [ ] Calendar 내부 로딩 상태 통합
- [ ] 부분적 로딩 표시로 변경
- [ ] 전체 로딩은 초기 로드 시에만 표시

### 5. 코드 리팩토링
- [ ] 불필요한 변수 제거
- [ ] 함수 호출 순서 최적화
- [ ] 타입 정의 개선

## Playwright Testing
- [ ] UI 렌더링 검사: 캘린더가 정상적으로 표시되는지 확인
- [ ] 기능 동작 테스트: 날짜 선택 시 깜빡임 없이 작동하는지 확인
- [ ] 반응형 레이아웃 검증: 모바일/태블릿에서도 정상 작동 확인
- [ ] 접근성 검사: 키보드 네비게이션 및 스크린 리더 지원 확인
- [ ] 콘솔 에러 확인: 에러 및 경고 메시지 없음 확인
- [ ] 성능 테스트: 날짜 변경 시 응답속도 측정
- [ ] API 호출 최적화 확인: 불필요한 중복 호출 제거 확인

## Issues Found & Resolved

### 발견된 문제들
1. **useEffect 의존성 순환 문제** (Critical)
   - 위치: AppContent.tsx:105-109
   - 증상: selectedDate 변경 시 모든 함수 재실행
   - 원인: 의존성 배열에 selectedDate 포함

2. **useCallback 재생성 문제** (High)
   - 위치: AppContent.tsx:80-102
   - 증상: fetchReservations 함수가 매번 재생성됨
   - 원인: addToast 의존성

3. **reservationDates 재계산 문제** (Medium)
   - 위치: Calendar.tsx:60-73
   - 증상: props 변경 시마다 Set 재계산
   - 원인: useMemo 미사용

4. **컴포넌트 메모이제이션 부재** (Medium)
   - 위치: 하위 컴포넌트들
   - 증상: 불필요한 리렌더링 발생
   - 원인: React.memo 미적용

### 해결 방안
1. **useEffect 분리**
   ```typescript
   // 초기 로드용 useEffect
   useEffect(() => {
     fetchAllReservations();
     fetchActiveDesigners();
   }, []);

   // 날짜 변경용 useEffect
   useEffect(() => {
     fetchReservations(selectedDate);
   }, [selectedDate]);
   ```

2. **useCallback 의존성 제거**
   ```typescript
   const addToastRef = useRef(addToast);
   useEffect(() => {
     addToastRef.current = addToast;
   }, [addToast]);
   ```

3. **useMemo 적용**
   ```typescript
   const reservationDates = useMemo(() => {
     return new Set(reservations.map(r => r.date));
   }, [reservations]);
   ```

4. **React.memo 적용**
   ```typescript
   export default React.memo(ComponentName);
   ```

---

**우선순위**: High
**예상 소요시간**: 4-6시간
**담당자**: Claude Code
**관련 이슈**: 캘린더 사용성 개선
**테스트 환경**: Chrome, Firefox, Safari (최신 버전)