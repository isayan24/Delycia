import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignSubscription } from '@/lib/api/subscriptions'
import type { SubscriptionAssignmentFormData } from '@/schemas/subscriptionSchema'
import type { RestaurantsResponse } from '@/hooks/queries/useRestaurantsQuery'

interface AssignSubscriptionResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    id: number
    restaurant_id: number
    subscription_plan_id: number
    start_date: string
    end_date: string
    auto_renew: boolean
    status: 'active' | 'expired' | 'cancelled'
    created_at: string
    updated_at: string
  }
}

async function assignSubscriptionFn(data: SubscriptionAssignmentFormData): Promise<AssignSubscriptionResponse> {
  const response = await assignSubscription({ data })
  const result = await response.json()
  return result
}

export function useAssignSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignSubscriptionFn,
    onMutate: async (newAssignment: SubscriptionAssignmentFormData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })

      // Snapshot the previous value
      const previousRestaurants = queryClient.getQueriesData<RestaurantsResponse>({ 
        queryKey: ['superadmin', 'restaurants'] 
      })

      // Optimistically update restaurant queries with new subscription
      queryClient.setQueriesData<RestaurantsResponse>(
        { queryKey: ['superadmin', 'restaurants'] },
        (old: RestaurantsResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((restaurant: any) =>
                restaurant.id === newAssignment.restaurant_id
                  ? { 
                      ...restaurant, 
                      subscription_plan_id: newAssignment.subscription_plan_id,
                    }
                  : restaurant
              ),
            },
          }
        }
      )

      // Return context with the previous data
      return { previousRestaurants }
    },
    onError: (_error: any, _newAssignment: SubscriptionAssignmentFormData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousRestaurants) {
        context.previousRestaurants.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to assign subscription:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'subscription-plans'] 
      })
    },
  })
}
