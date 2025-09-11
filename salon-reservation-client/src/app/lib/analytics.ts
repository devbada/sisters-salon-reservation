import { ENV } from '../config';

// 분석 이벤트 타입 정의
export interface AnalyticsEvent {
  name: string;
  category: 'user_action' | 'system_event' | 'error' | 'performance';
  properties?: Record<string, any>;
  timestamp?: number;
}

// 사용자 액션 추적
export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  const event: AnalyticsEvent = {
    name: action,
    category: 'user_action',
    properties,
    timestamp: Date.now(),
  };
  
  sendAnalyticsEvent(event);
};

// 시스템 이벤트 추적
export const trackSystemEvent = (event: string, properties?: Record<string, any>) => {
  const analyticsEvent: AnalyticsEvent = {
    name: event,
    category: 'system_event',
    properties,
    timestamp: Date.now(),
  };
  
  sendAnalyticsEvent(analyticsEvent);
};

// 오류 추적
export const trackError = (error: Error, context?: Record<string, any>) => {
  const event: AnalyticsEvent = {
    name: 'error_occurred',
    category: 'error',
    properties: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    },
    timestamp: Date.now(),
  };
  
  sendAnalyticsEvent(event);
  
  // 개발 환경에서는 콘솔에도 출력
  if (ENV.IS_DEVELOPMENT) {
    console.error('Analytics Error:', error, context);
  }
};

// 성능 메트릭 추적
export const trackPerformance = (metric: string, value: number, unit?: string) => {
  const event: AnalyticsEvent = {
    name: 'performance_metric',
    category: 'performance',
    properties: {
      metric,
      value,
      unit,
    },
    timestamp: Date.now(),
  };
  
  sendAnalyticsEvent(event);
};

// 페이지 뷰 추적
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  const event: AnalyticsEvent = {
    name: 'page_view',
    category: 'user_action',
    properties: {
      page: pageName,
      url: window.location.pathname,
      referrer: document.referrer,
      ...properties,
    },
    timestamp: Date.now(),
  };
  
  sendAnalyticsEvent(event);
};

// 분석 이벤트 전송
const sendAnalyticsEvent = async (event: AnalyticsEvent) => {
  // 프로덕션 환경에서만 전송
  if (!ENV.IS_PRODUCTION) {
    if (ENV.IS_DEVELOPMENT) {
      console.log('Analytics Event:', event);
    }
    return;
  }
  
  try {
    // 여기서 실제 분석 서비스(Google Analytics, Mixpanel 등)로 전송
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
    
    // 또는 서드파티 서비스 직접 호출
    // gtag('event', event.name, event.properties);
    // mixpanel.track(event.name, event.properties);
    
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
};

// 세션 관련 유틸리티
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
};

// 사용자 ID 관련 유틸리티 (개인정보 보호 고려)
export const getUserId = (): string | null => {
  // 실제로는 해시된 값이나 익명 ID를 사용해야 함
  return localStorage.getItem('user_id');
};

// 분석 서비스 초기화
export const initAnalytics = () => {
  // 세션 시작 추적
  trackSystemEvent('session_start', {
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });
  
  // 페이지 가시성 추적
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackSystemEvent('page_hidden');
    } else {
      trackSystemEvent('page_visible');
    }
  });
  
  // 언로드 시 세션 종료 추적
  window.addEventListener('beforeunload', () => {
    trackSystemEvent('session_end');
  });
  
  // 전역 에러 핸들러 추가
  window.addEventListener('error', (event) => {
    trackError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  
  // Promise rejection 핸들러 추가
  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandled_promise_rejection' }
    );
  });
};