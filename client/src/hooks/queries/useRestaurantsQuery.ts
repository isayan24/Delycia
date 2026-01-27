import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/server-axios'
import { Restaurant } from '@/types/Restaurant'

// Fetcher functions
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const response = await axiosInstance.get('/restaurant')
  return response.data?.restaurants || []
}

export const fetchRestaurant = async (
  rid: string | number,
): Promise<Restaurant | null> => {
  const response = await axiosInstance.get(`/restaurant/?rid=${rid}`)
  return response.data?.restaurant_info || response.data || null
}

// Hook for fetching all restaurants
export const useRestaurantsQuery = () => {
  const {
    data: restaurants = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  })

  return {
    restaurants,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}

// Hook for fetching a single restaurant
export const useRestaurantQuery = (rid?: string | number | null) => {
  const {
    data: restaurant = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['restaurant', { rid }],
    queryFn: () => {
      if (!rid) throw new Error('Restaurant ID is required')
      return fetchRestaurant(rid)
    },
    enabled: !!rid,
  })

  return {
    restaurant,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}
