/**
 * Verify Magic Link Mutation Hook (CRITICAL)
 * 
 * This hook verifies the magic link token and updates the TanStack Query cache.
 * This is the CRITICAL fix that prevents users from needing to manually refresh.
 * 
 * Key Features:
 * - Verifies token with backend
 * - Updates TanStack Query cache BEFORE navigation
 * - Syncs with sessionService for localStorage persistence
 * - No retry on token verification (tokens are one-time use)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'
import sessionService, { UserData } from '@/services/sessionService'
import type { VerifyMagicLinkResponse } from '@/types/auth.types'

/**
 * Custom hook for verifying magic link token
 * 
 * CRITICAL: This hook updates the TanStack Query cache synchronously
 * before navigation, ensuring user data is available immediately.
 * 
 * @example
 * const verifyMutation = useVerifyMagicLinkMutation()
 * 
 * verifyMutation.mutate(token, {
 *   onSuccess: (data) => {
 *     if (data.data?.requiresName) {
 *       // Show name input
 *     } else {
 *       // Navigate to home - user data already in cache!
 *       navigate({ to: '/' })
 *     }
 *   },
 * })
 */
export function useVerifyMagicLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation<VerifyMagicLinkResponse, Error, string>({
    mutationFn: async (token: string) => {
      console.log('[useVerifyMagicLinkMutation] Starting verification with token:', token.substring(0, 20) + '...')
      const response = await axios.get(`/api/auth/verify-magic?token=${token}`)
      console.log('[useVerifyMagicLinkMutation] BFF Response:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Transform BFF response data to UserData format
        const userData: UserData = {
          _id: data.data.uid,
          id: data.data.id,
          country_code: data.data.country_code,
          phone_number: data.data.phone_number,
          name: data.data.name,
          role: 0, // Default role for regular users
        }

        // CRITICAL: Update TanStack Query cache BEFORE navigation
        // This ensures the cache is populated when the home page renders
        queryClient.setQueryData(queryKeys.auth.user(), userData)

        // Sync with sessionService for localStorage persistence
        // This provides instant hydration on page refresh
        sessionService.setUserData(userData)

        console.log('[useVerifyMagicLinkMutation] Cache updated successfully', {
          userId: userData.id,
          hasName: !!userData.name,
          userData: userData,
        })
      }
    },
    // IMPORTANT: No retry for token verification
    // Tokens are one-time use and expire quickly
    retry: false,
  })
}
