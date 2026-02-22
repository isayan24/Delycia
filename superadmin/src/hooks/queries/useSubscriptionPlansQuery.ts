import { useQuery } from '@tanstack/react-query'
import {
  getSubscriptionPlans,
  getPlanStats,
  type SubscriptionPlan,
} from '@/lib/api/subscriptions'

export interface SubscriptionPlansResponse {
  statusCode: number
  message: string
  data: SubscriptionPlan[]
}

export interface PlanStatsResponse {
  statusCode: number
  message: string
  data: SubscriptionPlan & {
    active_subscriptions: number
    total_restaurants: number
    monthly_revenue: number
  }
}

// Re-export types for convenience
export type { SubscriptionPlan }

async function fetchSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  const response = await getSubscriptionPlans()
  return await response.json()
}

async function fetchPlanStats(planId: number): Promise<PlanStatsResponse> {
  const response = await getPlanStats({ data: { id: planId } })
  return await response.json()
}

export function useSubscriptionPlansQuery() {
  return useQuery({
    queryKey: ['superadmin', 'subscription-plans'],
    queryFn: () => fetchSubscriptionPlans(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlanStatsQuery(planId: number) {
  return useQuery({
    queryKey: ['superadmin', 'subscription-plans', planId, 'stats'],
    queryFn: () => fetchPlanStats(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  })
}
