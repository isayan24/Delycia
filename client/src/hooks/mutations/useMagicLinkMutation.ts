/**
 * Magic Link Request Mutation Hook
 * 
 * Handles requesting a magic link to be sent via WhatsApp.
 * Uses TanStack Query mutation for proper loading/error states and retry logic.
 */

import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import type { MagicLinkRequest, MagicLinkResponse } from '@/types/auth.types'

/**
 * Custom hook for requesting magic link
 * 
 * Features:
 * - Automatic retry on network errors (max 2 retries)
 * - Exponential backoff for retries
 * - No retry on validation errors
 * - Proper TypeScript types
 * 
 * @example
 * const magicLinkMutation = useMagicLinkMutation()
 * 
 * magicLinkMutation.mutate(
 *   { phone_number: '9876543210', country_code: '+91' },
 *   {
 *     onSuccess: (data) => console.log('Link sent!', data),
 *     onError: (error) => console.error('Failed:', error),
 *   }
 * )
 */
export function useMagicLinkMutation() {
  return useMutation<MagicLinkResponse, Error, MagicLinkRequest>({
    mutationFn: async ({ phone_number, country_code }) => {
      const response = await axios.post('/api/auth/request-magic-link', {
        phone_number,
        country_code,
      })
      return response.data
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not validation errors
      const isNetworkError = 
        error.message?.includes('Network') || 
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED')
      
      return isNetworkError && failureCount < 2
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, etc. (max 30s)
      return Math.min(1000 * 2 ** attemptIndex, 30000)
    },
  })
}
