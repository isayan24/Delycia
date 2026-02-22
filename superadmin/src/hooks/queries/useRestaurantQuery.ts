import { useQuery } from '@tanstack/react-query'
import { getRestaurant } from '@/lib/api/restaurants'
import type { Restaurant } from './useRestaurantsQuery'

export interface RestaurantDetail extends Restaurant {
  // Additional fields returned by the detail endpoint
  fssai_license?: string | null
  logo?: string | null
  banner?: string | null
  latitude?: number | null
  longitude?: number | null
  tax_percent?: number
  commission_percent?: number
  online_orders?: number
  open_time?: string
  close_time?: string
  active_days?: number
  // Subscription detail fields
  subscription_price?: number | null
  subscription_billing_period?: string | null
  subscription_start_date?: string | null
  subscription_end_date?: string | null
  subscription_auto_renew?: number | null
  // Metrics
  user_count?: number
  menu_item_count?: number
  orders_today?: number
}

export interface RestaurantDetailResponse {
  status: boolean
  statusCode: number
  message: string
  data: RestaurantDetail
}

async function fetchRestaurant(id: string): Promise<RestaurantDetailResponse> {
  // Use the BFF server function — this runs on the server, reads the
  // httpOnly cookie, and attaches the Authorization header for us.
  const response = await getRestaurant({ data: { id: Number(id) } })
  const data = await response.json()
  return data as unknown as RestaurantDetailResponse
}

export function useRestaurantQuery(id: string) {
  return useQuery({
    queryKey: ['superadmin', 'restaurant', id],
    queryFn: () => fetchRestaurant(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  })
}
