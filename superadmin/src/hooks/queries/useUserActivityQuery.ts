import { useQuery } from '@tanstack/react-query'
import { getUserActivity } from '@/lib/api/users'

interface UseUserActivityQueryOptions {
  page?: number
  limit?: number
}

export function useUserActivityQuery(id: string, options: UseUserActivityQueryOptions = {}) {
  const { page = 1, limit = 10 } = options

  return useQuery({
    queryKey: ['user-activity', id, page, limit],
    queryFn: () => getUserActivity({ data: { id, page, limit } }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
