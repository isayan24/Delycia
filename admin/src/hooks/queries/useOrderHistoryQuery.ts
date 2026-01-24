import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface OrderHistoryQueryParams {
  rid: string | number
  page?: number
  limit?: number
  search?: string
  start_date?: string
  end_date?: string
}

interface OrderHistoryResponse {
  status: number
  message: string

  total_orders: number
  total_pages: number
  current_page: number
  per_page: number
  has_next_page: boolean
  has_prev_page: boolean
  orders: any[]
}

export const useOrderHistoryQuery = ({
  rid,
  page = 1,
  limit = 10,
  search = '',
  start_date,
  end_date,
}: OrderHistoryQueryParams) => {
  return useQuery<OrderHistoryResponse>({
    queryKey: ['order-history', rid, page, limit, search, start_date, end_date],
    queryFn: async () => {
      const params: Record<string, any> = {
        rid,
        page,
        limit,
      }

      if (search && search.trim() !== '') {
        params.search = search.trim()
      }

      if (start_date) {
        params.start_date = start_date
      }

      if (end_date) {
        params.end_date = end_date
      }

      const response = await axios.get('/api/orders/order-history', {
        params,
        withCredentials: true,
      })

      // The API returns data nested in response.data.data
      return response.data.data || response.data
    },
    enabled: !!rid,
    staleTime: 0, // Always consider data stale - refetch on every page change
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
  })
}
