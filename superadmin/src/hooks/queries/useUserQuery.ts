import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/lib/api/users'

export function useUserQuery(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser({ data: { id } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
