import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Types
// ============================================
export interface Restaurant {
  id: string
  name: string
  username?: string
  phone_number?: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface RestaurantMap {
  [key: string]: Restaurant
}

// ============================================
// Query Key Factory for Restaurants
// ============================================
export const restaurantKeys = {
  all: ['restaurants'] as const,
  multiple: (rids: number[]) =>
    [...restaurantKeys.all, 'multiple', rids.sort().join(',')] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch multiple restaurants by their IDs
 * This is optimal for fetching all accessible restaurants for a user
 * Uses httpOnly cookies for authentication
 */
export function useRestaurantsQuery(
  restaurantRids: number[] | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: restaurantKeys.multiple(restaurantRids ?? []),
    queryFn: async () => {
      if (!restaurantRids || restaurantRids.length === 0) {
        return {}
      }

      const restaurantMap: RestaurantMap = {}

      // Fetch details for each restaurant in parallel
      const fetchPromises = restaurantRids.map(async (rid: number) => {
        try {
          const ridString = rid.toString()
          const response = await axios.get(`/api/restaurant`, {
            params: { rid: ridString },
            withCredentials: true, // Send httpOnly cookies
          })

          if (response.data?.restaurant_info) {
            const restaurantInfo = response.data.restaurant_info
            restaurantMap[ridString] = {
              id: restaurantInfo.id?.toString() || ridString,
              name:
                restaurantInfo.name ||
                restaurantInfo.username ||
                `Restaurant ${ridString}`,
              username: restaurantInfo.username,
              phone_number: restaurantInfo.phone_number,
              email: restaurantInfo.email,
              address: restaurantInfo.address,
              city: restaurantInfo.city,
              state: restaurantInfo.state,
              pincode: restaurantInfo.pincode?.toString(),
            }
          } else if (
            response.data?.restaurants &&
            Array.isArray(response.data.restaurants)
          ) {
            // Handle multiple restaurants response format
            const restaurant = response.data.restaurants.find(
              (r: any) => r.id?.toString() === ridString,
            )
            if (restaurant) {
              restaurantMap[ridString] = {
                id: restaurant.id?.toString() || ridString,
                name:
                  restaurant.name ||
                  restaurant.username ||
                  `Restaurant ${ridString}`,
                username: restaurant.username,
                phone_number: restaurant.phone_number,
                email: restaurant.email,
                address: restaurant.address,
                city: restaurant.city,
                state: restaurant.state,
                pincode: restaurant.pincode?.toString(),
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch details for restaurant ${rid}:`, error)
          // Fallback for failed requests
          const ridString = rid.toString()
          restaurantMap[ridString] = {
            id: ridString,
            name: `Restaurant ${ridString}`,
          }
        }
      })

      await Promise.allSettled(fetchPromises)
      return restaurantMap
    },
    enabled: enabled && !!restaurantRids && restaurantRids.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (restaurant data rarely changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })
}
