import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import axiosInstance from '@/lib/axios'
import { Restaurant } from '@/types/Restaurant'
import { queryKeys } from '@/lib/queryKeys'

// Helper to determine if we're running on server-side
const isServer = typeof window === 'undefined'

// Get the appropriate axios instance based on environment
const getAxiosInstance = () => {
  // On server-side (SSR), use axiosInstance with full baseURL
  if (isServer) {
    return axiosInstance
  }
  // On client-side, use regular axios with relative URLs
  return axios
}

// Fetcher functions - use local API routes which proxy to backend
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const axiosClient = getAxiosInstance()
    const url = isServer ? '/restaurant' : '/api/restaurant'
    const response = await axiosClient.get(url)
    return response.data?.restaurants || []
  } catch (error) {
    console.error('[Query] Error fetching restaurants:', error)
    throw error
  }
}

export const fetchRestaurant = async (
  rid: string | number,
): Promise<Restaurant | null> => {
  try {
    const axiosClient = getAxiosInstance()
    const url = isServer
      ? `/restaurant?rid=${rid}`
      : `/api/restaurant?rid=${rid}`
    const response = await axiosClient.get(url)
    const restaurant = response.data?.restaurant_info || response.data || null
    return restaurant
  } catch (error) {
    console.error(`[Query] Error fetching restaurant by ID ${rid}:`, error)
    throw error
  }
}

export const fetchRestaurantByUsername = async (
  username: string,
): Promise<Restaurant | null> => {
  try {
    const axiosClient = getAxiosInstance()

    const url = isServer
      ? `/restaurant?username=${username}`
      : `/api/restaurant?username=${username}`

    const response = await axiosClient.get(url)

    const restaurant = response.data?.restaurant_info || response.data || null

    return restaurant
  } catch (error) {
    console.error(
      `[Query] Error fetching restaurant by username ${username}:`,
      error,
    )
    throw error
  }
}

// Hook for fetching all restaurants
export const useRestaurantsQuery = () => {
  const {
    data: restaurants = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.restaurants.all,
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
  const queryClient = useQueryClient()

  const {
    data: restaurant = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.restaurants.detail(rid),
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID is required')
      const data = await fetchRestaurant(rid)

      // Populate username-based cache entry if we have the data (dual-key caching)
      if (data?.username) {
        queryClient.setQueryData(
          queryKeys.restaurants.byUsername(data.username),
          data,
        )
      }

      return data
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

// Hook for fetching a restaurant by username
export const useRestaurantByUsername = (username?: string) => {
  const queryClient = useQueryClient()

  const {
    data: restaurant = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.restaurants.byUsername(username),
    queryFn: async () => {
      if (!username) throw new Error('Username is required')
      const data = await fetchRestaurantByUsername(username)

      // Populate ID-based cache entry if we have the data (dual-key caching)
      console.log(data, 'data')
      if (data?.id) {
        queryClient.setQueryData(queryKeys.restaurants.detail(data.id), data)
      }

      return data
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    restaurant,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}
