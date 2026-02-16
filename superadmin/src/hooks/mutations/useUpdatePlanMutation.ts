import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlan } from '@/lib/api/subscriptions'
import type { SubscriptionPlansResponse } from '@/hooks/queries/useSubscriptionPlansQuery'

interface UpdatePlanData {
  id: number
  plan_name?: string
  description?: string
  price?: number
  billing_period?: 'monthly' | 'quarterly' | 'annual'
  max_menu_items?: number
  max_staff?: number
  max_monthly_orders?: number
  custom_branding?: boolean
  analytics_access?: boolean
  api_access?: boolean
  priority_support?: boolean
  is_active?: boolean
}

interface UpdatePlanResponse {
  status: boolean
  statusCode: number
  message: string
  data: any
}

async function updatePlanFn(data: UpdatePlanData): Promise<UpdatePlanResponse> {
  const response = await updatePlan({ data })
  const result = await response.json()
  return result
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePlanFn,
    onMutate: async (updatedPlan: UpdatePlanData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })

      // Snapshot the previous value
      const previousPlans = queryClient.getQueriesData<SubscriptionPlansResponse>({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })

      // Optimistically update all subscription plan queries
      queryClient.setQueriesData<SubscriptionPlansResponse>(
        { queryKey: ['superadmin', 'subscription-plans'] },
        (old: SubscriptionPlansResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: old.data.map((plan: any) =>
              plan.id === updatedPlan.id
                ? { 
                    ...plan, 
                    ...updatedPlan,
                  }
                : plan
            ),
          }
        }
      )

      // Return context with the previous data
      return { previousPlans }
    },
    onError: (_error: any, _updatedPlan: UpdatePlanData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousPlans) {
        context.previousPlans.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update subscription plan:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })
    },
  })
}
