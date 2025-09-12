# 3-4단계 통합: MSW 핸들러 보완 및 CalendarWidget 데이터 연동

## 📋 작업 개요

1-2단계에서 구현한 Holiday Service와 Conflicts API를 기반으로 MSW 핸들러를 보완하고, CalendarWidget에서 실제 데이터를 연동합니다.

## 🎯 목표

1. **3단계**: MSW 핸들러 보완
   - Holiday API 핸들러 추가
   - Conflicts API 핸들러 추가
   - Mock 데이터 업데이트

2. **4단계**: CalendarWidget 실제 데이터 연동
   - 하드코딩된 빈 배열 제거
   - API 호출 및 데이터 바인딩
   - 로딩 상태 및 에러 처리

## 🚀 구현 계획

### 3단계: MSW 핸들러 구현

#### Holiday 관련 핸들러 추가
```typescript
// /api/holidays/:year 엔드포인트
http.get('/api/holidays/:year', ({ params }) => {
  const { year } = params;
  const yearHolidays = mockHolidays.filter(h => h.date.startsWith(year));
  return HttpResponse.json({
    success: true,
    count: yearHolidays.length,
    holidays: yearHolidays,
    year: parseInt(year)
  });
}),
```

#### Conflicts 관련 핸들러 추가
```typescript
// /api/reservations/conflicts 엔드포인트
http.get('/api/reservations/conflicts', () => {
  // Mock conflicts data 생성
  const conflicts = generateMockConflicts();
  return HttpResponse.json(conflicts);
}),
```

#### Mock 데이터 업데이트
- 기존 mockHolidays에 `is_substitute`, `is_closed` 필드 추가
- Mock conflicts 데이터 생성 함수 구현

### 4단계: CalendarWidget 데이터 연동

#### 기존 코드 수정
**파일:** `src/widgets/calendar/ui/CalendarWidget.tsx`

**변경 전 (하드코딩):**
```typescript
const conflicts: any[] = [];
const holidays: any[] = [];
const businessHours: any[] = [];
const specialHours: any[] = [];
```

**변경 후 (실제 데이터 연동):**
```typescript
const { businessHours, specialHours, holidays, isLoading: businessHoursLoading } = useBusinessHours();
const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
const [conflictDates, setConflictDates] = useState<Set<string>>(new Set());

// Conflicts 데이터 로드
useEffect(() => {
  const fetchConflicts = async () => {
    try {
      const conflictData = await reservationApi.getConflicts();
      setConflicts(conflictData);
      
      const conflictDatesSet = new Set<string>();
      conflictData.forEach((conflict) => {
        conflictDatesSet.add(conflict.date);
      });
      setConflictDates(conflictDatesSet);
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
    }
  };

  fetchConflicts();
}, []);
```

## 📊 예상 결과

### 달력 기능 복원
- ✅ 예약 있는 날짜에 보라색 점 표시
- ✅ 공휴일 빨간색 배경 및 이름 표시
- ✅ 대체공휴일 주황색 구분 표시
- ✅ 중복 예약 ⚠️ 경고 아이콘 표시
- ✅ 특별 영업시간 파란색 표시
- ✅ 휴무일 회색 처리

### 백업 구현체와의 동일성
- 모든 시각적 요소 복원
- 동일한 사용자 경험 제공
- 향상된 타입 안정성

## 📁 작업 대상 파일

### MSW 핸들러 (3단계)
```
src/shared/api/mocks/handlers.ts    🔄 확장
```

### CalendarWidget (4단계)
```
src/widgets/calendar/ui/CalendarWidget.tsx    🔄 대폭 수정
```

## 🔄 통합 작업 순서

1. **Mock 데이터 업데이트**
   - Holiday 데이터에 필수 필드 추가
   - Mock conflicts 데이터 생성

2. **MSW 핸들러 추가**
   - Holiday API 엔드포인트들
   - Conflicts API 엔드포인트들

3. **CalendarWidget 수정**
   - Import 문 추가
   - 하드코딩 제거
   - 실제 API 호출 구현
   - 로딩/에러 상태 처리

4. **테스트 및 검증**
   - 달력 기능 동작 확인
   - 각종 표시 상태 검증

## 📝 완료 기준

- [ ] 모든 MSW 핸들러 구현 완료
- [ ] CalendarWidget 실제 데이터 연동 완료
- [ ] 달력의 모든 시각적 요소 정상 표시
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] 백업 구현체와 동일한 기능 복원

이 통합 접근법으로 빠르게 CalendarWidget 버그를 수정하고 모든 기능을 복원할 수 있습니다.