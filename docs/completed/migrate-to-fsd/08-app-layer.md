# App 계층 마이그레이션

App 계층은 FSD 아키텍처의 최상위 계층으로, 애플리케이션 초기화, 전역 상태 관리, 라우팅, 그리고 전체 애플리케이션 설정을 담당합니다.

## App 계층 구조 설계

### 현재 앱 구조 분석

**기존 파일들**:
- `src/App.tsx` - 메인 앱 컴포넌트
- `src/AppContent.tsx` - 앱의 주요 로직 및 상태 관리
- `src/AppWrapper.tsx` - 인증 래퍼
- `src/contexts/AuthContext.tsx` - 인증 컨텍스트
- `src/index.tsx` - 앱 진입점

### 새로운 App 계층 구조

```
app/
├── providers/          # 전역 프로바이더들
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── ToastProvider.tsx
│   └── index.ts
├── routing/           # 라우팅 설정 (향후 확장)
│   ├── AppRouter.tsx
│   ├── routes.tsx
│   └── index.ts
├── store/             # 전역 상태 관리
│   ├── rootStore.ts
│   ├── appSlice.ts
│   └── index.ts
├── styles/            # 전역 스타일
│   ├── globals.css
│   ├── tailwind.css
│   └── index.ts
├── config/            # 앱 설정
│   ├── constants.ts
│   ├── environment.ts
│   └── index.ts
├── App.tsx            # 메인 앱 컴포넌트
└── index.ts           # App 계층 Public API
```

## App 계층 구현

### 1. Providers (전역 프로바이더)

#### AuthProvider 마이그레이션

**src/app/providers/AuthProvider.tsx** (기존 AuthContext + AppWrapper 통합):
```typescript
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, authApi } from '~/features/authentication';
import { LoginForm } from '~/features/authentication';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated, setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          setLoading(true);
          setToken(storedToken);
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // 토큰이 유효하지 않은 경우
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sisters Salon</h1>
            <p className="text-gray-600 mt-2">관리자 로그인</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

#### ToastProvider

**src/app/providers/ToastProvider.tsx**:
```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast 렌더링 */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
```

#### Providers 통합

**src/app/providers/index.ts**:
```typescript
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
};

export { AuthProvider, ToastProvider, useToast } from './ToastProvider';
```

### 2. 전역 상태 관리

#### 앱 상태 스토어

**src/app/store/appSlice.ts**:
```typescript
import { create } from 'zustand';

interface AppState {
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

interface AppActions {
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  reset: () => void;
}

const initialState: AppState = {
  activeTab: 'reservations',
  isLoading: false,
  error: null,
  sidebarCollapsed: false,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  reset: () => set(initialState),
}));
```

### 3. 라우팅 (향후 확장 준비)

#### 기본 라우터 설정

**src/app/routing/routes.tsx**:
```typescript
import { ReservationsPage } from '~/pages/reservations';
import { CustomersPage } from '~/pages/customers';
import { DesignersPage } from '~/pages/designers';
import { BusinessHoursPage } from '~/pages/business-hours';
import { StatisticsPage } from '~/pages/statistics';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  label: string;
  id: string;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: ReservationsPage,
    label: '예약 관리',
    id: 'reservations',
  },
  {
    path: '/reservations',
    component: ReservationsPage,
    label: '예약 관리',
    id: 'reservations',
  },
  {
    path: '/customers',
    component: CustomersPage,
    label: '고객 관리',
    id: 'customers',
  },
  {
    path: '/designers',
    component: DesignersPage,
    label: '디자이너 관리',
    id: 'designers',
  },
  {
    path: '/business-hours',
    component: BusinessHoursPage,
    label: '영업시간',
    id: 'business-hours',
  },
  {
    path: '/statistics',
    component: StatisticsPage,
    label: '통계',
    id: 'statistics',
  },
];
```

#### 앱 라우터 (현재는 탭 기반, 향후 React Router로 확장)

**src/app/routing/AppRouter.tsx**:
```typescript
import React from 'react';
import { Header } from '~/widgets/header';
import { useAppStore } from '../store/appSlice';
import { routes } from './routes';

export const AppRouter: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  // 현재 활성 탭에 해당하는 컴포넌트 찾기
  const activeRoute = routes.find(route => route.id === activeTab) || routes[0];
  const ActiveComponent = activeRoute.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>
    </div>
  );
};

