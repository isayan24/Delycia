/**
 * Auth Query Hook - TanStack Query based authentication
 *
 * Replaces useState/useEffect based auth with TanStack Query for:
 * - Automatic caching and deduplication
 * - Background session refresh
 * - Better loading/error states
 * - Consistent API across the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import axios from 'axios'
import axiosInstance from '@/lib/axios'
import { queryKeys } from '@/lib/queryKeys'
import sessionService, { UserData } from '@/services/sessionService'
import tokenService from '@/services/tokenService'

export interface LoginCredentials {
  country_code: string
  phone_number: string
}

/**
 * Fetch current session from server
 * Uses localStorage as initial data for instant hydration
 */
const fetchSession = async (): Promise<UserData | null> => {
  try {
    // Use axiosInstance which has the correct baseURL (/api/v1)
    // /users endpoint maps to user.controller.getUser
    const response = await axiosInstance.get('/users')

    if (response.data?.status === true && response.data?.user) {
      const userData = response.data.user
      // Sync to localStorage for persistence across refreshes
      sessionService.setUserData(userData)
      return userData
    }

    return null
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      sessionService.clearSession()
    }
    return null
  }
}

/**
 * Main auth hook using TanStack Query
 */
export function useAuthQuery() {
  const queryClient = useQueryClient()

  // Session query - fetches and caches user data
  const {
    data: user = null,
    isLoading,
    isError,
    error,
    refetch: refreshSession,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchSession,
    // Use localStorage data as initial value for instant hydration
    initialData: () => sessionService.getUserData(),
    // Keep data fresh but don't refetch too aggressively
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Background refetch to keep session alive
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    // Refetch on window focus to ensure fresh data
    refetchOnWindowFocus: true,
    // Retry on network errors
    retry: 1,
    // Keep previous data while refetching to prevent UI flicker
    placeholderData: (previousData) => previousData,
    // Disable on server to prevent hydration mismatch (server has no localStorage)
    enabled: typeof window !== 'undefined',
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<UserData | null> => {
      const response = await axios.post('/api/auth/login', credentials)

      if (response.status === 200 && response.data?.data?.user) {
        const userData = response.data.data.user
        sessionService.setUserData(userData)
        return userData
      }

      throw new Error(response.data?.message || 'Login failed')
    },
    onSuccess: (userData) => {
      // Update the auth query cache directly
      queryClient.setQueryData(queryKeys.auth.user(), userData)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await axios.post('/api/auth/logout')
    },
    onSuccess: () => {
      // Clear session service
      sessionService.clearSession()
      // Clear auth cache
      queryClient.setQueryData(queryKeys.auth.user(), null)
      // Clear all cached data (orders, etc.) for security
      queryClient.clear()
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Even on error, clear local state
      sessionService.clearSession()
      queryClient.setQueryData(queryKeys.auth.user(), null)
    },
  })

  // Login wrapper that returns boolean for compatibility
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(credentials)
      return true
    } catch {
      return false
    }
  }

  // Logout wrapper
  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync()
  }

  // Setup token refresh interceptors and logout callback
  useEffect(() => {
    tokenService.setupInterceptors()
    tokenService.setOnLogout(() => {
      // Clear session service
      sessionService.clearSession()
      // Clear auth cache
      queryClient.setQueryData(queryKeys.auth.user(), null)
      // Clear all cached data
      queryClient.clear()
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    // User data
    user,
    isLoading: isLoading || loginMutation.isPending,
    isAuthenticated: !!user,
    isError,
    error: error ? (error as Error).message : null,

    // Actions
    login,
    logout,
    refreshSession,

    // For advanced use cases
    loginMutation,
    logoutMutation,
  }
}

// Re-export types for convenience
export type { UserData }
