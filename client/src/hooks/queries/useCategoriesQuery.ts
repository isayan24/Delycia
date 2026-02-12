import { useQuery } from '@tanstack/react-query'
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'

export const useCategoriesQuery = () => {
  const username = useRestaurantUsername()

  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.categories.byUsername(username),
    queryFn: async () => {
      if (!username) {
        console.warn('[useCategoriesQuery] No username available')
        return []
      }

      // Use local API route which proxies to backend
      const url = `/api/categories?username=${username}`
      console.log('[useCategoriesQuery] Fetching categories for:', username)
      const response = await axios.get(url)
      return response.data.categories || []
    },
    enabled: !!username, // Only run query if username exists
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    categories,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}
