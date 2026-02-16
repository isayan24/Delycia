import { useState, useEffect, useCallback } from 'react'
import sessionService from '@/services/sessionService'
import type { SuperadminUserData } from '@/services/sessionService'
import tokenService from '@/services/tokenService'
import axiosInstance from '@/lib/axios'

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
  rememberMe?: boolean
}

export interface AuthState {
  user: SuperadminUserData | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
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
      // For now, skip session check and just set to not authenticated
      // This allows the app to load and redirect to login
      // TODO: Implement proper session validation when BFF routes are ready
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
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

        // Call backend API directly (temporary until BFF routes are implemented)
        // The axios instance will automatically handle CSRF tokens
         
        const response = await axiosInstance.post(
          `/superadmin/auth/login`,
          credentials,
          {
            withCredentials: true, // Important: enables httpOnly cookies
          }
        )

        if (response.status === 200) {
          const data = response.data

          if (
            data.statusCode === 200 &&
            data.data &&
            data.data.role === 1000 // Verify superadmin role
          ) {
            const userData = data.data

            // Store user data in session service
            sessionService.setUserData(userData)

            // Update auth state
            setAuthState({
              user: userData,
              isLoading: false,
              isAuthenticated: true,
            })

            return true
          } else {
            // Not superadmin
            setAuthState((prev) => ({ ...prev, isLoading: false }))
            return false
          }
        }

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      } catch (error: any) {
        console.error('Login failed:', error.message)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        // Re-throw the error so the login page can handle it
        throw error
      }
    },
    [],
  )

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call server route to clear httpOnly cookies
      await axiosInstance.post(
        '/api/auth/logout',
        {},
        {
          withCredentials: true,
        },
      )

      // Clear client-side session data
      sessionService.clearSession()

      // Update auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      // Redirect to login page only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      // For now, just logout since we don't have session validation yet
      // TODO: Implement proper session refresh when BFF routes are ready
      await logout()
    } catch (error) {
      console.error('Session refresh failed:', error)
      // Only logout if not on public route to avoid loops
      if (!window.location.pathname.includes('/login')) {
        await logout()
      }
    }
  }, [logout])

  // Initialize auth on mount (skip on public routes)
  useEffect(() => {
    // Don't initialize auth on public routes like login page
    const publicRoutes = ['/login']
    const currentPath = window.location.pathname

    if (!publicRoutes.includes(currentPath)) {
      initializeAuth()
    } else {
      // On public routes, just set loading to false without checking auth
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [initializeAuth])

  // Listen for session changes from localStorage (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'superadmin_user_data') {
        // User data changed, re-validate session
        initializeAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [initializeAuth])

  // Setup Axios interceptors and logout callback
  useEffect(() => {
    tokenService.setupInterceptors()
    tokenService.setOnLogout(() => {
      logout()
    })
  }, [logout])

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
  }
}
