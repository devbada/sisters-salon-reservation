# 디자이너 중복 예약 표시 기능

## 📋 기능 개요

**기능명**: Double Booking Indicator  
**우선순위**: High  
**예상 소요 시간**: 10-14시간  
**담당 영역**: Full-stack  
**관련 컴포넌트**: Calendar, ReservationTable, AppointmentForm  

---

## 🎯 요구사항 (Requirements)

### 핵심 기능
1. **중복 예약 감지**: 동일한 디자이너가 같은 시간대에 여러 예약을 가진 경우 자동 감지
2. **시각적 표시**: 중복 예약에 대한 명확한 시각적 구분 (색상, 아이콘, 애니메이션)
3. **달력 표시**: 달력에서 중복 예약이 있는 날짜 특별 표시
4. **예약 테이블 표시**: 예약 목록에서 중복 예약 하이라이트
5. **실시간 경고**: 예약 생성 시 중복 시간 선택 시 경고 메시지

### 상세 요구사항
- 중복 예약 허용 (삭제하지 않고 경고만)
- 중복 예약 개수 표시
- 중복된 고객명 툴팁 표시
- 관리자 대시보드에서 중복 예약 통계 제공
- 모바일 반응형 지원

---

## 🔗 종속성 (Dependencies)

### 기술적 의존성
- ✅ **데이터베이스**: Better-sqlite3 (기존 reservations 테이블)
- ✅ **백엔드**: Express.js 라우팅 시스템
- ✅ **프론트엔드**: React 19, TypeScript
- ✅ **스타일링**: Tailwind CSS + Glassmorphism
- ✅ **상태 관리**: Context API
- ✅ **HTTP 통신**: Axios

### 기능적 의존성
- ✅ **예약 시스템**: 기존 예약 CRUD 기능
- ✅ **디자이너 관리**: 활성 디자이너 목록
- ✅ **인증 시스템**: JWT 기반 관리자 인증
- ✅ **영업시간 관리**: 유효한 예약 시간대 확인

---

## 📝 구현 계획 (TODO)

### Phase 1: 백엔드 API 개발 (3-4시간)

#### 1.1 데이터베이스 쿼리 추가
- [x] 중복 예약 감지 prepared statements 작성
- [ ] 전체 중복 예약 조회 쿼리: `GET /api/reservations/conflicts`
- [ ] 날짜별 중복 예약 조회: `GET /api/reservations/conflicts?date=YYYY-MM-DD`
- [ ] 디자이너별 중복 예약 조회: `GET /api/reservations/conflicts/designer/:name`

#### 1.2 예약 조회 API 확장
- [ ] 기존 `GET /api/reservations` API에 중복 정보 추가
- [ ] `hasConflict`, `conflictCount`, `conflictingReservations` 필드 포함

#### 1.3 실시간 중복 체크 API
- [ ] `POST /api/reservations/check-conflict` 엔드포인트 추가
- [ ] 예약 생성/수정 전 중복 체크 기능

### Phase 2: 프론트엔드 타입 정의 (1시간)

#### 2.1 인터페이스 확장
```typescript
// AppointmentForm.tsx
export interface AppointmentData {
  // ... 기존 필드들
  hasConflict?: boolean;
  conflictCount?: number;
  conflictingReservations?: string[];
}

// 새로운 인터페이스
export interface ConflictInfo {
  date: string;
  time: string;
  stylist: string;
  conflictCount: number;
  reservationIds: string[];
  customerNames: string[];
}
```

### Phase 3: UI 컴포넌트 개발 (4-5시간)

#### 3.1 ConflictBadge 컴포넌트 생성
- [ ] `src/components/ConflictBadge.tsx` 생성
- [ ] 중복 개수 표시 배지
- [ ] 호버 시 상세 정보 툴팁
- [ ] 클릭 시 중복 예약 목록 모달

#### 3.2 Calendar 컴포넌트 수정
- [ ] `src/components/Calendar.tsx` 업데이트
- [ ] 중복 예약 날짜에 경고 아이콘 (⚠️) 추가
- [ ] 범례에 "중복 예약" 항목 추가
- [ ] 툴팁으로 중복 예약 상세 정보 표시

#### 3.3 ReservationTable 컴포넌트 수정
- [ ] `src/components/ReservationTable.tsx` 업데이트
- [ ] 중복 예약 행에 특별한 스타일링 적용
- [ ] ConflictBadge 컴포넌트 통합
- [ ] 시간별 그룹화로 중복 예약 명확하게 표시

