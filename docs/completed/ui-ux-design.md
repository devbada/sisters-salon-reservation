---
# UI/UX 디자인 시스템 (UI/UX Design)

## Status
- [x] 완성

## Description
헤어 살롱 예약 시스템의 사용자 인터페이스와 사용자 경험을 담당하는 디자인 시스템입니다. Tailwind CSS를 기반으로 한 반응형 디자인과 한국어 인터페이스를 제공합니다.

## Implementation Details
### 디자인 시스템
- **프레임워크**: Tailwind CSS
- **설정 파일**: `salon-reservation-client/tailwind.config.js`
- **스타일 접근법**: 유틸리티 클래스 기반

### 핵심 컴포넌트 스타일링
#### 1. 메인 애플리케이션
- **위치**: `salon-reservation-client/src/App.tsx`
- **스타일링**:
  - 헤더: `text-3xl font-bold mb-6` (큰 제목)
  - 레이아웃: `py-8` (수직 패딩)
  - 컨테이너: 중앙 정렬 레이아웃

#### 2. 예약 폼 (AppointmentForm)
- **카드 스타일**: `max-w-md mx-auto bg-white p-8 rounded-lg shadow-md`
- **입력 필드**: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`
- **버튼 스타일**: 
  - 기본: `bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md`
  - 취소: `bg-gray-500 hover:bg-gray-600`
- **레이블**: `block text-gray-700 text-sm font-bold mb-2`

#### 3. 예약 테이블 (ReservationTable)
- **컨테이너**: `max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md`
- **테이블**: `min-w-full bg-white border border-gray-200`
- **헤더**: `bg-gray-100`
- **행 호버**: `hover:bg-gray-50`
- **버튼**:
  - 수정: `bg-blue-500 hover:bg-blue-600`
  - 삭제: `bg-red-500 hover:bg-red-600`

### 반응형 디자인
- **브레이크포인트**: Tailwind 기본 설정 사용
- **테이블 스크롤**: `overflow-x-auto` (모바일 대응)
- **최대 너비 제한**: 컨텐츠별 적절한 `max-w-*` 클래스
- **중앙 정렬**: `mx-auto` 일관 사용

### 색상 팔레트
- **Primary**: Blue-500/600 (파랑)
- **Secondary**: Gray-500/600 (회색)  
- **Danger**: Red-500/600 (빨강)
- **Neutral**: Gray-100/200/300/700 (회색 계열)
- **Background**: White (흰색)

### 타이포그래피
- **제목**: `text-3xl font-bold` (메인), `text-2xl font-bold` (섹션)
- **라벨**: `text-sm font-bold`
- **본문**: 기본 크기
- **색상**: `text-gray-700`, `text-gray-800`, `text-white`

## Requirements
### 디자인 원칙
1. **일관성**: 모든 컴포넌트에서 동일한 스타일 패턴 사용
2. **접근성**: 적절한 대비율과 포커스 표시
3. **반응형**: 모바일부터 데스크탑까지 최적화
4. **직관성**: 한국어 인터페이스로 사용자 친화적

### UI 컴포넌트 요구사항
1. **카드 레이아웃**: 그림자와 둥근 모서리
2. **입력 필드**: 포커스 시 파란 링 표시
3. **버튼**: 호버 시 색상 변화
4. **테이블**: 줄무늬와 호버 효과
5. **애니메이션**: 부드러운 전환 효과

### 한국어 인터페이스
- 모든 라벨과 메시지 한국어 제공
- 문화적으로 적절한 용어 사용
- 명확하고 이해하기 쉬운 표현

## Dependencies
### 기술적 의존성
- **Tailwind CSS**: 스타일링 프레임워크
- **PostCSS**: CSS 후처리
- **Autoprefixer**: 브라우저 호환성

### 폰트 및 아이콘
- **폰트**: 시스템 기본 폰트 스택 사용
- **아이콘**: 현재 미사용 (텍스트 기반)

### 연관 기능
- 모든 React 컴포넌트의 스타일링
- 사용자 상호작용 피드백
- 반응형 레이아웃

## TODO
### 완료된 항목
- ✅ Tailwind CSS 설정 완료
- ✅ 카드 기반 레이아웃 구현
- ✅ 폼 스타일링 완료
- ✅ 테이블 스타일링 완료
- ✅ 버튼 시스템 구현
- ✅ 반응형 디자인 적용
- ✅ 한국어 인터페이스 완성
- ✅ 색상 일관성 확보
- ✅ 호버/포커스 효과 구현

## Playwright Testing
- [x] UI 렌더링 검사
- [x] 기능 동작 테스트  
- [x] 반응형 레이아웃 검증
- [x] 접근성 검사
- [x] 콘솔 에러 확인

## Issues Found & Resolved
모든 UI/UX 요소가 정상적으로 작동하며 별도 이슈 없음