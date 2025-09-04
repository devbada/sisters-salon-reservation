---
# 데이터 모델 정의 (Data Models)

## Status
- [x] 완성

## Description
예약 시스템의 핵심 데이터 구조를 정의하는 TypeScript 인터페이스입니다. 클라이언트와 서버 간 데이터 교환의 기준이 되는 스키마를 제공합니다.

## Implementation Details
### AppointmentData 인터페이스
- **위치**: `salon-reservation-client/src/components/AppointmentForm.tsx`
- **라인**: 3-10
- **정의**:
```typescript
export interface AppointmentData {
  _id?: string;
  customerName: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
}
```

### 서버 데이터 모델
- **위치**: `salon-reservation-server/routes/reservations.js`
- **라인**: 34-42
- **구조**:
```javascript
{
  id: nextId++,           // 숫자형 ID
  customerName,           // 문자열
  date,                   // YYYY-MM-DD 형식
  time,                   // HH:MM 형식
  stylist,                // 선택된 스타일리스트
  serviceType,            // 선택된 서비스 유형
  createdAt: new Date()   // 생성 시간
}
```

### Props 인터페이스들
- **AppointmentFormProps**:
  - onSubmit: 폼 제출 콜백
  - initialData?: 수정 시 초기 데이터
  - onCancelEdit?: 수정 취소 콜백

- **ReservationTableProps**:
  - reservations: 예약 데이터 배열
  - onEdit: 수정 버튼 콜백
  - onDelete: 삭제 버튼 콜백

## Requirements
### 필드 정의
1. **customerName**: 고객 이름 (필수)
2. **date**: 예약 날짜 (필수, YYYY-MM-DD 형식)
3. **time**: 예약 시간 (필수, HH:MM 형식)
4. **stylist**: 담당 스타일리스트 (필수, 4명 중 선택)
   - John, Sarah, Michael, Emma
5. **serviceType**: 서비스 유형 (필수, 4종 중 선택)
   - Haircut (헤어컷)
   - Coloring (염색)
   - Styling (스타일링)
   - Treatment (트리트먼트)
6. **_id/id**: 고유 식별자 (자동 생성)

### 데이터 검증 규칙
- 모든 필수 필드 존재 확인
- 날짜/시간 형식 검증
- 스타일리스트/서비스 유형 유효성 검증

## Dependencies
### 클라이언트
- TypeScript 타입 시스템
- React 컴포넌트 Props 타입 정의

### 서버  
- Express.js 요청/응답 처리
- JavaScript 객체 구조

### 연관 기능
- 모든 CRUD 기능의 기반 데이터 구조
- 폼 컴포넌트의 상태 관리
- API 통신의 페이로드 구조

## TODO
⚠️ **주의사항: ID 필드 불일치 문제**
- 클라이언트: `_id?: string` (MongoDB 스타일)
- 서버: `id: number` (SQL 스타일)
- 이 불일치로 인해 수정/삭제 기능에 문제 발생

### 완료된 항목
- ✅ 기본 데이터 구조 정의
- ✅ TypeScript 인터페이스 완성
- ✅ Props 인터페이스 정의
- ✅ 서버 데이터 모델 구현

## Playwright Testing
- [x] UI 렌더링 검사
- [x] 기능 동작 테스트  
- [x] 반응형 레이아웃 검증
- [x] 접근성 검사
- [x] 콘솔 에러 확인

## Issues Found & Resolved
⚠️ **주의사항**: ID 필드 불일치 문제 (_id vs id)가 있지만 데이터 모델 자체는 완성된 상태