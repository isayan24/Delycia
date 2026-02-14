import { useState, useEffect, useCallback } from 'react'
import sessionService, {
  UserData,
  UserUpdateData,
} from '@/services/sessionService'
import sessionCleanupService from '@/services/sessionCleanupService'
import tokenService from '@/services/tokenService'
import axios from 'axios'

export interface LoginCredentials {
  phone_number?: string
  username?: string
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
      // IMPORTANT: Get existing localStorage data FIRST
      // This contains selected_rid and restaurant_rids which don't exist in backend
      const existingUser = sessionService.getUserData()

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

          // CRITICAL: Smart merge strategy for client/server data
          // - restaurant_rids: Prefer backend (source of truth), fallback to localStorage
          // - selected_rid: Prefer localStorage (user's last selection) if valid, else auto-select first
          const resolvedRids =
            userData.restaurant_rids?.length > 0
              ? userData.restaurant_rids
              : (existingUser?.restaurant_rids ?? [])

          let resolvedSelectedRid: number | null = null
          if (
            existingUser?.selected_rid != null &&
            resolvedRids.includes(existingUser.selected_rid)
          ) {
            resolvedSelectedRid = existingUser.selected_rid
          } else if (resolvedRids.length > 0) {
            resolvedSelectedRid = resolvedRids[0]
          }

          const mergedUserData = {
            ...userData,
            restaurant_rids: resolvedRids,
            selected_rid: resolvedSelectedRid,
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
          // Server says not authenticated but DON'T clear localStorage yet
          // Let the middleware use it, and explicit logout will clear it
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        // Session not valid but DON'T clear localStorage
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // On error, DON'T clear localStorage to prevent middleware race condition
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
      // Get existing localStorage data to preserve restaurant info
      const existingUser = sessionService.getUserData()

      const response = await axios.get('/api/auth/session', {
        withCredentials: true,
      })

      if (response.status === 200) {
        const data = response.data

        if (data.isAuthenticated && data.data?.user) {
          const userData = data.data.user

          // Smart merge: backend restaurant_rids, validated selected_rid
          const resolvedRids =
            userData.restaurant_rids?.length > 0
              ? userData.restaurant_rids
              : (existingUser?.restaurant_rids ?? [])

          let resolvedSelectedRid: number | null = null
          if (
            existingUser?.selected_rid != null &&
            resolvedRids.includes(existingUser.selected_rid)
          ) {
            resolvedSelectedRid = existingUser.selected_rid
          } else if (resolvedRids.length > 0) {
            resolvedSelectedRid = resolvedRids[0]
          }

          const mergedUserData = {
            ...userData,
            restaurant_rids: resolvedRids,
            selected_rid: resolvedSelectedRid,
          }

          // Update session service
          sessionService.setUserData(mergedUserData)

          // Update auth state
          setAuthState({
            user: mergedUserData,
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
      // Only logout if not on public route to avoid loops
      if (!window.location.pathname.includes('/login')) {
        await logout()
      }
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
      if (e.key === 'admin_user_data') {
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
    updateUserDetails,
  }
}
