import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Types
// ============================================
export interface Plan {
  id: number
  code: string
  name: string
  price: number
  billing_period: 'trial' | 'month' | 'year'
  billing_days: number
  savings: number
  is_popular: boolean
  max_restaurants: number
  features: string[]
}

export interface Subscription {
  id: number
  restaurant_id: number
  plan_id: number
  plan_type: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  amount: number
  currency: string
  auto_renew: boolean
  cancelled_at: string | null
  created_at: string
  updated_at: string
  // Plan details from JOIN
  plan: Plan | null
  // Computed fields
  days_remaining: number
  days_since_expired: number
  display_status:
    | 'active'
    | 'expiring_soon'
    | 'grace_period'
    | 'expired'
    | 'cancelled'
}

export interface SubscriptionResponse {
  statusCode: number
  message: string
  subscription: Subscription | null
  has_subscription: boolean
  is_in_grace_period: boolean
  is_hard_blocked: boolean
  grace_period_days_remaining: number
}

export interface SubscriptionPlan {
  id: number
  plan_code: string
  name: string
  plan_type: string // For frontend compatibility
  price: number
  currency: string
  billing_period: 'trial' | 'month' | 'year'
  billing_days: number
  savings: number
  is_popular: boolean
  max_restaurants: number
  features: string[]
}

export interface PlansResponse {
  statusCode: number
  message: string
  plans: SubscriptionPlan[]
}

// ============================================
// Query Key Factory for Subscription
// ============================================
export const subscriptionKeys = {
  all: ['subscription'] as const,
  byRestaurant: (rid: string) =>
    [...subscriptionKeys.all, 'restaurant', rid] as const,
  plans: ['subscription', 'plans'] as const,
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
    staleTime: 2 * 60 * 1000, // 2 minutes - check more frequently for expiry
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch available subscription plans
 */
export function usePlansQuery(enabled = true) {
  return useQuery<PlansResponse>({
    queryKey: subscriptionKeys.plans,
    queryFn: async () => {
      const response = await axios.get(`/api/subscription/plans`)
      return response.data
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - plans rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}
