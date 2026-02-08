import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface TableOrderItem {
  id: number
  item_id: number
  quantity: number
  order_status: string
  payment_status: string
  total_amount: number
  table_id: number
  table_zone?: string
  table_number?: number
  created_at: string
  updated_at: string
  item_name: string
  item_img: string[]
  variant_name?: string
  special_instructions?: string
  addons?: {
    name: string
    price: number
    quantity: number
  }[]
}

export interface TableOrderCustomer {
  customer_id: number
  name: string
  profile_pic: string
  orders: TableOrderItem[]
}

export interface UseTableOrdersQueryParams {
  table_id: number
  rid: string
  enabled?: boolean
}

/**
 * Query hook for fetching orders by table ID
 * Returns orders grouped by customer
 */
export function useTableOrdersQuery({
  table_id,
  rid,
  enabled = true,
}: UseTableOrdersQueryParams) {
  return useQuery({
    queryKey: ['table-orders', table_id, rid],
    queryFn: async () => {
      const response = await axios.post('/api/orders/by-table', {
        table_id,
        rid,
      })
      return response.data as {
        status: boolean
        data: TableOrderCustomer[]
        error?: string
      }
    },
    enabled: enabled && !!table_id && !!rid,
    // staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export default useTableOrdersQuery
