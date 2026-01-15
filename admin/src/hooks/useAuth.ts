import { useState, useEffect, useCallback } from 'react'
import sessionService, {
  UserData,
  UserUpdateData,
} from '@/services/sessionService'
import sessionCleanupService from '@/services/sessionCleanupService'

export interface LoginCredentials {
  phone_number: string
  password: string
}

export interface AuthState {
  user: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateUserDetails: (updates: UserUpdateData) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from server
  const initializeAuth = useCallback(async () => {
    try {
      // Check if session is valid via server route
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Send httpOnly cookies
      })

      if (response.ok) {
        const data = await response.json()

        if (
          data.statusCode === 200 &&
          data.isAuthenticated &&
          data.data?.user
        ) {
          const userData = data.data.user

          // IMPORTANT: Only update user data if it has valid values
          // Don't let null values from session validation overwrite good data
          const existingUser = sessionService.getUserData()

          // If userData has nulls but existing data is good, keep existing
          if (
            existingUser &&
            userData.phone_number === null &&
            existingUser.phone_number !== null
          ) {
            console.log(
              '⚠️ Session validation returned nulls, keeping existing user data',
            )
            setAuthState({
              user: existingUser,
              isLoading: false,
              isAuthenticated: true,
            })
            return
          }

          // Otherwise update with new data
          sessionService.setUserData(userData)

          // Update auth state
          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          })

          // Initialize session cleanup
          sessionCleanupService.initialize()
          sessionCleanupService.trackActivity()
          sessionCleanupService.scheduleSessionRenewal()
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        // Session not valid
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
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

        // Call server route instead of backend directly
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: enables httpOnly cookies
          body: JSON.stringify(credentials),
        })

        if (response.ok) {
          const data = await response.json()

          if (data.statusCode === 200 && data.data?.user) {
            const userData = data.data.user

            // Store user data in session service
            sessionService.setUserData(userData)

            // Update auth state
            setAuthState({
              user: userData,
              isLoading: false,
              isAuthenticated: true,
            })

            // Initialize session cleanup
            sessionCleanupService.scheduleSessionRenewal()

            return true
          }
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
      // Call server route to clear httpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear client-side session data
      sessionService.clearSession()
      sessionCleanupService.cleanup()

      // Update auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()

        if (data.isAuthenticated && data.data?.user) {
          const userData = data.data.user

          // Update session service
          sessionService.setUserData(userData)

          // Update auth state
          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          await logout()
        }
      } else {
        // Session not valid, logout
        await logout()
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      await logout()
    }
  }, [logout])

  // Update user details function
  const updateUserDetails = useCallback(
    async (updates: UserUpdateData): Promise<boolean> => {
      try {
        const success = sessionService.updateUserDetails(updates)

        if (success) {
          // Refresh the auth state to reflect the changes
          await refreshSession()
          console.log('User details updated and auth state refreshed')
          return true
        } else {
          console.error('Failed to update user details in session')
          return false
        }
      } catch (error) {
        console.error('Error updating user details:', error)
        return false
      }
    },
    [refreshSession],
  )

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Listen for session changes from localStorage (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data') {
        // User data changed, re-validate session
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
      async () => {
        const isValid = await sessionService.isSessionValid()
        if (!isValid) {
          await logout()
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
    updateUserDetails,
  }
}
