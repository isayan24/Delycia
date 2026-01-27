'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import sessionService, { UserData } from '@/services/sessionService'

export interface LoginCredentials {
  country_code: string
  phone_number: string
}

export interface AuthState {
  user: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      // Verification endpoint - Proxy route that checks httpOnly cookie
      // Use direct axios for relative path
      const response = await axios.get('/api/auth/session')

      if (response.data?.isAuthenticated && response.data?.data?.user) {
        const userData = response.data.data.user

        // Only update if changed
        if (JSON.stringify(authState.user) !== JSON.stringify(userData)) {
          sessionService.setUserData(userData)

          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          })
        } else if (!authState.isAuthenticated || authState.isLoading) {
          // Just update flags if data is same but flags are wrong
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: true,
          }))
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      // Silently handle error for not logged in state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }))

        // Call proxy login endpoint using axios (direct import for relative URL)
        const response = await axios.post('/api/auth/login', credentials)

        // Proxy returns cookie headers and user data
        if (response.status === 200 && response.data?.data?.user) {
          const userData = response.data.data.user

          sessionService.setUserData(userData)

          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          })

          return true
        }

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      } catch (error: any) {
        console.error('Login failed:', error.message)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    },
    [],
  )

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call proxy logout endpoint to clear cookies
      await axios.post('/api/auth/logout')

      sessionService.clearSession()

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  // Mount
  useEffect(() => {
    // skip public routes check if needed?
    initializeAuth()
  }, [initializeAuth])

  // Storage listener
  useEffect(() => {
    const handleChange = (e: any) => {
      if (e.type === 'userDataChanged' || e.key === 'user_data') {
        initializeAuth()
      }
    }
    window.addEventListener('storage', handleChange)
    window.addEventListener('userDataChanged', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('userDataChanged', handleChange)
    }
  }, [initializeAuth])

  return {
    ...authState,
    login,
    logout,
  }
}
