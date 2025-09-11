import { applyThemeToCSS } from '../config';
import { initAnalytics } from './analytics';

// 애플리케이션 초기화 함수들
export const initializeApp = async () => {
  console.log('🚀 애플리케이션 초기화 중...');
  
  try {
    // 1. 테마 적용
    await initializeTheme();
    
    // 2. 분석 서비스 초기화
    await initializeAnalytics();
    
    // 3. 전역 설정 적용
    await applyGlobalSettings();
    
    // 4. 서비스 워커 등록 (PWA 지원)
    await initializeServiceWorker();
    
    // 5. 에러 모니터링 설정
    await initializeErrorMonitoring();
    
    console.log('✅ 애플리케이션 초기화 완료');
    
  } catch (error) {
    console.error('❌ 애플리케이션 초기화 실패:', error);
    throw error;
  }
};

// 테마 초기화
const initializeTheme = async () => {
  console.log('🎨 테마 초기화 중...');
  
  try {
    // CSS 변수 적용
    applyThemeToCSS();
    
    // 저장된 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // 다크모드 감지 (미래 확장용)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!savedTheme && prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    console.log('✅ 테마 초기화 완료');
  } catch (error) {
    console.error('❌ 테마 초기화 실패:', error);
  }
};

// 분석 서비스 초기화
const initializeAnalytics = async () => {
  console.log('📊 분석 서비스 초기화 중...');
  
  try {
    initAnalytics();
    console.log('✅ 분석 서비스 초기화 완료');
  } catch (error) {
    console.error('❌ 분석 서비스 초기화 실패:', error);
  }
};

// 전역 설정 적용
const applyGlobalSettings = async () => {
  console.log('⚙️ 전역 설정 적용 중...');
  
  try {
    // 언어 설정
    const savedLanguage = localStorage.getItem('language') || 'ko';
    document.documentElement.lang = savedLanguage;
    
    // 메타 태그 설정
    updateMetaTags();
    
    // 전역 CSS 클래스 적용
    document.body.classList.add('salon-app');
    
    console.log('✅ 전역 설정 적용 완료');
  } catch (error) {
    console.error('❌ 전역 설정 적용 실패:', error);
  }
};

// 메타 태그 업데이트
const updateMetaTags = () => {
  // 뷰포트 설정
  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
  
  // 설명 설정
  let description = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!description) {
    description = document.createElement('meta');
    description.name = 'description';
    document.head.appendChild(description);
  }
  description.content = '헤어 살롱 예약 시스템 관리자 대시보드';
  
  // 테마 색상 설정
  let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!themeColor) {
    themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.appendChild(themeColor);
  }
  themeColor.content = '#a855f7'; // Primary purple color
};

// 서비스 워커 초기화 (PWA 지원)
const initializeServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    console.log('🔧 서비스 워커 등록 중...');
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ 서비스 워커 등록 완료:', registration);
      
      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        console.log('🔄 서비스 워커 업데이트 발견');
      });
      
    } catch (error) {
      console.error('❌ 서비스 워커 등록 실패:', error);
    }
  }
};

// 에러 모니터링 초기화
const initializeErrorMonitoring = async () => {
  console.log('🛡️ 에러 모니터링 초기화 중...');
  
  try {
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error);
      // 에러 리포팅 서비스로 전송 (Sentry, Bugsnag 등)
    });
    
    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // 에러 리포팅 서비스로 전송
    });
    
    console.log('✅ 에러 모니터링 초기화 완료');
  } catch (error) {
    console.error('❌ 에러 모니터링 초기화 실패:', error);
  }
};

// 애플리케이션 정리 함수
export const cleanupApp = () => {
  console.log('🧹 애플리케이션 정리 중...');
  
  try {
    // 이벤트 리스너 제거
    // 타이머 정리
    // 구독 해제 등
    
    console.log('✅ 애플리케이션 정리 완료');
  } catch (error) {
    console.error('❌ 애플리케이션 정리 실패:', error);
  }
};

// 성능 모니터링
export const trackPerformanceMetrics = () => {
  // Performance API 사용
  if ('performance' in window) {
    // 페이지 로드 시간
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('📈 페이지 로드 성능:', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          });
        }
      }, 0);
    });
  }
};