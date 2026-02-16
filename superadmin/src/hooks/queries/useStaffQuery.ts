import { useQuery } from '@tanstack/react-query'
import { getStaff, type StaffFilters } from '@/lib/api/staff'

export interface StaffResponse {
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

export function useStaffQuery(filters: StaffFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'staff', filters],
    queryFn: async () => {
      const response = await getStaff({ data: filters })
      const result: StaffResponse = await response.json()
      return result
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
