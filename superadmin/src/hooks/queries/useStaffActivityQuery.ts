import { useQuery } from '@tanstack/react-query'
import { getStaffActivity } from '@/lib/api/staff'

interface UseStaffActivityQueryOptions {
  page?: number
  limit?: number
}

export function useStaffActivityQuery(id: string, options: UseStaffActivityQueryOptions = {}) {
  const { page = 1, limit = 10 } = options

  return useQuery({
    queryKey: ['staff-activity', id, page, limit],
    queryFn: () => getStaffActivity({ data: { id, page, limit } }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
