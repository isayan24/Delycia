'use client'

import axiosInstance from '@/lib/axios'
import sessionService from './sessionService'
import { jwtDecode } from 'jwt-decode'
import errorHandlingService from './errorHandlingService'

interface TokenRefreshResponse {
  access_token: string
  refresh_token: string
}

interface DecodedToken {
  exp?: number
  iat?: number
  [key: string]: any
}

class TokenService {
  private static instance: TokenService
  private refreshPromise: Promise<boolean> | null = null

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService()
    }
    return TokenService.instance
  }

  /**
   * Refresh access and refresh tokens
   */
  async refreshTokens(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null

    return result
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const session = sessionService.getSession()
      if (!session?.refreshToken) {
        console.error('No refresh token available')
        sessionService.clearSession()
        return false
      }

      const response = await axiosInstance.post<TokenRefreshResponse>(
        '/users/auth/refresh',
        null,
        {
          headers: {
            Authorization: `Bearer ${session.refreshToken}`,
          },
        },
      )

      if (response.data?.access_token && response.data?.refresh_token) {
        // Update session with new tokens
        sessionService.updateTokens(
          response.data.access_token,
          response.data.refresh_token,
        )

        console.log('Tokens refreshed successfully')
        return true
      } else {
        console.error('Invalid token refresh response')
        sessionService.clearSession()
        return false
      }
    } catch (error: any) {
      console.error('Failed to refresh tokens:', error.message)

      // Determine error type based on the error
      let authError
      if (error.response?.status === 401) {
        authError = errorHandlingService.createAuthError(
          'REFRESH_FAILED',
          'Token refresh failed - invalid refresh token',
          error,
          false,
        )
      } else if (!error.response) {
        authError = errorHandlingService.createAuthError(
          'NETWORK_ERROR',
          'Network error during token refresh',
          error,
          true,
        )
      } else {
        authError = errorHandlingService.createAuthError(
          'REFRESH_FAILED',
          'Token refresh failed',
          error,
          false,
        )
      }

      const recovered = errorHandlingService.handleAuthError(authError)
      if (!recovered) {
        sessionService.clearSession()
      }
      return false
    }
  }

  /**
   * Check if access token is expired or will expire soon
   */
  isAccessTokenExpired(token: string): boolean {
    try {
      const decoded: DecodedToken = jwtDecode(token)
      if (!decoded.exp) {
        return true // If no expiration, consider it expired
      }

      // Check if token expires within the next 30 seconds
      const expirationTime = decoded.exp * 1000 // Convert to milliseconds
      const bufferTime = 30 * 1000 // 30 seconds buffer

      return Date.now() >= expirationTime - bufferTime
    } catch (error) {
      console.error('Failed to decode token:', error)
      return true // If can't decode, consider it expired
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string | null> {
    const session = sessionService.getSession()
    if (!session?.accessToken) {
      return null
    }

    // Check if token is expired
    if (this.isAccessTokenExpired(session.accessToken)) {
      console.log('Access token expired, attempting refresh...')
      const refreshSuccess = await this.refreshTokens()

      if (!refreshSuccess) {
        return null
      }

      // Get the updated session
      const updatedSession = sessionService.getSession()
      return updatedSession?.accessToken || null
    }

    return session.accessToken
  }

  /**
   * Validate token format (basic JWT structure check)
   */
  isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false
    }

    // Basic JWT format check (3 parts separated by dots)
    const parts = token.split('.')
    return parts.length === 3
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(token: string): number | null {
    try {
      const decoded: DecodedToken = jwtDecode(token)
      return decoded.exp ? decoded.exp * 1000 : null // Convert to milliseconds
    } catch (error) {
      console.error('Failed to get token expiration:', error)
      return null
    }
  }

  /**
   * Check if refresh token is valid and not expired
   */
  isRefreshTokenValid(): boolean {
    const session = sessionService.getSession()
    if (!session?.refreshToken) {
      return false
    }

    return this.isValidTokenFormat(session.refreshToken)
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  scheduleTokenRefresh(): void {
    const session = sessionService.getSession()
    if (!session?.accessToken) {
      return
    }

    const expirationTime = this.getTokenExpirationTime(session.accessToken)
    if (!expirationTime) {
      return
    }

    // Schedule refresh 5 minutes before expiration
    const refreshTime = expirationTime - Date.now() - 5 * 60 * 1000

    if (refreshTime > 0) {
      setTimeout(async () => {
        if (sessionService.isSessionValid()) {
          await this.refreshTokens()
          this.scheduleTokenRefresh() // Schedule next refresh
        }
      }, refreshTime)
    }
  }
}

export default TokenService.getInstance()
