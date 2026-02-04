import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Types
// ============================================
export interface Subscription {
  id: number
  restaurant_id: number
  plan_type: 'monthly' | 'yearly'
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  amount: number
  currency: string
  auto_renew: boolean
  cancelled_at: string | null
  created_at: string
  updated_at: string
  days_remaining: number
  display_status: 'active' | 'expiring_soon' | 'expired' | 'cancelled'
}

export interface SubscriptionResponse {
  statusCode: number
  message: string
  subscription: Subscription | null
  has_subscription: boolean
}

// ============================================
// Query Key Factory for Subscription
// ============================================
export const subscriptionKeys = {
  all: ['subscription'] as const,
  byRestaurant: (rid: string) =>
    [...subscriptionKeys.all, 'restaurant', rid] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch subscription details for a restaurant
 */
export function useSubscriptionQuery(rid: string | undefined, enabled = true) {
  return useQuery<SubscriptionResponse>({
    queryKey: subscriptionKeys.byRestaurant(rid ?? ''),
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID is required')
      const response = await axios.get(`/api/subscription?rid=${rid}`)
      return response.data
    },
    enabled: enabled && !!rid,
    staleTime: 5 * 60 * 1000, // 5 minutes (subscription data rarely changes)
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}
