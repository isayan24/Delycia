import { useQuery } from '@tanstack/react-query'
import {
  getSubscriptionPlans,
  getPlanStats,
  type SubscriptionPlan,
  type PlanStats,
} from '@/lib/api/subscriptions'

export interface SubscriptionPlansResponse {
  status: boolean
  statusCode: number
  message: string
  data: SubscriptionPlan[]
}

export interface PlanStatsResponse {
  status: boolean
  statusCode: number
  message: string
  data: PlanStats
}

// Re-export types for convenience
export type { SubscriptionPlan, PlanStats }

async function fetchSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  const response = await getSubscriptionPlans()
  const data = await response.json()
  return data
}

async function fetchPlanStats(planId: number): Promise<PlanStatsResponse> {
  const response = await getPlanStats({ data: { id: planId } })
  const data = await response.json()
  return data
}

export function useSubscriptionPlansQuery() {
  return useQuery({
    queryKey: ['superadmin', 'subscription-plans'],
    queryFn: () => fetchSubscriptionPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePlanStatsQuery(planId: number) {
  return useQuery({
    queryKey: ['superadmin', 'subscription-plans', planId, 'stats'],
    queryFn: () => fetchPlanStats(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
