
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class DashboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // like Sentry, LogRocket, or Bugsnag
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Example: Send to error tracking service
      // errorTrackingService.captureException(errorData);
      
      console.error('Error logged to service:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-red-200">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Error</h1>
                  <p className="text-gray-600">Something went wrong while loading the dashboard</p>
                </div>
              </div>

              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Details</h3>
                <p className="text-red-700 text-sm font-mono">
                  {error?.message || 'An unexpected error occurred'}
                </p>
                {process.env.NODE_ENV === 'development' && error?.stack && (
                  <details className="mt-3">
                    <summary className="text-red-600 cursor-pointer hover:text-red-800">
                      Show Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Retry Information */}
              {retryCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    Retry attempt {retryCount} of {this.maxRetries}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                )}

                <button
                  onClick={this.handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Dashboard</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Home</span>
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  What can you do?
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Try refreshing the page or clicking Try Again</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>

              {/* Development Info */}
              {process.env.NODE_ENV === 'development' && errorInfo && (
                <details className="mt-6">
                  <summary className="text-gray-600 cursor-pointer hover:text-gray-800 font-medium">
                    Component Stack (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {errorInfo.componentStack}
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

export default DashboardErrorBoundary;