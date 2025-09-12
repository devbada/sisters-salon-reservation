# 2단계: Conflicts API 구현

## 📋 작업 개요

CalendarWidget의 중복 예약 표시 기능을 위한 Conflicts API를 구현합니다.

## 🎯 목표

1. 중복 예약 확인 API 구현
2. ConflictInfo 타입 정의
3. ReservationApi에 conflicts 메서드 추가
4. 백업 구현체 호환성 유지

## 📊 백업 구현체 분석

### 백업에서의 Conflicts 처리
**파일:** `backup/components/Calendar.tsx` (172-207번째 줄)

```typescript
// 중복 예약 데이터 가져오기
useEffect(() => {
  const fetchConflicts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reservations/conflicts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const conflictData = response.data;
      setConflicts(conflictData);
      
      // 중복 예약이 있는 날짜들을 Set으로 만들기
      const conflictDatesSet = new Set<string>();
      conflictData.forEach((conflict: ConflictInfo) => {
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

## 🚀 구현할 작업

### 1. ConflictInfo 타입 정의
- `ReservationConflict` 인터페이스 생성
- 백업의 `ConflictInfo` 타입과 호환성 유지

### 2. ReservationApi 확장
- `getConflicts()` 메서드 추가
- 인증 토큰 지원
- 에러 핸들링 포함

### 3. 타입 Export 설정
- 관련 타입들을 index.ts에 추가

## 📝 구현 계획

### 타입 정의 (src/entities/reservation/model/conflictTypes.ts)
```typescript
export interface ReservationConflict {
  id: string;
  date: string;
  conflictType: 'time_overlap' | 'designer_unavailable' | 'double_booking';
  reservations: string[]; // 충돌하는 예약 ID들
  message: string;
  severity: 'warning' | 'error';
}

export interface ConflictInfo {
  date: string;
  conflicts: ReservationConflict[];
}
```

### API 메서드 (src/entities/reservation/api/reservationApi.ts)
```typescript
async getConflicts(): Promise<ConflictInfo[]> {
  const response = await apiClient.get('/reservations/conflicts');
  return response.data;
}
```

## 🔄 다음 단계 준비

2단계 완료 후:
- 3단계: MSW 핸들러 보완
- CalendarWidget에서 conflicts 데이터 사용

## 📁 변경 대상 파일

```
src/
├── entities/
│   └── reservation/
│       ├── api/
│       │   └── reservationApi.ts     🔄 수정
│       ├── model/
│       │   ├── conflictTypes.ts      ✨ 신규
│       │   └── index.ts              🔄 수정
│       └── index.ts                  🔄 수정
```

## ✅ 완료 기준

- [ ] ConflictInfo, ReservationConflict 타입 정의
- [ ] getConflicts API 메서드 구현
- [ ] 적절한 에러 핸들링
- [ ] 타입 Export 설정
- [ ] 문서화 완료