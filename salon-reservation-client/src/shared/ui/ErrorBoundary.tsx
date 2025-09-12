import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '~/shared/lib/store/errorStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(
      error.message,
      `Component Stack: ${errorInfo.componentStack}`,
      error.name,
      false
    );
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-96 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="glass-card p-8">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                문제가 발생했습니다
              </h2>
              <p className="text-gray-600 mb-6">
                애플리케이션에서 예상치 못한 오류가 발생했습니다.
                페이지를 새로고침하거나 관리자에게 문의해주세요.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  🔄 페이지 새로고침
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  🔙 다시 시도
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    기술적 세부사항 (개발용)
                  </summary>
                  <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}