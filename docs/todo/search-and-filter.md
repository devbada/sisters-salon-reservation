# 🔍 예약 검색 및 필터링 기능

**작성일**: 2025-01-04  
**상태**: 📋 계획 중  
**우선순위**: ⭐⭐⭐⭐⭐ (최우선)  
**예상 소요 시간**: 2-3시간

## 📋 개요

예약 목록에서 고객 이름, 스타일리스트, 서비스 종류로 검색하고 필터링할 수 있는 기능을 구현합니다.

## 🎯 목표

- 실시간 검색 기능 제공
- 다중 필터 적용 가능
- 날짜 범위 선택 기능
- 검색 결과 하이라이트
- 빠른 검색 성능 (debounced search)

## 🛠 기술 스택

- **검색 로직**: React Hooks (useState, useEffect, useMemo)
- **Debouncing**: lodash.debounce 또는 커스텀 훅
- **스타일링**: Tailwind CSS + Glassmorphism
- **아이콘**: React Icons 또는 이모지

## ✅ 구현 작업 목록

### 1. 컴포넌트 설계
- [ ] `SearchFilter.tsx` 컴포넌트 생성
- [ ] TypeScript 인터페이스 정의
- [ ] Props 및 상태 관리 설계

### 2. 검색 기능 구현
- [ ] 고객 이름 검색 필드
- [ ] 실시간 검색 (onChange 이벤트)
- [ ] Debounce 적용 (300ms)
- [ ] 대소문자 구분 없는 검색

### 3. 필터 기능 구현
- [ ] 스타일리스트 선택 드롭다운
- [ ] 서비스 종류 선택 드롭다운
- [ ] 날짜 범위 선택 (시작일-종료일)
- [ ] 필터 초기화 버튼

### 4. 검색 결과 처리
- [ ] 검색어 하이라이트 기능
- [ ] 검색 결과 개수 표시
- [ ] "결과 없음" 메시지
- [ ] 검색 중 로딩 상태

### 5. 성능 최적화
- [ ] useMemo로 필터링 결과 캐싱
- [ ] useCallback으로 함수 재생성 방지
- [ ] 가상 스크롤링 (결과 많을 경우)

### 6. UI/UX 개선
- [ ] Glassmorphism 스타일 적용
- [ ] 반응형 디자인
- [ ] 키보드 단축키 (Ctrl+F)
- [ ] 검색 히스토리 (선택사항)

### 7. 서버 통합
- [ ] 서버 사이드 검색 API 엔드포인트
- [ ] 쿼리 파라미터 처리
- [ ] 페이지네이션 (선택사항)

### 8. 테스트
- [ ] 검색 정확도 테스트
- [ ] 필터 조합 테스트
- [ ] 성능 테스트 (대량 데이터)
- [ ] 엣지 케이스 처리

## 📝 구현 세부사항

### SearchFilter 컴포넌트 Props
```typescript
interface SearchFilterProps {
  reservations: AppointmentData[];
  onFilteredResults: (filtered: AppointmentData[]) => void;
  stylists: string[];
  serviceTypes: string[];
}

interface FilterState {
  searchTerm: string;
  selectedStylist: string;
  selectedService: string;
  startDate: string;
  endDate: string;
}
```

### 주요 기능 플로우
1. **검색어 입력** → Debounce → 필터링 → 결과 업데이트
2. **필터 선택** → 즉시 필터링 → 결과 업데이트
3. **날짜 범위** → 유효성 검사 → 필터링 → 결과 업데이트

## 🎨 디자인 가이드라인

### 레이아웃
- 검색 바: 상단 중앙, 전체 너비
- 필터 옵션: 검색 바 아래, 가로 배치
- 결과 카운터: 좌측 상단
- 초기화 버튼: 우측 상단

### 색상 및 스타일
- 검색 바: Glass 효과 + 보라색 포커스
- 필터 드롭다운: Glass 카드 스타일
- 하이라이트: 노란색 배경 (bg-yellow-200)
- 버튼: 그라데이션 호버 효과

## 📊 예상 결과

- 검색 속도: <100ms (클라이언트 사이드)
- 사용자 만족도: 예약 찾기 시간 80% 단축
- 코드 재사용성: 다른 목록에도 적용 가능

## 🚨 주의사항

1. **성능**: 예약이 1000개 이상일 때도 빠른 응답
2. **접근성**: 키보드 네비게이션 지원
3. **호환성**: 기존 예약 테이블과 원활한 통합
4. **상태 관리**: URL 파라미터와 동기화 (선택사항)

## 🔗 참고 자료

- [React 검색 구현 베스트 프랙티스](https://react.dev/learn)
- [Debounce vs Throttle](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [현재 프로젝트 구조](../completed/)