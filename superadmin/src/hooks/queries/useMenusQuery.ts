import { useQuery } from '@tanstack/react-query'
import { getMenus, type MenuFilters } from '@/lib/api/menus'

export interface MenusResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    data: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function useMenusQuery(filters: MenuFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'menus', filters],
    queryFn: async () => {
      const response = await getMenus({ data: filters })
      const result: MenusResponse = await response.json()
      return result
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
