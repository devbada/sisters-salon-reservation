# 🌐 다국어 지원 (Internationalization)

**Priority**: 📈 Medium  
**Phase**: 3 (사용자 경험)  
**Estimated Time**: 12-16 hours  

## 📋 현재 상황

### 언어 제한
- 한국어만 지원
- 하드코딩된 텍스트
- 국제 사용자 접근성 제한

## ✅ 목표 언어

### 지원 언어
- 🇰🇷 **한국어** (기본)
- 🇺🇸 **영어** (English)  
- 🇯🇵 **일본어** (日本語)
- 🇨🇳 **중국어** (简体中文)

## 🔧 구현 방안

### 1. i18n 패키지 설치

```bash
# 클라이언트
cd salon-reservation-client
npm install react-i18next i18next i18next-browser-languagedetector

# 서버 (API 메시지용)
cd salon-reservation-server  
npm install i18next i18next-fs-backend
```

### 2. 다국어 설정 파일

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일 import
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### 3. 번역 파일 구조

```json
// src/i18n/locales/ko.json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다"
  },
  "auth": {
    "login": "로그인",
    "logout": "로그아웃",
    "username": "사용자명",
    "password": "비밀번호",
    "loginSuccess": "로그인되었습니다",
    "loginFailed": "로그인에 실패했습니다"
  },
  "reservation": {
    "title": "예약 관리",
    "create": "예약하기",
    "customerName": "고객 이름",
    "date": "날짜",
    "time": "시간",
    "stylist": "헤어 디자이너",
    "service": "서비스 유형",
    "status": {
      "pending": "대기",
      "confirmed": "확정", 
      "completed": "완료",
      "cancelled": "취소",
      "no_show": "노쇼"
    }
  },
  "navigation": {
    "reservations": "예약 관리",
    "designers": "디자이너 관리",
    "businessHours": "영업시간 관리",
    "statistics": "통계 대시보드"
  }
}
```

```json
// src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "username": "Username",
    "password": "Password",
    "loginSuccess": "Successfully logged in",
    "loginFailed": "Login failed"
  },
  "reservation": {
    "title": "Reservation Management",
    "create": "Make Reservation",
    "customerName": "Customer Name",
    "date": "Date",
    "time": "Time",
    "stylist": "Hair Designer",
    "service": "Service Type",
    "status": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "completed": "Completed", 
      "cancelled": "Cancelled",
      "no_show": "No Show"
    }
  },
  "navigation": {
    "reservations": "Reservations",
    "designers": "Designers",
    "businessHours": "Business Hours",
    "statistics": "Statistics"
  }
}
```

### 4. 컴포넌트에서 사용

```typescript
// components/Header.tsx
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <header>
      <h1>{t('reservation.title')}</h1>
      <button>{t('auth.logout')}</button>
    </header>
  );
};
```

### 5. 언어 선택기 컴포넌트

```typescript
// components/LanguageSelector.tsx
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' }
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };
  
  return (
    <div className="relative">
      <button className="flex items-center space-x-2 p-2 rounded">
        <span>{languages.find(lang => lang.code === i18n.language)?.flag}</span>
        <span>{languages.find(lang => lang.code === i18n.language)?.name}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
        {languages.map(language => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2
              ${i18n.language === language.code ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 6. 날짜/시간 현지화

```typescript
// utils/dateLocalization.ts
import { format } from 'date-fns';
import { ko, enUS, ja, zhCN } from 'date-fns/locale';

const localeMap = {
  ko: ko,
  en: enUS,
  ja: ja,
  zh: zhCN
};

export const formatDate = (date: Date, formatStr: string, language: string) => {
  const locale = localeMap[language as keyof typeof localeMap] || ko;
  return format(date, formatStr, { locale });
};

// 사용 예시
const { i18n } = useTranslation();
const formattedDate = formatDate(new Date(), 'PPP', i18n.language);
```

### 7. 서버 API 메시지 다국어화

```javascript
// server/i18n/index.js
const i18n = require('i18next');
const Backend = require('i18next-fs-backend');

i18n
  .use(Backend)
  .init({
    lng: 'ko',
    fallbackLng: 'ko',
    backend: {
      loadPath: './i18n/locales/{{lng}}.json'
    }
  });

module.exports = i18n;
```

```javascript
// routes/auth.js - 에러 메시지 다국어화
const i18n = require('../i18n');

router.post('/login', (req, res) => {
  // 클라이언트 언어 확인
  const clientLang = req.headers['accept-language']?.split(',')[0] || 'ko';
  i18n.changeLanguage(clientLang);
  
  try {
    // ... 로그인 로직
    res.json({ message: i18n.t('auth.loginSuccess') });
  } catch (error) {
    res.status(401).json({ error: i18n.t('auth.loginFailed') });
  }
});
```

## 🔧 구현 단계

### Step 1: 기본 설정
- [ ] react-i18next 패키지 설치
- [ ] i18n 설정 파일 생성
- [ ] 언어 감지 및 저장 기능
- [ ] 폴백 언어 설정

### Step 2: 번역 파일 생성
- [ ] 한국어 기본 번역 파일
- [ ] 영어 번역 파일
- [ ] 일본어 번역 파일  
- [ ] 중국어 번역 파일

### Step 3: 컴포넌트 다국어화
- [ ] 모든 하드코딩된 텍스트 추출
- [ ] useTranslation 훅 적용
- [ ] 언어 선택기 컴포넌트
- [ ] 헤더에 언어 선택기 추가

### Step 4: 고급 현지화
- [ ] 날짜/시간 형식 현지화
- [ ] 숫자 형식 현지화
- [ ] 통화 표시 현지화
- [ ] RTL 언어 지원 (필요시)

### Step 5: 서버 API 다국어화
- [ ] 서버 i18n 설정
- [ ] API 응답 메시지 다국어화
- [ ] 클라이언트 언어 헤더 감지

## 📊 번역 관리

### 번역 파일 구조
```
src/i18n/locales/
├── ko.json          # 한국어 (기준)
├── en.json          # 영어
├── ja.json          # 일본어
└── zh.json          # 중국어
```

### 번역 키 네이밍 규칙
- 페이지별 그룹화: `reservation.title`, `auth.login`
- 공통 요소: `common.save`, `common.error`
- 중첩 구조: `status.pending`, `navigation.home`

## 🧪 테스트 시나리오

```typescript
// tests/i18n.test.tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

describe('Internationalization', () => {
  test('should render Korean text by default', () => {
    i18n.changeLanguage('ko');
    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );
    expect(getByText('예약 관리')).toBeInTheDocument();
  });

  test('should render English text when language changed', () => {
    i18n.changeLanguage('en');
    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );
    expect(getByText('Reservation Management')).toBeInTheDocument();
  });
});
```

## 📊 완료 기준

### 필수 요구사항
- ✅ 4개 언어 완전 번역
- ✅ 언어 선택 및 저장 기능
- ✅ 모든 UI 텍스트 다국어화
- ✅ 날짜/시간 현지화

### 품질 체크리스트
- [ ] 번역 누락 항목 없음
- [ ] 문맥에 맞는 자연스러운 번역
- [ ] 언어별 UI 레이아웃 깨짐 없음
- [ ] 브라우저 언어 자동 감지

## 🔄 후속 작업

1. **번역 관리 시스템** → `todo/tools-translation-management.md`
2. **RTL 언어 지원** → `todo/feature-rtl-support.md`
3. **지역별 기능** → `todo/feature-localization.md`

---

**Created**: 2025-09-06  
**Status**: 📋 Ready to Start  
**Dependencies**: 기본 UI 완성  
**Assignee**: TBD