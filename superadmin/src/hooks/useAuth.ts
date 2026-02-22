import { useState, useEffect, useCallback } from 'react'
import sessionService from '@/services/sessionService'
import type { SuperadminUserData } from '@/services/sessionService'
import tokenService from '@/services/tokenService'
import { loginServer, logoutServer } from '@/lib/api/auth'

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

  // Initialize auth state from localStorage (set during login)
  const initializeAuth = useCallback(async () => {
    try {
      const user = sessionService.getUserData()
      if (user && user.role === 1) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
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

  /**
   * Login via BFF server function.
   *
   * The BFF proxies credentials to the backend, intercepts the Set-Cookie
   * headers from backend's response, and re-issues the tokens as httpOnly
   * cookies on the BFF origin (port 5000). This ensures:
   *   - subsequent server functions can read the cookies via getRequest()
   *   - tokens are never exposed in JS / localStorage
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }))

        // Call the BFF login server function
        const result = await loginServer({
          data: {
            email: credentials.email,
            username: credentials.username,
            password: credentials.password,
            rememberMe: credentials.rememberMe,
          },
        })

        // loginServer returns a Response — deserialize it
        const responseBody = result as unknown as Response
        let data: any

        if (responseBody && typeof responseBody.json === 'function') {
          data = await responseBody.json()
        } else {
          data = result
        }

        if (data?.statusCode === 200 && data?.data && data.data.role === 1) {
          const userData = data.data as SuperadminUserData

          // Persist non-sensitive user profile in localStorage
          sessionService.setUserData(userData)

          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          })

          return true
        }

        // Role check failed or bad credentials
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      } catch (error: any) {
        console.error('Login failed:', error?.message || error)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [],
  )

  /**
   * Logout via BFF server function.
   * Clears backend DB tokens and BFF-origin httpOnly cookies.
   */
  const logout = useCallback(async () => {
    try {
      await logoutServer({ data: undefined })
    } catch (error) {
      console.error('Logout BFF call failed (non-critical):', error)
    } finally {
      // Always clear local session state regardless of server errors
      sessionService.clearSession()

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
  }, [])

  // Refresh session — re-validate from localStorage
  const refreshSession = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Session refresh failed:', error)
      if (!window.location.pathname.includes('/login')) {
        await logout()
      }
    }
  }, [logout])

  // Initialize auth on mount (skip on public routes)
  useEffect(() => {
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
