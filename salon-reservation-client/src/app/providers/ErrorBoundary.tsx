import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: string) => ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });

    // 에러 로깅 서비스에 전송 (예: Sentry, LogRocket 등)
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.state.errorInfo || '');
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="glass-card p-8">
              <div className="text-8xl mb-6">💔</div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                앗, 뭔가 잘못되었어요!
              </h1>
              
              <p className="text-gray-600 mb-6">
                예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
              </p>

              <div className="space-y-4 mb-6">
                <button
                  onClick={this.handleReload}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  🔄 페이지 새로고침
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  🏠 홈으로 돌아가기
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 p-4 rounded-lg border border-red-200">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    🔍 개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <div className="text-sm">
                    <p className="font-medium text-red-700 mb-2">오류 메시지:</p>
                    <pre className="bg-red-100 p-2 rounded text-xs overflow-auto mb-4">
                      {this.state.error.message}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <p className="font-medium text-red-700 mb-2">스택 트레이스:</p>
                        <pre className="bg-red-100 p-2 rounded text-xs overflow-auto">
                          {this.state.errorInfo}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <p className="text-xs text-gray-500 mt-4">
                문제가 지속되면 관리자에게 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC로 사용할 수 있는 헬퍼 함수
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, errorInfo: string) => ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};