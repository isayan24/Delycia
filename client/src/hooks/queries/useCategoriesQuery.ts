import { useQuery } from '@tanstack/react-query'
import { useRestaurantId } from '@/hooks/useRestaurantId'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'

export const useCategoriesQuery = () => {
  const rid = useRestaurantId()

  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.categories.byRid(rid),
    queryFn: async () => {
      // Use local API route which proxies to backend
      const url = rid ? `/api/categories?rid=${rid}` : '/api/categories'
      const response = await axios.get(url)
      return response.data.categories || []
    },
    enabled: !!rid,
  })

  return {
    categories,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}