#### 3.4 AppointmentForm 실시간 경고
- [ ] `src/components/AppointmentForm.tsx` 업데이트
- [ ] 시간/디자이너 선택 시 실시간 중복 체크
- [ ] 중복 발견 시 경고 메시지 표시
- [ ] "그래도 예약하기" 확인 옵션 제공

### Phase 4: 스타일링 및 UX (2시간)

#### 4.1 CSS 스타일 추가
```css
/* src/index.css */
.conflict-reservation {
  border: 2px solid #ff9800;
  background: rgba(255, 152, 0, 0.1);
  animation: pulse-warning 2s infinite;
}

.conflict-badge {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: bold;
}

@keyframes pulse-warning {
  0%, 100% { border-color: #ff9800; }
  50% { border-color: #ff5722; }
}
```

#### 4.2 반응형 디자인
- [ ] 데스크톱: 테이블 형태의 중복 표시
- [ ] 태블릿/모바일: 카드 형태의 중복 표시
- [ ] 터치 기반 인터랙션 최적화

### Phase 5: 통계 및 분석 (선택사항, 2-3시간)

#### 5.1 중복 예약 통계 API
- [ ] `GET /api/reservations/conflicts/stats` 엔드포인트
- [ ] 디자이너별 중복 빈도
- [ ] 시간대별 중복 패턴
- [ ] 월별 중복 추이

#### 5.2 대시보드 통합
- [ ] 기존 통계 대시보드에 중복 예약 섹션 추가
- [ ] 차트로 중복 패턴 시각화

---

## ✅ 완료 기준 (Acceptance Criteria)

### 기능적 요구사항
- [ ] 동일 디자이너의 같은 시간대 중복 예약 자동 감지
- [ ] 달력에서 중복 예약 날짜 시각적 구분 (⚠️ 아이콘)
- [ ] 예약 테이블에서 중복 예약 행 하이라이트
- [ ] 실시간 중복 체크 및 경고 메시지
- [ ] 중복 예약 개수 및 고객명 툴팁 표시

### 기술적 요구사항
- [ ] TypeScript 타입 안전성 유지
- [ ] 기존 glassmorphism 디자인과 조화
- [ ] 모바일 반응형 지원
- [ ] API 응답 시간 < 200ms
- [ ] 메모리 누수 없음

### 사용성 요구사항
- [ ] 직관적인 시각적 표시
- [ ] 접근성 기준 준수 (ARIA 레이블)
- [ ] 키보드 네비게이션 지원
- [ ] 에러 상황 적절한 처리

---

## 🧪 테스트 계획 (Testing Strategy)

### 단위 테스트
- [ ] 중복 감지 쿼리 테스트
- [ ] ConflictBadge 컴포넌트 렌더링 테스트
- [ ] 실시간 중복 체크 함수 테스트

### 통합 테스트
- [ ] API 엔드포인트 전체 테스트
- [ ] 예약 생성 시 중복 경고 플로우 테스트
- [ ] 달력-예약테이블 연동 테스트

### E2E 테스트 (Playwright)
- [ ] 중복 예약 생성 시나리오
- [ ] 중복 표시 UI 확인
- [ ] 모바일 반응형 테스트

### 성능 테스트
- [ ] 대량 예약 데이터에서 중복 감지 성능
- [ ] UI 렌더링 성능 측정

---

## 🔄 구현 단계별 체크포인트

### Milestone 1: 백엔드 API (3-4시간 후)
- [ ] 중복 감지 쿼리 작동 확인
- [ ] API 엔드포인트 정상 응답
- [ ] Postman/curl 테스트 통과

### Milestone 2: 기본 UI (7-8시간 후)
- [ ] ConflictBadge 컴포넌트 완성
- [ ] Calendar 중복 표시 기능
- [ ] ReservationTable 하이라이트 기능

### Milestone 3: 실시간 기능 (10-11시간 후)
- [ ] AppointmentForm 실시간 체크
- [ ] 전체 기능 통합 테스트
- [ ] 버그 수정 및 최적화

### Milestone 4: 완료 (12-14시간 후)
- [ ] 모든 테스트 통과
- [ ] 문서 업데이트
- [ ] 배포 준비 완료

---

## 🚀 배포 후 모니터링

### 메트릭스
- 중복 예약 발생 빈도
- 사용자의 중복 경고 무시율
- API 응답 시간 모니터링
- UI 인터랙션 추적

### 개선 계획
- 사용자 피드백 기반 UX 개선
- 중복 예약 자동 해결 알고리즘 개발
- 디자이너별 중복 허용 정책 설정

---

**생성 일시**: 2025-09-10  
**마지막 업데이트**: 2025-09-10  
**담당자**: AI Assistant  
**리뷰어**: 미정  
**관련 이슈**: #49 (예정)