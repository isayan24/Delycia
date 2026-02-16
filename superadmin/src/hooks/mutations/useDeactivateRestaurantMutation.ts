import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deactivateRestaurant } from '@/lib/api/restaurants'
import type { RestaurantsResponse } from '@/hooks/queries/useRestaurantsQuery'

interface DeactivateRestaurantResponse {
  status: boolean
  statusCode: number
  message: string
}

async function deactivateRestaurantFn(id: number): Promise<DeactivateRestaurantResponse> {
  const response = await deactivateRestaurant({ data: { id } })
  const result = await response.json()
  return result
}

export function useDeactivateRestaurantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateRestaurantFn,
    onMutate: async (restaurantId: number) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })

      // Snapshot the previous value
      const previousRestaurants = queryClient.getQueriesData<RestaurantsResponse>({ 
        queryKey: ['superadmin', 'restaurants'] 
      })

      // Optimistically update all restaurant queries
      queryClient.setQueriesData<RestaurantsResponse>(
        { queryKey: ['superadmin', 'restaurants'] },
        (old: RestaurantsResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((restaurant: any) =>
                restaurant.id === restaurantId
                  ? { ...restaurant, is_active: 0 }
                  : restaurant
              ),
            },
          }
        }
      )

      // Return context with the previous data
      return { previousRestaurants }
    },
    onError: (_error: any, _restaurantId: number, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousRestaurants) {
        context.previousRestaurants.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to deactivate restaurant:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })
    },
  })
}
