# 🌙 다크 모드 구현

**작성일**: 2025-01-04  
**상태**: 📋 계획 중  
**우선순위**: ⭐⭐⭐ (중간)  
**예상 소요 시간**: 2-3시간

## 📋 개요

사용자가 라이트/다크 테마를 선택할 수 있는 다크 모드 기능을 구현합니다. 현재 Glassmorphism 디자인을 다크 테마에 최적화합니다.

## 🎯 목표

- 시스템 설정 자동 감지
- 수동 테마 전환 토글
- 사용자 선호도 저장
- 모든 컴포넌트 다크 모드 지원
- Glassmorphism 효과 다크 모드 최적화

## 🛠 기술 스택

- **상태 관리**: React Context API
- **저장소**: localStorage
- **스타일링**: Tailwind CSS Dark Mode
- **아이콘**: 해/달 토글 아이콘
- **애니메이션**: CSS Transitions

## ✅ 구현 작업 목록

### 1. 테마 컨텍스트 설정
- [ ] `ThemeContext.tsx` 생성
- [ ] 테마 상태 관리 (light/dark/system)
- [ ] localStorage 연동
- [ ] 시스템 테마 감지 로직

### 2. Tailwind 다크 모드 설정
- [ ] tailwind.config.js 다크 모드 활성화
- [ ] CSS 변수 설정
- [ ] 다크 모드 색상 팔레트 정의
- [ ] 전환 애니메이션 설정

### 3. 테마 토글 컴포넌트
- [ ] `ThemeToggle.tsx` 생성
- [ ] 해/달 아이콘 토글
- [ ] 애니메이션 효과
- [ ] 헤더에 통합

### 4. Glassmorphism 다크 모드 최적화
- [ ] 배경 블러 효과 조정
- [ ] 투명도 값 조정
- [ ] 테두리 색상 변경
- [ ] 그림자 효과 수정

### 5. 컴포넌트별 다크 모드 스타일
- [ ] 헤더 컴포넌트
- [ ] 예약 폼
- [ ] 예약 테이블
- [ ] 달력 컴포넌트
- [ ] 로그인 화면
- [ ] 토스트 메시지

### 6. 색상 시스템 개선
- [ ] 텍스트 색상 대비
- [ ] 배경 색상 조정
- [ ] 경계선 색상
- [ ] 호버/포커스 상태
- [ ] 에러/성공 메시지

### 7. 특수 요소 처리
- [ ] 차트 색상 (통계 대시보드용)
- [ ] 달력 이벤트 마커
- [ ] 폼 입력 필드
- [ ] 버튼 스타일
- [ ] 모달/다이얼로그

### 8. 테스트 및 최적화
- [ ] 색상 대비 접근성 테스트
- [ ] 전환 애니메이션 부드러움
- [ ] 모든 페이지 확인
- [ ] 성능 영향 측정

## 📝 구현 세부사항

### ThemeContext 구조
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

### Tailwind 설정
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f23',
          card: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#e1e7ef',
        }
      }
    }
  }
}
```

### Glassmorphism 다크 모드 스타일
```css
/* 라이트 모드 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 다크 모드 */
.dark .glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

## 🎨 디자인 가이드라인

### 다크 모드 색상 팔레트
- **배경**: #0f0f23 (진한 남색)
- **카드 배경**: rgba(255, 255, 255, 0.05)
- **텍스트 주**: #e1e7ef (밝은 회색)
- **텍스트 보조**: #9ca3af (중간 회색)
- **강조색**: #a855f7 → #ec4899 (보라-핑크 그라데이션)
- **경계선**: rgba(255, 255, 255, 0.1)

### 토글 스위치 디자인
- 위치: 헤더 우측
- 크기: 40px x 20px
- 애니메이션: 0.3s ease-in-out
- 아이콘: 🌞 (라이트) / 🌙 (다크)

### 전환 애니메이션
- 모든 색상 전환: 200ms
- 배경 블러: 즉시 적용
- 부드러운 페이드 효과

## 📊 예상 결과

- 사용자 만족도 향상 (야간 사용자)
- 눈의 피로 감소
- 배터리 절약 (OLED 디스플레이)
- 접근성 향상

## 🚨 주의사항

1. **색상 대비**: WCAG AA 기준 충족 (4.5:1)
2. **이미지 처리**: 다크 모드에서 이미지 밝기 조정
3. **차트 색상**: 다크 모드용 별도 팔레트
4. **테스트**: 두 모드 모두에서 철저한 테스트

## 🔗 참고 자료

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [다크 모드 디자인 가이드](https://material.io/design/color/dark-theme.html)
- [Glassmorphism in Dark Mode](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)
- [Web 접근성 색상 대비](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)