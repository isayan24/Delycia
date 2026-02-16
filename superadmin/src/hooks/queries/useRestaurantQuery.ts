import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import type { Restaurant } from './useRestaurantsQuery'

export interface RestaurantDetailResponse {
  status: boolean
  statusCode: number
  message: string
  data: Restaurant & {
    // Additional fields from the detail endpoint
    subscription_price?: number
    subscription_billing_period?: string
    subscription_start_date?: string
    subscription_end_date?: string
    subscription_auto_renew?: number
    user_count?: number
    menu_item_count?: number
    orders_today?: number
  }
}

async function fetchRestaurant(id: string): Promise<RestaurantDetailResponse> {
  const { data } = await axiosInstance.get<RestaurantDetailResponse>(
    `/api/v1/superadmin/restaurants/${id}`
  )
  
  return data
}

export function useRestaurantQuery(id: string) {
  return useQuery({
    queryKey: ['superadmin', 'restaurant', id],
    queryFn: () => fetchRestaurant(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run query if id is provided
  })
}
