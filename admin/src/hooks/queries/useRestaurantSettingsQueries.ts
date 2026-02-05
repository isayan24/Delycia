/**
 * Restaurant Settings Query Hooks
 *
 * Production-grade TanStack Query hooks for restaurant settings
 * with proper caching, retry logic, and rate limit handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries/queryKeys'
import axios, { AxiosError } from 'axios'

// ============================================
// Type Definitions
// ============================================

export interface RestaurantInfo {
  id: number
  name: string
  username: string
  phone_number: string
  email: string | null
  address: string
  city: string
  state: string
  pincode: string
  fssai_license: string | null
  is_veg_only: number // 0 or 1
  description: string | null
  logo: string | null
  banner: string | null
  tax_percent: number
  latitude: string | null
  longitude: string | null
  commission_percent: number
  is_active: number // 0 or 1
  created_at: string
}

export interface UpdateRestaurantParams {
  id: number
  name?: string
  description?: string
  logo?: string
  banner?: string
  is_active?: number
  is_veg_only?: number
  tax_percent?: number
  latitude?: string
  longitude?: string
  phone_number?: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  fssai_license?: string
}

export interface RestaurantSettingsResponse {
  statusCode: number
  message: string
  restaurant_info?: RestaurantInfo
  restaurant_hours?: any[]
  error?: boolean
}

// ============================================
// Query Hook
// ============================================

/**
 * Fetch restaurant settings with aggressive caching and retry logic
 * to prevent rate limiting issues (429 errors)
 */
export function useRestaurantSettingsQuery(rid?: string) {
  return useQuery({
    queryKey: queryKeys.restaurant.info(rid || 'default'),
    queryFn: async (): Promise<RestaurantSettingsResponse> => {
      const response = await axios.get<RestaurantSettingsResponse>(
        `/api/restaurant${rid ? `?rid=${rid}` : ''}`,
        { withCredentials: true },
      )
      return response.data
    },
    enabled: true, // Always enabled - server will resolve rid from token if not provided
    staleTime: 5 * 60 * 1000, // 5 minutes - settings rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: false, // Don't refetch on focus to avoid rate limits
    refetchOnMount: false, // Use cached data on mount
    retry: (failureCount, error) => {
      // Don't retry on 429 (rate limit) - wait for cache
      if ((error as AxiosError)?.response?.status === 429) {
        return false
      }
      // Don't retry on auth errors
      if (
        (error as AxiosError)?.response?.status === 401 ||
        (error as AxiosError)?.response?.status === 403
      ) {
        return false
      }
      return failureCount < 2 // Max 2 retries for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// ============================================
// Mutation Hook
// ============================================

/**
 * Update restaurant settings with optimistic updates
 */
export function useUpdateRestaurantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      params: UpdateRestaurantParams,
    ): Promise<{ statusCode: number; message: string }> => {
      const response = await axios.patch<{
        statusCode: number
        message: string
      }>('/api/restaurant', params, { withCredentials: true })
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific restaurant query
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurant.info(variables.id.toString()),
      })
      // Also invalidate default key in case it's being used
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurant.info('default'),
      })
    },
    retry: (failureCount, error) => {
      // Don't retry on rate limits
      if ((error as AxiosError)?.response?.status === 429) {
        return false
      }
      return failureCount < 1 // Only 1 retry for mutations
    },
  })
}

// ============================================
// Prefetch Utility
// ============================================

/**
 * Prefetch restaurant settings (useful for navigation)
 */
export function usePrefetchRestaurantSettings() {
  const queryClient = useQueryClient()

  return (rid?: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.restaurant.info(rid || 'default'),
      queryFn: async () => {
        const response = await axios.get<RestaurantSettingsResponse>(
          `/api/restaurant${rid ? `?rid=${rid}` : ''}`,
          { withCredentials: true },
        )
        return response.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}
