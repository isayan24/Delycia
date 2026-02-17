import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface OrderHistoryQueryParams {
  rid: string | number
  page?: number
  limit?: number
  search?: string
  start_date?: string
  end_date?: string
  filter_type?: string
}

interface OrderHistoryResponse {
  status: number
  message: string

  total_orders: number
  total_delivered: number
  total_cancelled: number
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
  filter_type,
}: OrderHistoryQueryParams) => {
  return useQuery<OrderHistoryResponse>({
    queryKey: ['order-history', rid, page, limit, search, start_date, end_date, filter_type],
    queryFn: async () => {
      // Ensure rid is valid before making the request
      if (!rid) {
        throw new Error('Restaurant ID is required')
      }

      const params: Record<string, any> = {
        rid,
        page,
        limit,
      }

      if (search && search.trim() !== '') {
        params.search = search.trim()
      }

      if (filter_type) {
        params.filter_type = filter_type
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
    enabled: !!rid, // Only run query if rid exists
    staleTime: 1000, // Consider data fresh for 1 second to prevent rapid refetches
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  })
}