// 향후 React Router 도입 시 사용할 라우터 컴포넌트
export const FutureAppRouter: React.FC = () => {
  // React Router 기반 라우팅 구현
  // import { BrowserRouter, Routes, Route } from 'react-router-dom';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="" onTabChange={() => {}} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 
        <Routes>
          {routes.map(route => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<route.component />} 
            />
          ))}
        </Routes>
        */}
      </main>
    </div>
  );
};
```

### 4. 전역 스타일 및 설정

#### 전역 스타일

**src/app/styles/globals.css**:
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* 전역 스타일 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 애니메이션 */
.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 커스텀 스크롤바 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

#### 앱 설정

**src/app/config/constants.ts**:
```typescript
export const APP_CONFIG = {
  APP_NAME: 'Sisters Salon',
  VERSION: '1.0.0',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_PREFERENCES: 'userPreferences',
  },
  UI: {
    TOAST_DURATION: 5000,
    MODAL_ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
  },
  BUSINESS: {
    DEFAULT_APPOINTMENT_DURATION: 60, // 분
    MAX_APPOINTMENTS_PER_DAY: 20,
    WORKING_HOURS: {
      START: '09:00',
      END: '18:00',
    },
  },
} as const;

export const ROUTES = {
  HOME: '/',
  RESERVATIONS: '/reservations',
  CUSTOMERS: '/customers',
  DESIGNERS: '/designers',
  BUSINESS_HOURS: '/business-hours',
  STATISTICS: '/statistics',
} as const;
```

### 5. 메인 App 컴포넌트

#### App.tsx 리팩터링

**src/app/App.tsx**:
```typescript
import React from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './routing/AppRouter';
import './styles/globals.css';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
```

#### 진입점 업데이트

**src/index.tsx** 수정:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App'; // 새로운 경로
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

### 6. App 계층 Public API

**src/app/index.ts**:
```typescript
// App 컴포넌트
export { default as App } from './App';

// Providers
export { AppProviders, useToast } from './providers';

// Store
export { useAppStore } from './store/appSlice';

// Config
export { APP_CONFIG, ROUTES } from './config/constants';

// Types (필요시)
export type { RouteConfig } from './routing/routes';
```

## 마이그레이션 체크리스트

### Providers
- [ ] AuthProvider 구현 (기존 AuthContext + AppWrapper 통합)
- [ ] ToastProvider 구현 (기존 Toast 로직 통합)
- [ ] AppProviders 통합 컴포넌트 생성

### 상태 관리
- [ ] 전역 앱 상태 스토어 구현
- [ ] 탭 네비게이션 상태 관리
- [ ] 로딩 및 에러 상태 관리

### 라우팅
- [ ] 기본 탭 기반 라우터 구현
- [ ] 향후 React Router 확장을 위한 구조 준비
- [ ] 라우트 설정 정의

### 스타일 및 설정
- [ ] 전역 CSS 정리 및 통합
- [ ] 앱 설정 상수 정의
- [ ] 환경별 설정 분리

### 앱 통합
- [ ] 메인 App 컴포넌트 리팩터링
- [ ] index.tsx 진입점 업데이트
- [ ] App 계층 Public API 정의

## 검증 및 테스트

### 1. 애플리케이션 실행 테스트
```bash
# 앱이 정상적으로 실행되는지 확인
npm start
```

### 2. 인증 플로우 테스트
- [ ] 로그인 기능 정상 작동
- [ ] 토큰 기반 인증 유지
- [ ] 로그아웃 기능 정상 작동

### 3. 페이지 네비게이션 테스트
- [ ] 모든 탭 간 전환 정상 작동
- [ ] 상태 유지 및 초기화 정상 작동

### 4. 전역 기능 테스트
- [ ] Toast 알림 시스템 정상 작동
- [ ] 전역 로딩 상태 관리 정상 작동

## 성능 및 최적화 고려사항

### 코드 스플리팅
```typescript
// 향후 페이지별 지연 로딩 구현
const LazyReservationsPage = React.lazy(() => import('~/pages/reservations'));
```

### 메모이제이션
```typescript
// 무거운 계산이나 컴포넌트 최적화
const MemoizedHeader = React.memo(Header);
```

### 번들 최적화
- 사용하지 않는 라이브러리 제거
- Tree shaking 활용
- 이미지 최적화

## 다음 단계

App 계층 완료 후:

1. **기존 구조 정리** - 기존 파일들 제거
2. **최종 검증** - 전체 애플리케이션 기능 테스트
3. **문서화** - README 및 개발 가이드 업데이트

---

**다음 단계**: `09-cleanup.md`에서 정리 및 최종 검증 진행