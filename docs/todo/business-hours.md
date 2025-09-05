# ⏰ 영업 시간 및 휴무일 관리

**작성일**: 2025-01-04  
**상태**: 📋 계획 중  
**우선순위**: ⭐⭐⭐⭐ (높음)  
**예상 소요 시간**: 3-4시간

## 📋 개요

미용실의 영업 시간과 휴무일을 관리하고, 예약 가능한 시간대를 자동으로 제한하는 시스템을 구현합니다.

## 🎯 목표

- 영업 시간 설정 및 관리
- 정기 휴무일 및 임시 휴무 관리
- 점심시간 등 예약 불가 시간 설정
- 예약 폼에서 자동으로 불가능한 시간 비활성화
- 특별 영업일 관리 (공휴일 영업 등)

## 🛠 기술 스택

- **데이터베이스**: SQLite (business_hours, holidays 테이블)
- **날짜 처리**: date-fns
- **백엔드**: Express.js
- **프론트엔드**: React + TypeScript
- **캘린더**: react-calendar (기존 활용)

## ✅ 구현 작업 목록

### 1. 데이터베이스 설계
- [ ] business_hours 테이블 생성
- [ ] holidays 테이블 생성
- [ ] special_hours 테이블 생성 (특별 영업)
- [ ] 기본 영업 시간 데이터 입력

### 2. 백엔드 API 개발
- [ ] `GET /api/business-hours` 영업 시간 조회
- [ ] `PUT /api/business-hours` 영업 시간 수정
- [ ] `GET /api/holidays` 휴무일 목록 조회
- [ ] `POST /api/holidays` 휴무일 추가
- [ ] `DELETE /api/holidays/:id` 휴무일 삭제
- [ ] `GET /api/available-slots/:date` 특정 날짜 예약 가능 시간

### 3. 영업 시간 설정 컴포넌트
- [ ] `BusinessHoursSettings.tsx` 설정 화면
- [ ] `WeeklySchedule.tsx` 주간 스케줄 설정
- [ ] `HolidayManager.tsx` 휴무일 관리
- [ ] `BreakTimeSettings.tsx` 휴식 시간 설정

### 4. 영업 시간 로직
- [ ] 요일별 영업 시간 설정
- [ ] 점심시간 설정 (예: 12:00-13:00)
- [ ] 영업 시작/종료 시간
- [ ] 30분 단위 시간 슬롯
- [ ] 특별 영업일 override

### 5. 휴무일 관리
- [ ] 정기 휴무 (예: 매주 월요일)
- [ ] 임시 휴무 (특정 날짜)
- [ ] 국가 공휴일 자동 인식
- [ ] 휴무 사유 입력
- [ ] 휴무 알림 표시

### 6. 예약 폼 통합
- [ ] 영업 시간 외 시간 비활성화
- [ ] 휴무일 선택 불가
- [ ] 점심시간 블록
- [ ] 이미 예약된 시간 표시
- [ ] 실시간 가능 시간 업데이트

### 7. 달력 뷰 개선
- [ ] 휴무일 표시 (빨간색)
- [ ] 특별 영업일 표시 (파란색)
- [ ] 영업 시간 툴팁
- [ ] 월간 휴무일 요약

### 8. 관리자 대시보드
- [ ] 영업 시간 빠른 수정
- [ ] 이번 달 휴무일 목록
- [ ] 특별 영업일 관리
- [ ] 영업 시간 히스토리

## 📝 구현 세부사항

### 데이터베이스 스키마
```sql
CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL, -- 0=일요일, 6=토요일
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT 0,
  break_start TIME,
  break_end TIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(200),
  is_recurring BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE special_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  open_time TIME,
  close_time TIME,
  reason VARCHAR(200),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript 인터페이스
```typescript
interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  breakStart?: string;
  breakEnd?: string;
}

interface Holiday {
  id: number;
  date: string;
  reason?: string;
  isRecurring: boolean;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  reason?: string; // '영업시간 외', '점심시간', '휴무일', '예약됨'
}
```

### 영업 시간 예시
```
월요일: 휴무
화요일: 10:00 - 20:00 (점심시간: 13:00-14:00)
수요일: 10:00 - 20:00 (점심시간: 13:00-14:00)
목요일: 10:00 - 20:00 (점심시간: 13:00-14:00)
금요일: 10:00 - 20:00 (점심시간: 13:00-14:00)
토요일: 10:00 - 18:00 (점심시간 없음)
일요일: 11:00 - 17:00 (점심시간 없음)
```

## 🎨 디자인 가이드라인

### 영업 시간 설정 UI
- 요일별 토글 스위치
- 시간 선택: 드롭다운 또는 시간 피커
- 휴무일: 달력에서 날짜 클릭
- 저장/취소 버튼

### 예약 폼 시간 표시
- 가능: 기본 스타일
- 불가능: 회색 처리 + 비활성화
- 선택됨: 보라색 하이라이트

## 📊 예상 결과

- 잘못된 시간 예약 100% 방지
- 관리자 수동 작업 시간 80% 감소
- 고객 혼란 감소
- 체계적인 영업 시간 관리

## 🚨 주의사항

1. **시간대**: 서버와 클라이언트 시간대 일치
2. **유효성 검사**: 영업 종료 시간 > 시작 시간
3. **충돌 방지**: 특별 영업일과 휴무일 충돌 체크
4. **알림**: 휴무일 변경 시 예약 고객 알림

## 🔗 참고 자료

- [date-fns 시간대 처리](https://date-fns.org/docs/Time-Zones)
- [영업 시간 UX 패턴](https://www.nngroup.com/articles/business-hours/)
- [SQLite 날짜/시간 함수](https://www.sqlite.org/lang_datefunc.html)