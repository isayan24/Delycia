import { useQuery } from '@tanstack/react-query'
import { fetchCategory } from '@/helpers/fetchCategory'
import { useRestaurantId } from '@/hooks/useRestaurantId'

export const useCategoriesQuery = () => {
  const rid = useRestaurantId()

  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', { rid }],
    queryFn: async () => {
      const data = await fetchCategory(rid)
      return data.categories || []
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
