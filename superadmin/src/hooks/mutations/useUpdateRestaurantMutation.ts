import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRestaurant } from '@/lib/api/restaurants'
import type { RestaurantsResponse } from '@/hooks/queries/useRestaurantsQuery'

interface UpdateRestaurantData {
  id: number
  name?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  description?: string
  logo_url?: string
  status?: 'active' | 'inactive' | 'suspended'
}

interface UpdateRestaurantResponse {
  status: boolean
  statusCode: number
  message: string
  data: any
}

async function updateRestaurantFn(data: UpdateRestaurantData): Promise<UpdateRestaurantResponse> {
  const response = await updateRestaurant({ data })
  const result = await response.json()
  return result
}

export function useUpdateRestaurantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRestaurantFn,
    onMutate: async (updatedRestaurant: UpdateRestaurantData) => {
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
                restaurant.id === updatedRestaurant.id
                  ? { 
                      ...restaurant, 
                      ...updatedRestaurant,
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
    onError: (_error: any, _updatedRestaurant: UpdateRestaurantData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousRestaurants) {
        context.previousRestaurants.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update restaurant:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })
    },
  })
}
