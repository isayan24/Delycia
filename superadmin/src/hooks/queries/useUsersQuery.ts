import { useQuery } from '@tanstack/react-query'
import { getUsers, type User, type UserFilters } from '@/lib/api/users'

export interface UsersResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    data: User[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// Re-export types for convenience
export type { User, UserFilters }

async function fetchUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const response = await getUsers({ data: filters })
  const data = await response.json()
  return data
}

export function useUsersQuery(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
