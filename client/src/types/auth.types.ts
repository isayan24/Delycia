/**
 * Authentication Type Definitions
 * 
 * Centralized type definitions for magic link authentication flow.
 * Used across mutation hooks, components, and API calls.
 */

/**
 * Request payload for magic link generation
 */
export interface MagicLinkRequest {
  phone_number: string
  country_code: string
}

/**
 * Response from magic link request API
 */
export interface MagicLinkResponse {
  statusCode: number
  message: string
  success: boolean
  data?: {
    expiresIn: number
    phone: string
  }
}

/**
 * User data returned from verification
 */
export interface UserData {
  id: string
  phone: string
  name?: string
  email?: string
  createdAt: string
  updatedAt: string
}

/**
 * Response from magic link verification API
 */
export interface VerifyMagicLinkResponse {
  statusCode: number
  message: string
  success: boolean
  data?: {
    id: number
    uid: string
    country_code: string
    phone_number: string
    name?: string
    access_token: string
    refresh_token: string
    isNewUser: boolean
    requiresName: boolean
  }
}

/**
 * Request payload for user profile update
 */
export interface UpdateUserRequest {
  name: string
  email?: string
}

/**
 * Response from user update API
 */
export interface UpdateUserResponse {
  statusCode: number
  message: string
  success: boolean
  data?: {
    user: UserData
  }
}

/**
 * Auth error types for better error handling
 */
export enum AuthErrorType {
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured auth error
 */
export interface AuthError {
  type: AuthErrorType
  message: string
  originalError?: Error
}
