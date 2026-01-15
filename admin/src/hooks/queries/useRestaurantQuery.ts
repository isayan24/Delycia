import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Query Key Factory for Restaurant
// ============================================
export const restaurantKeys = {
  all: ['restaurant'] as const,
  byId: (rid: string) => [...restaurantKeys.all, rid] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch restaurant details
 */
export function useRestaurantQuery(rid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: restaurantKeys.byId(rid ?? ''),
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID is required')
      const response = await axios.get(`/api/restaurant?rid=${rid}`)
      return response.data
    },
    enabled: enabled && !!rid,
    staleTime: 10 * 60 * 1000, // 10 minutes (restaurant data rarely changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
