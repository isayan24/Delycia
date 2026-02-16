import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deactivatePlan } from '@/lib/api/subscriptions'
import type { SubscriptionPlansResponse } from '@/hooks/queries/useSubscriptionPlansQuery'

interface DeactivatePlanResponse {
  status: boolean
  statusCode: number
  message: string
}

async function deactivatePlanFn(id: number): Promise<DeactivatePlanResponse> {
  const response = await deactivatePlan({ data: { id } })
  const result = await response.json()
  return result
}

export function useDeactivatePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivatePlanFn,
    onMutate: async (planId: number) => {
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
              plan.id === planId
                ? { ...plan, is_active: false }
                : plan
            ),
          }
        }
      )

      // Return context with the previous data
      return { previousPlans }
    },
    onError: (_error: any, _planId: number, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousPlans) {
        context.previousPlans.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to deactivate subscription plan:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })
    },
  })
}
