import { useQuery } from '@tanstack/react-query'
import { useRestaurantId } from '@/hooks/useRestaurantId'
import axiosInstance from '@/lib/axios'

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
      const url = rid ? `/categories?rid=${rid}` : '/categories'
      const response = await axiosInstance.get(url)
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
