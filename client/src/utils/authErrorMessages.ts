/**
 * Authentication Error Message Utilities
 * 
 * Maps backend error codes to user-friendly messages.
 * Provides consistent error handling across auth flows.
 */

import { AuthErrorType } from '@/types/auth.types'

/**
 * User-friendly error messages for auth errors
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Token errors
  INVALID_TOKEN: 'This login link is invalid. Please request a new one.',
  EXPIRED_TOKEN: 'This login link has expired. Please request a new one.',
  TOKEN_ALREADY_USED: 'This login link has already been used. Please request a new one.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many login attempts. Please try again in a few minutes.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
  
  // Validation errors
  INVALID_PHONE_NUMBER: 'Please enter a valid phone number.',
  PHONE_NUMBER_REQUIRED: 'Phone number is required.',
  COUNTRY_CODE_REQUIRED: 'Country code is required.',
  NAME_REQUIRED: 'Please enter your name to continue.',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Server errors
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  
  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}

/**
 * Get user-friendly error message from error object
 * 
 * @param error - Error object from API call
 * @returns User-friendly error message
 * 
 * @example
 * try {
 *   await verifyToken(token)
 * } catch (error) {
 *   const message = getAuthErrorMessage(error)
 *   showNotification(message)
 * }
 */
export function getAuthErrorMessage(error: any): string {
  // Check for axios error response
  if (error?.response?.data) {
    const { message, error: errorCode, statusCode } = error.response.data
    
    // Try to match error code
    if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
      return AUTH_ERROR_MESSAGES[errorCode]
    }
    
    // Try to match message
    if (message && AUTH_ERROR_MESSAGES[message]) {
      return AUTH_ERROR_MESSAGES[message]
    }
    
    // Handle HTTP status codes
    if (statusCode === 429) {
      return AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    }
    if (statusCode >= 500) {
      return AUTH_ERROR_MESSAGES.SERVER_ERROR
    }
    if (statusCode === 503) {
      return AUTH_ERROR_MESSAGES.SERVICE_UNAVAILABLE
    }
    
    // Return backend message if it's user-friendly
    if (message && typeof message === 'string' && message.length < 100) {
      return message
    }
  }
  
  // Check for network errors
  if (error?.message) {
    if (error.message.includes('Network') || error.message.includes('ECONNREFUSED')) {
      return AUTH_ERROR_MESSAGES.NETWORK_ERROR
    }
    if (error.message.includes('timeout')) {
      return AUTH_ERROR_MESSAGES.TIMEOUT_ERROR
    }
  }
  
  // Default error message
  return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Get error type from error object
 * 
 * @param error - Error object from API call
 * @returns AuthErrorType enum value
 */
export function getAuthErrorType(error: any): AuthErrorType {
  if (error?.response?.data) {
    const { error: errorCode, statusCode } = error.response.data
    
    if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_ALREADY_USED') {
      return AuthErrorType.INVALID_TOKEN
    }
    if (errorCode === 'EXPIRED_TOKEN') {
      return AuthErrorType.EXPIRED_TOKEN
    }
    if (statusCode === 429 || errorCode === 'RATE_LIMIT_EXCEEDED') {
      return AuthErrorType.RATE_LIMIT
    }
    if (errorCode?.includes('INVALID') || errorCode?.includes('REQUIRED')) {
      return AuthErrorType.VALIDATION_ERROR
    }
  }
  
  if (error?.message?.includes('Network') || error?.message?.includes('timeout')) {
    return AuthErrorType.NETWORK_ERROR
  }
  
  return AuthErrorType.UNKNOWN_ERROR
}

/**
 * Check if error is retryable
 * 
 * @param error - Error object from API call
 * @returns true if error should be retried
 */
export function isRetryableError(error: any): boolean {
  const errorType = getAuthErrorType(error)
  
  // Only retry network errors
  return errorType === AuthErrorType.NETWORK_ERROR
}
