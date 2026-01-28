import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '@/lib/queries/queryKeys'
import sessionService, {
  UserData,
  UserUpdateData,
} from '@/services/sessionService'
import sessionCleanupService from '@/services/sessionCleanupService'
import tokenService from '@/services/tokenService'
import { useEffect, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// API Functions
// ============================================================================

async function fetchSession(): Promise<UserData | null> {
  try {
    const response = await axios.get('/api/auth/session', {
      withCredentials: true,
    })

    if (response.status === 200) {
      const data = response.data
      if (data.statusCode === 200 && data.isAuthenticated && data.data?.user) {
        return data.data.user
      }
    }
    return null
  } catch (error) {
    console.error('Session fetch error:', error)
    return null
  }
}

async function loginUser(credentials: LoginCredentials): Promise<UserData> {
  const response = await axios.post('/api/auth/login', credentials, {
    withCredentials: true,
  })

  if (
    response.status === 200 &&
    response.data?.statusCode === 200 &&
    response.data?.data?.user
  ) {
    return response.data.data.user
  }

  throw new Error(response.data?.message || 'Login failed')
}

async function logoutUser(): Promise<void> {
  await axios.post('/api/auth/logout', {}, { withCredentials: true })
}

// ============================================================================
// Hook
// ============================================================================

export function useAdminAuthQuery() {
  const queryClient = useQueryClient()

  // Get existing localStorage data for smart merge
  const getExistingUserData = useCallback(() => {
    return sessionService.getUserData()
  }, [])

  // Smart merge function: backend data + localStorage preferences
  const mergeUserData = useCallback(
    (backendUser: UserData | null): UserData | null => {
      if (!backendUser) return null

      const existingUser = getExistingUserData()

      // CRITICAL: Smart merge strategy
      // - restaurant_rids: Prefer backend (source of truth), fallback to localStorage
      // - selected_rid: Prefer localStorage (user's last selection), fallback to first restaurant
      return {
        ...backendUser,
        restaurant_rids:
          backendUser.restaurant_rids?.length > 0
            ? backendUser.restaurant_rids
            : (existingUser?.restaurant_rids ?? []),
        selected_rid:
          existingUser?.selected_rid ??
          backendUser.restaurant_rids?.[0] ??
          null,
      }
    },
    [getExistingUserData],
  )

  // ============================================================================
  // Session Query
  // ============================================================================

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refetchSession,
    isError,
  } = useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Background refresh every 10 minutes
    refetchOnWindowFocus: true,
    retry: false, // Don't retry auth - if it fails, user needs to login

    // Initialize from localStorage for instant page load
    initialData: () => {
      const stored = sessionService.getUserData()
      return stored || undefined
    },
    initialDataUpdatedAt: () => {
      // Consider localStorage data stale after 1 minute
      return Date.now() - 60 * 1000
    },

    // Smart merge on success
    select: mergeUserData,
  })

  // Sync to localStorage when session changes
  useEffect(() => {
    if (sessionData) {
      sessionService.setUserData(sessionData)
    }
  }, [sessionData])

  // ============================================================================
  // Login Mutation
  // ============================================================================

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (userData) => {
      // Store in localStorage
      sessionService.setUserData(userData)

      // Update query cache
      queryClient.setQueryData(queryKeys.auth.session(), userData)

      // Initialize session cleanup
      sessionCleanupService.scheduleSessionRenewal()
    },
  })

  // ============================================================================
  // Logout Mutation
  // ============================================================================

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear localStorage
      sessionService.clearSession()
      sessionCleanupService.cleanup()

      // Invalidate auth cache
      queryClient.setQueryData(queryKeys.auth.session(), null)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })

      // Redirect to login
      window.location.href = '/login'
    },
    onError: () => {
      // Even on error, clear local state
      sessionService.clearSession()
      sessionCleanupService.cleanup()
      queryClient.setQueryData(queryKeys.auth.session(), null)
      window.location.href = '/login'
    },
  })

  // ============================================================================
  // Update Selected Restaurant
  // ============================================================================

  const updateSelectedRestaurant = useCallback(
    (restaurantId: number) => {
      const currentUser = sessionService.getUserData()
      if (!currentUser) return false

      // Validate restaurant ID is accessible
      if (!currentUser.restaurant_rids?.includes(restaurantId)) {
        console.error(`Restaurant ID ${restaurantId} is not accessible`)
        return false
      }

      const updatedUser = { ...currentUser, selected_rid: restaurantId }
      sessionService.setUserData(updatedUser)
      queryClient.setQueryData(queryKeys.auth.session(), updatedUser)

      return true
    },
    [queryClient],
  )

  // ============================================================================
  // Update User Details (for profile updates)
  // ============================================================================

  const updateUserDetails = useCallback(
    async (updates: UserUpdateData): Promise<boolean> => {
      const success = sessionService.updateUserDetails(updates)
      if (success) {
        await refetchSession()
        return true
      }
      return false
    },
    [refetchSession],
  )

  // ============================================================================
  // Token Service Setup
  // ============================================================================

  useEffect(() => {
    tokenService.setupInterceptors()
    tokenService.setOnLogout(() => {
      logoutMutation.mutate()
    })
  }, [])

  // ============================================================================
  // Session Cleanup Initialization
  // ============================================================================

  useEffect(() => {
    if (sessionData) {
      sessionCleanupService.initialize()
      sessionCleanupService.trackActivity()
    }
  }, [sessionData])

  // ============================================================================
  // Multi-tab Sync
  // ============================================================================

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data') {
        refetchSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refetchSession])

  // ============================================================================
  // Derived State
  // ============================================================================

  const user = sessionData ?? null
  const isAuthenticated = !!user && !isError
  const isLoading = isSessionLoading && !sessionService.getUserData()

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    user,
    isLoading,
    isAuthenticated,

    // Actions
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    refreshSession: refetchSession,
    updateUserDetails,
    updateSelectedRestaurant,

    // Mutation states (for UI feedback)
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  }
}

// Re-export types
export type { UserData, UserUpdateData }
