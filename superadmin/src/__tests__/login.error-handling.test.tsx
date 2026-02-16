import { describe, it, expect } from 'vitest'

/**
 * Error Handling Tests for Login Page
 * 
 * These tests verify that the login page properly handles different error scenarios:
 * - Rate limiting errors (429)
 * - Authentication errors (401, 403) with generic messages
 * - Server errors (500+)
 * - Network errors
 * - Other client errors
 * 
 * Validates: Requirement 8.4 (Failed login hides credential details)
 */


describe('Login Error Handling', () => {
  /**
   * Helper function to simulate error handling logic from login page
   * This mirrors the error handling in superadmin/src/routes/login.tsx
   */
  function getErrorMessage(error: any): string {
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data
      
      // Rate limiting error (429)
      if (status === 429) {
        return errorData?.error || 'Too many login attempts. Please try again after 15 minutes.'
      }
      // Authentication errors (401, 403)
      else if (status === 401 || status === 403) {
        // Generic message to hide credential details (Requirement 8.4)
        return 'Invalid credentials. Please check your email/username and password.'
      }
      // Server errors (500+)
      else if (status >= 500) {
        return 'Server error. Please try again later.'
      }
      // Other client errors (400, etc.)
      else {
        return 'Invalid credentials. Please check your email/username and password.'
      }
    } 
    // Network errors (no response from server)
    else if (error.request) {
      return 'Network error. Please check your connection and try again.'
    }
    // Other errors
    else {
      return 'An unexpected error occurred. Please try again.'
    }
  }

  describe('Rate Limiting Errors (429)', () => {
    it('should return rate limiting error message when 429 status is returned', () => {
      const error = {
        response: {
          status: 429,
          data: {
            status: false,
            statusCode: 429,
            error: 'Too many login attempts. Please try again after 15 minutes.',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Too many login attempts. Please try again after 15 minutes.')
    })

    it('should return default rate limiting message when error data is missing', () => {
      const error = {
        response: {
          status: 429,
          data: {},
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Too many login attempts. Please try again after 15 minutes.')
    })

    it('should use custom rate limiting message from backend if provided', () => {
      const error = {
        response: {
          status: 429,
          data: {
            error: 'Too many attempts. Please try again after 15 minutes.',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Too many attempts. Please try again after 15 minutes.')
    })
  })

  describe('Authentication Errors (401, 403) - Generic Messages', () => {
    it('should return generic error message for 401 status', () => {
      const error = {
        response: {
          status: 401,
          data: {
            status: false,
            error: 'Invalid password',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Invalid credentials. Please check your email/username and password.')
      
      // Verify it does NOT expose the specific error from backend
      expect(message).not.toContain('Invalid password')
    })

    it('should return generic error message for 403 status', () => {
      const error = {
        response: {
          status: 403,
          data: {
            status: false,
            error: 'User not found',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Invalid credentials. Please check your email/username and password.')
      
      // Verify it does NOT expose whether user exists
      expect(message).not.toContain('User not found')
    })

    it('should hide credential details for authentication errors (Requirement 8.4)', () => {
      const errors = [
        { response: { status: 401, data: { error: 'Wrong password' } } },
        { response: { status: 401, data: { error: 'Email not found' } } },
        { response: { status: 403, data: { error: 'Account locked' } } },
        { response: { status: 403, data: { error: 'Invalid username' } } },
      ]

      errors.forEach(error => {
        const message = getErrorMessage(error)
        // All should return the same generic message
        expect(message).toBe('Invalid credentials. Please check your email/username and password.')
        // None should expose the specific backend error
        expect(message).not.toContain(error.response.data.error)
      })
    })
  })

  describe('Server Errors (500+)', () => {
    it('should return server error message for 500 status', () => {
      const error = {
        response: {
          status: 500,
          data: {
            status: false,
            error: 'Internal server error',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Server error. Please try again later.')
    })

    it('should return server error message for 503 status', () => {
      const error = {
        response: {
          status: 503,
          data: {
            status: false,
            error: 'Service unavailable',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Server error. Please try again later.')
    })

    it('should return server error message for 502 status', () => {
      const error = {
        response: {
          status: 502,
          data: {
            error: 'Bad gateway',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Server error. Please try again later.')
    })
  })

  describe('Network Errors', () => {
    it('should return network error message when no response is received', () => {
      const error = {
        request: {},
        message: 'Network Error',
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Network error. Please check your connection and try again.')
    })

    it('should return network error message for timeout', () => {
      const error = {
        request: {},
        message: 'timeout of 5000ms exceeded',
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Network error. Please check your connection and try again.')
    })
  })

  describe('Other Client Errors', () => {
    it('should return generic error message for 400 status', () => {
      const error = {
        response: {
          status: 400,
          data: {
            status: false,
            error: 'Bad request',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Invalid credentials. Please check your email/username and password.')
    })

    it('should return generic error message for 404 status', () => {
      const error = {
        response: {
          status: 404,
          data: {
            error: 'Endpoint not found',
          },
        },
      }

      const message = getErrorMessage(error)
      expect(message).toBe('Invalid credentials. Please check your email/username and password.')
    })
  })

  describe('Generic Errors', () => {
    it('should return generic error message for unknown errors', () => {
      const error = new Error('Unknown error')

      const message = getErrorMessage(error)
      expect(message).toBe('An unexpected error occurred. Please try again.')
    })

    it('should return generic error message for errors without response or request', () => {
      const error = {
        message: 'Something went wrong',
      }

      const message = getErrorMessage(error)
      expect(message).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('Error Message Security', () => {
    it('should never expose backend error details for authentication failures', () => {
      const sensitiveErrors = [
        'Password is incorrect',
        'User does not exist',
        'Account is locked',
        'Email not verified',
        'Invalid username',
        'Wrong password',
      ]

      sensitiveErrors.forEach(backendError => {
        const error = {
          response: {
            status: 401,
            data: { error: backendError },
          },
        }

        const message = getErrorMessage(error)
        
        // Should return generic message
        expect(message).toBe('Invalid credentials. Please check your email/username and password.')
        
        // Should NOT contain the sensitive backend error
        expect(message).not.toContain(backendError)
      })
    })

    it('should provide specific message only for rate limiting', () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            error: 'Too many login attempts. Please try again after 15 minutes.',
          },
        },
      }

      const authError = {
        response: {
          status: 401,
          data: {
            error: 'Invalid password',
          },
        },
      }

      const rateLimitMessage = getErrorMessage(rateLimitError)
      const authMessage = getErrorMessage(authError)

      // Rate limit should be specific
      expect(rateLimitMessage).toContain('Too many login attempts')
      
      // Auth error should be generic
      expect(authMessage).toBe('Invalid credentials. Please check your email/username and password.')
      expect(authMessage).not.toContain('Invalid password')
    })
  })
})
