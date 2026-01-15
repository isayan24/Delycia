import { AxiosError } from 'axios';

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  isRetryable: boolean;
  userMessage: string;
}

export class DashboardErrorHandler {
  static handleApiError(error: any): ErrorDetails {
    // Handle Axios errors
    if (error.isAxiosError || error.response) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;
      const responseData = axiosError.response?.data as any;

      switch (statusCode) {
        case 400:
          return {
            message: responseData?.message || 'Bad request',
            code: 'BAD_REQUEST',
            statusCode: 400,
            isRetryable: false,
            userMessage: 'Invalid request. Please check your input and try again.'
          };

        case 401:
          return {
            message: 'Authentication failed',
            code: 'UNAUTHORIZED',
            statusCode: 401,
            isRetryable: false,
            userMessage: 'Your session has expired. Please log in again.'
          };

        case 403:
          return {
            message: 'Access denied',
            code: 'FORBIDDEN',
            statusCode: 403,
            isRetryable: false,
            userMessage: 'You don\'t have permission to access this data.'
          };

        case 404:
          return {
            message: 'Resource not found',
            code: 'NOT_FOUND',
            statusCode: 404,
            isRetryable: false,
            userMessage: 'The requested data could not be found.'
          };

        case 429:
          return {
            message: 'Too many requests',
            code: 'RATE_LIMITED',
            statusCode: 429,
            isRetryable: true,
            userMessage: 'Too many requests. Please wait a moment and try again.'
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            message: 'Server error',
            code: 'SERVER_ERROR',
            statusCode: statusCode || 500,
            isRetryable: true,
            userMessage: 'Server error. Please try again in a few moments.'
          };

        default:
          return {
            message: responseData?.message || 'Unknown API error',
            code: 'UNKNOWN_API_ERROR',
            statusCode: statusCode || 0,
            isRetryable: true,
            userMessage: 'Something went wrong. Please try again.'
          };
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        message: 'Network connection failed',
        code: 'NETWORK_ERROR',
        isRetryable: true,
        userMessage: 'Network error. Please check your internet connection and try again.'
      };
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT',
        isRetryable: true,
        userMessage: 'Request timed out. Please try again.'
      };
    }

    // Handle abort errors (cancelled requests)
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        message: 'Request was cancelled',
        code: 'CANCELLED',
        isRetryable: false,
        userMessage: 'Request was cancelled.'
      };
    }

    // Handle generic errors
    return {
      message: error.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      isRetryable: false,
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  static shouldRetry(error: ErrorDetails, retryCount: number, maxRetries: number = 3): boolean {
    if (retryCount >= maxRetries) {
      return false;
    }

    return error.isRetryable;
  }

  static getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  }

  static logError(error: ErrorDetails, context?: Record<string, any>): void {
    const errorLog = {
      ...error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error:', errorLog);
    }

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(errorLog);
    }
  }
}

// Retry utility with exponential backoff
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorDetails = DashboardErrorHandler.handleApiError(error);

        // Log the error
        DashboardErrorHandler.logError(errorDetails, {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          context
        });

        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === maxRetries || !errorDetails.isRetryable) {
          throw error;
        }

        // Wait before retrying
        const delay = DashboardErrorHandler.getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Error notification utility
export interface ErrorNotification {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export class ErrorNotificationHandler {
  static createNotification(error: ErrorDetails, context?: string): ErrorNotification {
    const isRetryable = error.isRetryable;
    
    return {
      title: this.getErrorTitle(error),
      message: error.userMessage,
      type: error.statusCode === 401 ? 'warning' : 'error',
      duration: isRetryable ? 8000 : 5000,
      actions: isRetryable ? [
        {
          label: 'Retry',
          action: () => {
            // This would be handled by the component
            console.log('Retry action triggered');
          }
        }
      ] : undefined
    };
  }

  private static getErrorTitle(error: ErrorDetails): string {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Authentication Required';
      case 'FORBIDDEN':
        return 'Access Denied';
      case 'NOT_FOUND':
        return 'Data Not Found';
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'TIMEOUT':
        return 'Request Timeout';
      case 'RATE_LIMITED':
        return 'Rate Limited';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'Error';
    }
  }
}