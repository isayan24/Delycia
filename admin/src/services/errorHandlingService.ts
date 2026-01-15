
import sessionService from "./sessionService";
import { toast } from "sonner";

export interface AuthError {
  type: 'NETWORK_ERROR' | 'TOKEN_EXPIRED' | 'INVALID_SESSION' | 'REFRESH_FAILED' | 'CORRUPTED_COOKIE';
  message: string;
  originalError?: any;
  recoverable: boolean;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 5;
  private retryDelay = 1000; // Start with 1 second

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle authentication errors with appropriate recovery strategies
   */
  handleAuthError(error: AuthError): boolean {
    console.error(`Auth Error [${error.type}]:`, error.message, error.originalError);

    switch (error.type) {
      case 'CORRUPTED_COOKIE':
        return this.handleCorruptedCookie(error);
      
      case 'TOKEN_EXPIRED':
        return this.handleTokenExpired(error);
      
      case 'REFRESH_FAILED':
        return this.handleRefreshFailed(error);
      
      case 'INVALID_SESSION':
        return this.handleInvalidSession(error);
      
      case 'NETWORK_ERROR':
        return this.handleNetworkError(error);
      
      default:
        return this.handleGenericError(error);
    }
  }

  /**
   * Handle corrupted or invalid cookies
   */
  private handleCorruptedCookie(error: AuthError): boolean {
    console.log('Handling corrupted cookie...');
    
    // Clear corrupted session data
    sessionService.clearSession();
    
    // Show user-friendly message
    toast.error('Session data was corrupted. Please log in again.');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/user/login';
      }
    }, 2000);
    
    return false; // Not recoverable
  }

  /**
   * Handle expired tokens
   */
  private handleTokenExpired(error: AuthError): boolean {
    console.log('Handling expired token...');
    
    // This should be handled by token service, but if it reaches here
    // it means refresh also failed
    sessionService.clearSession();
    
    toast.error('Your session has expired. Please log in again.');
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }, 2000);
    
    return false; // Not recoverable at this point
  }

  /**
   * Handle failed token refresh
   */
  private handleRefreshFailed(error: AuthError): boolean {
    console.log('Handling refresh failure...');
    
    const retryKey = 'token_refresh';
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts < this.maxRetries) {
      // Increment retry count
      this.retryAttempts.set(retryKey, attempts + 1);
      
      // Show retry message
      toast.error(`Failed to refresh session. Retrying... (${attempts + 1}/${this.maxRetries})`);
      
      // Exponential backoff retry
      const delay = this.retryDelay * Math.pow(2, attempts);
      
      setTimeout(async () => {
        try {
          const tokenService = (await import('./tokenService')).default;
          const success = await tokenService.refreshTokens();
          
          if (success) {
            this.retryAttempts.delete(retryKey);
            toast.success('Session refreshed successfully');
          } else {
            // If still failing, try again or give up
            this.handleRefreshFailed(error);
          }
        } catch (retryError) {
          this.handleRefreshFailed({
            ...error,
            originalError: retryError
          });
        }
      }, delay);
      
      return true; // Attempting recovery
    } else {
      // Max retries reached
      this.retryAttempts.delete(retryKey);
      sessionService.clearSession();
      
      toast.error('Unable to refresh your session. Please log in again.');
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 2000);
      
      return false; // Not recoverable
    }
  }

  /**
   * Handle invalid session data
   */
  private handleInvalidSession(error: AuthError): boolean {
    console.log('Handling invalid session...');
    
    // Clear invalid session
    sessionService.clearSession();
    
    // Don't show error for invalid session as it might be normal (e.g., first visit)
    // Just redirect to login if on protected route
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const protectedPaths = ['/user/p', '/dashboard', '/admin'];
      
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        toast.info('Please log in to continue');
        window.location.href = '/login';
      }
    }
    
    return false; // Not recoverable
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(error: AuthError): boolean {
    console.log('Handling network error...');
    
    const retryKey = 'network_request';
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(retryKey, attempts + 1);
      
      toast.error(`Network error. Retrying... (${attempts + 1}/${this.maxRetries})`);
      
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempts);
      
      setTimeout(() => {
        // The calling code should retry the original request
        this.retryAttempts.delete(retryKey);
      }, delay);
      
      return true; // Attempting recovery
    } else {
      this.retryAttempts.delete(retryKey);
      toast.error('Network error persists. Please check your connection and try again.');
      return false; // Not recoverable
    }
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: AuthError): boolean {
    console.log('Handling generic error...');
    
    toast.error(error.message || 'An authentication error occurred');
    
    if (!error.recoverable) {
      sessionService.clearSession();
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 2000);
    }
    
    return error.recoverable;
  }

  /**
   * Create an AuthError from various error types
   */
  createAuthError(
    type: AuthError['type'],
    message: string,
    originalError?: any,
    recoverable: boolean = false
  ): AuthError {
    return {
      type,
      message,
      originalError,
      recoverable
    };
  }

  /**
   * Handle API response errors
   */
  handleApiError(error: any): AuthError | null {
    if (!error.response) {
      // Network error
      return this.createAuthError(
        'NETWORK_ERROR',
        'Network connection failed',
        error,
        true
      );
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        if (data?.message?.includes('token') || data?.message?.includes('expired')) {
          return this.createAuthError(
            'TOKEN_EXPIRED',
            'Your session has expired',
            error,
            false
          );
        }
        return this.createAuthError(
          'INVALID_SESSION',
          'Authentication failed',
          error,
          false
        );

      case 403:
        return this.createAuthError(
          'INVALID_SESSION',
          'Access denied',
          error,
          false
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return this.createAuthError(
          'NETWORK_ERROR',
          'Server error occurred',
          error,
          true
        );

      default:
        return null; // Not an auth error
    }
  }

  /**
   * Reset retry attempts for a specific key
   */
  resetRetries(key: string): void {
    this.retryAttempts.delete(key);
  }

  /**
   * Clear all retry attempts
   */
  clearAllRetries(): void {
    this.retryAttempts.clear();
  }

  /**
   * Check if currently retrying a specific operation
   */
  isRetrying(key: string): boolean {
    return this.retryAttempts.has(key);
  }
}

export default ErrorHandlingService.getInstance();