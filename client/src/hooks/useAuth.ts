'use client'

import { useState, useEffect, useCallback } from 'react'
import sessionService, { UserData } from '@/services/sessionService'
import tokenService from '@/services/tokenService'
import sessionCleanupService from '@/services/sessionCleanupService'
import { submitCodeAutomatically } from '@/helpers/submitCodeAutomatically'
import axiosInstance from '@/lib/server-axios'

export interface LoginCredentials {
  country_code: string
  phone_number: string
}

export interface AuthState {
  user: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
  accessToken: string | null
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<void>
  getValidAccessToken: () => Promise<string | null>
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  })

  // Initialize auth state from cookies
  const initializeAuth = useCallback(() => {
    try {
      const session = sessionService.getSession()
      if (session) {
        setAuthState({
          user: sessionService.getUserData(),
          isLoading: false,
          isAuthenticated: true,
          accessToken: session.accessToken,
        })

        // Schedule token refresh and session cleanup
        tokenService.scheduleTokenRefresh()
        sessionCleanupService.initialize()
        sessionCleanupService.trackActivity()
        sessionCleanupService.scheduleSessionRenewal()
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          accessToken: null,
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      })
    }
  }, [])

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }))

        const response = await axiosInstance.post(
          '/users/auth/handleAuth',
          credentials,
        )

        if (response.data?.data) {
          const userData = response.data.data

          // Create session data
          const sessionData = {
            _id: userData.uid,
            id: userData.id,
            country_code: userData.country_code,
            phone_number: userData.phone_number,
            role: 0,
            accessToken: userData.access_token,
            refreshToken: userData.refresh_token,
          }

          // Store in session service
          sessionService.setSession(sessionData)

          // Update auth state
          setAuthState({
            user: sessionService.getUserData(),
            isLoading: false,
            isAuthenticated: true,
            accessToken: userData.access_token,
          })

          // Schedule token refresh and session cleanup
          tokenService.scheduleTokenRefresh()
          sessionCleanupService.scheduleSessionRenewal()

          // Attempt automatic code submission after successful login
          try {
            const codeResult = await submitCodeAutomatically(
              sessionService.getUserData(),
            )

            if (codeResult.success) {
              console.log('Login: Code automatically submitted successfully')
            }
          } catch (codeError) {
            console.error(
              'Login: Unhandled error during automatic code submission:',
              codeError,
            )
          }

          return true
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return false
        }
      } catch (error: any) {
        console.error('Login failed:', error.message)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    },
    [],
  )

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear session and cleanup services
      sessionService.clearSession()
      sessionCleanupService.cleanup()

      // Update auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      })

      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const success = await tokenService.refreshTokens()
      if (success) {
        const session = sessionService.getSession()
        if (session) {
          setAuthState({
            user: sessionService.getUserData(),
            isLoading: false,
            isAuthenticated: true,
            accessToken: session.accessToken,
          })
        }
      } else {
        // Refresh failed, logout user
        logout()
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      logout()
    }
  }, [logout])

  // Get valid access token (with automatic refresh)
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await tokenService.getValidAccessToken()

      // Update auth state if token was refreshed
      if (token && token !== authState.accessToken) {
        const session = sessionService.getSession()
        if (session) {
          setAuthState((prev) => ({
            ...prev,
            accessToken: token,
          }))
        }
      }

      return token
    } catch (error) {
      console.error('Failed to get valid access token:', error)
      return null
    }
  }, [authState.accessToken])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Listen for session changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session') {
        initializeAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [initializeAuth])

  // Periodic session validation
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const interval = setInterval(
      () => {
        if (!sessionService.isSessionValid()) {
          logout()
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [authState.isAuthenticated, logout])

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    getValidAccessToken,
  }
}
