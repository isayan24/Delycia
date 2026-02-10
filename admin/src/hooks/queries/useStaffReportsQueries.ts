import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface StaffLeaderboardParams {
  rid: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

interface StaffMember {
  staff_id: number
  staff_name: string
  username: string
  profile_pic: string | null
  role: number
  total_orders: number
  total_revenue: number
  avg_order_value: number
  first_order_date: string
  last_order_date: string
  unique_customers: number
}

interface StaffLeaderboardResponse {
  staff: StaffMember[]
  pagination: {
    total_staff: number
    total_pages: number
    current_page: number
    per_page: number
    has_next_page: boolean
    has_prev_page: boolean
  }
}

export const useStaffLeaderboardQuery = (params: StaffLeaderboardParams) => {
  return useQuery({
    queryKey: ['staff-leaderboard', params],
    queryFn: async () => {
      const response = await axios.get('/api/staff-reports', { params })

      // The backend apiResponse.success spreads data directly: { statusCode, message, ...data }
      // So staff and pagination are at the root level of response.data
      const result: StaffLeaderboardResponse = {
        staff: response.data.staff || [],
        pagination: response.data.pagination || {
          total_staff: 0,
          total_pages: 0,
          current_page: 1,
          per_page: 20,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      return result
    },
    enabled: !!params.rid,
    staleTime: 30000, // 30 seconds
  })
}

interface StaffOrdersParams {
  rid: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

interface OrderItem {
  id: number
  item_id: number
  item_name: string
  quantity: number
  price: number
  variant_id: number
  special_instructions: string | null
}

interface StaffOrder {
  cart_id: string
  customer_id: number
  table_id: number
  table_zone?: string
  table_number?: number
  payment_method: string
  payment_status: string
  order_status: string
  delivery_type: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_username: string
  customer_profile_pic: string | null
  order_total: number
  total_discount: number
  items: OrderItem[]
}

interface StaffOrdersResponse {
  staff: {
    id: number
    name: string
    username: string
    profile_pic: string | null
    role: number
    phone_number: string
  }
  orders: StaffOrder[]
  summary: any,
  pagination: {
    total_orders: number
    total_pages: number
    current_page: number
    per_page: number
    has_next_page: boolean
    has_prev_page: boolean
  }
}

export const useStaffOrdersQuery = (
  staffId: string,
  params: StaffOrdersParams,
) => {
  return useQuery({
    queryKey: ['staff-orders', staffId, params],
    queryFn: async () => {
      const response = await axios.get(`/api/staff-reports/${staffId}`, {
        params,
      }) 

      // Same structure - data is spread at root level
      const result: StaffOrdersResponse = {
        staff: response.data.staff,
        orders: response.data.orders || [],
        summary: response.data.summary || {},
        pagination: response.data.pagination || {
          total_orders: 0,
          total_pages: 0,
          current_page: 1,
          per_page: 10,
          has_next_page: false,
          has_prev_page: false,
        },
      }
      return result
    },
    enabled: !!staffId && !!params.rid,
    staleTime: 30000, // 30 seconds
  })
}
