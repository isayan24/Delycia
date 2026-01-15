import { useState, useEffect, useCallback } from 'react'
import sessionService, {
  UserData,
  UserUpdateData,
} from '@/services/sessionService'
import sessionCleanupService from '@/services/sessionCleanupService'
import axios from 'axios'

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

  // fix Initialize auth state from server
  const initializeAuth = useCallback(async () => {
    try {
      // Check if session is valid via server route
      const response = await axios.get('/api/auth/session', {
        withCredentials: true, // Send httpOnly cookies
      })

      if (response.status === 200) {
        const data = response.data

        if (
          data.statusCode === 200 &&
          data.isAuthenticated &&
          data.data?.user
        ) {
          const userData = data.data.user

          // IMPORTANT: Merge with localStorage for client-side fields
          // Backend doesn't store selected_rid and restaurant_rids
          const existingUser = sessionService.getUserData()

          // Always merge selected_rid and restaurant_rids from localStorage
          // since they don't exist in the backend user table
          const mergedUserData = {
            ...userData,
            selected_rid: existingUser?.selected_rid || null,
            restaurant_rids: existingUser?.restaurant_rids || [],
          }

          // Store merged data
          sessionService.setUserData(mergedUserData)

          // Update auth state
          setAuthState({
            user: mergedUserData,
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
        const response = await axios.post('/api/auth/login', credentials, {
          withCredentials: true, // Important: enables httpOnly cookies
        })

        if (response.status === 200) {
          const data = response.data

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
      await axios.post(
        '/api/auth/logout',
        {},
        {
          withCredentials: true,
        },
      )

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
      const response = await axios.get('/api/auth/session', {
        withCredentials: true,
      })

      if (response.status === 200) {
        const data = response.data

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
