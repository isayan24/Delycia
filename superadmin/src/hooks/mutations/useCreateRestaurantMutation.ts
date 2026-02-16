import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRestaurant } from '@/lib/api/restaurants'
import type { RestaurantFormData } from '@/schemas/restaurantSchema'

interface CreateRestaurantResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    id: number
    name: string
    username: string
    email: string
    phone_number: string
    address: string
    city: string
    state: string
    pincode: string
    is_active: number
    created_at: string
    updated_at: string
  }
}

async function createRestaurantFn(data: RestaurantFormData): Promise<CreateRestaurantResponse> {
  const response = await createRestaurant({ data })
  const result = await response.json()
  return result
}

export function useCreateRestaurantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRestaurantFn,
    onSuccess: (response) => {
      // Invalidate all restaurant queries to refetch with the new restaurant
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'restaurants'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to create restaurant:', error)
    },
  })
}
