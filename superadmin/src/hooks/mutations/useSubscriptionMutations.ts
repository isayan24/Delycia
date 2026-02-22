import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createPlan,
  updatePlan,
  deactivatePlan,
  assignSubscription,
  changeSubscriptionPlan,
} from '@/lib/api/subscriptions'

// ─────────────────────────────────────────────────────────
// Plan Mutations
// ─────────────────────────────────────────────────────────

export function useCreatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      plan_code: string
      plan_name: string
      price: number
      currency?: string
      billing_period: 'month' | 'year' | 'trial'
      billing_days: number
      savings?: number
      is_popular?: boolean
      display_order?: number
      features: string[]
      max_restaurants?: number
    }) => {
      const response = await createPlan({ data })
      console.log(data, 'data i am putting in plans \n\n\n')
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'subscription-plans'],
      })
    },
  })
}

// review
export function useUpdatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: number
      plan_code?: string
      plan_name?: string
      price?: number
      currency?: string
      billing_period?: 'month' | 'year' | 'trial'
      billing_days?: number
      savings?: number
      is_popular?: boolean
      is_active?: boolean
      display_order?: number
      features?: string[]
      max_restaurants?: number
    }) => {
      console.log(data, 'data i have \n\n\n')
      const response = await updatePlan({ data })
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'subscription-plans'],
      })
    },
  })
}

export function useDeactivatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deactivatePlan({ data: { id } })
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'subscription-plans'],
      })
    },
  })
}

// ─────────────────────────────────────────────────────────
// Assignment Mutations
// ─────────────────────────────────────────────────────────

export function useAssignSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      restaurant_id: number
      subscription_plan_id: number
      start_date: string
      end_date: string
      auto_renew?: boolean
    }) => {
      const response = await assignSubscription({ data })
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'subscription-plans'],
      })
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'restaurants'],
      })
    },
  })
}

export function useChangePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: number
      subscription_plan_id?: number
      start_date?: string
      end_date?: string
      auto_renew?: boolean
      status?: 'active' | 'expired' | 'cancelled'
    }) => {
      const response = await changeSubscriptionPlan({ data })
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'subscription-plans'],
      })
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'restaurants'],
      })
    },
  })
}
