import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface TableOrderItem {
  id: number
  item_id: number
  quantity: number
  order_status: string
  payment_status: string
  total_amount: number
  table_no: number
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
  table_no: number
  rid: string
  enabled?: boolean
}

/**
 * Query hook for fetching orders by table number
 * Returns orders grouped by customer
 */
export function useTableOrdersQuery({
  table_no,
  rid,
  enabled = true,
}: UseTableOrdersQueryParams) {
  return useQuery({
    queryKey: ['table-orders', table_no, rid],
    queryFn: async () => {
      const response = await axios.post('/api/orders/by-table', {
        table_no,
        rid,
      })
      return response.data as {
        status: boolean
        data: TableOrderCustomer[]
        error?: string
      }
    },
    enabled: enabled && !!table_no && !!rid,
    // staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export default useTableOrdersQuery
