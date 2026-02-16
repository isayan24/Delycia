import { useQuery } from '@tanstack/react-query'
import { getRestaurants, type Restaurant, type RestaurantFilters } from '@/lib/api/restaurants'

export interface RestaurantsResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    data: Restaurant[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// Re-export types for convenience
export type { Restaurant, RestaurantFilters }

async function fetchRestaurants(filters: RestaurantFilters = {}): Promise<RestaurantsResponse> {
  const response = await getRestaurants({ data: filters })
  const data = await response.json()
  return data
}

export function useRestaurantsQuery(filters: RestaurantFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'restaurants', filters],
    queryFn: () => fetchRestaurants(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
