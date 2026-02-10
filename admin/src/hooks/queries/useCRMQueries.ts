import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries/queryKeys'
import axios from 'axios'

// Types
export interface Customer {
  user_id: number
  name: string
  phone_number: string
  profile_pic: string | null
  email: string | null
  visit_count: number
  last_visit_at: string
  first_visit_at: string
  total_spent: number
  avg_order_value: number
  last_order_items: string[]
}

export interface CRMStats {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  visitTrend: { date: string; visits: number }[]
}

export interface CustomerDetails {
  profile: Customer
  history: {
    order_id: number
    cart_id: string
    total_amount: number
    discount_amount?: number
    created_at: string
    order_status: string
    items: string
  }[]
}

interface CRMListResponse {
  customers: Customer[]
}

interface CRMStatsResponse {
  stats: CRMStats
}

interface CustomerDetailsResponse {
  profile: Customer
  history: CustomerDetails['history']
}

// Queries
export function useCRMListQuery(params: { rid: string; timeRange?: string }) {
  return useQuery({
    queryKey: queryKeys.crm.list(params),
    queryFn: async (): Promise<Customer[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')
      console.log('getRestaurantCustomers params:', params)
      const response = await axios.get<CRMListResponse>('/api/crm', {
        params,
      })

      return response.data.customers
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCRMStatsQuery(params: { rid: string; timeRange?: string }) {
  return useQuery({
    queryKey: queryKeys.crm.stats(params),
    queryFn: async (): Promise<CRMStats> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<CRMStatsResponse>('/api/crm/stats', {
        params,
      })

      return response.data.stats
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCustomerDetailsQuery(params: {
  rid: string
  customerId: string | null
}) {
  return useQuery({
    queryKey: queryKeys.crm.details(params),
    queryFn: async (): Promise<CustomerDetails> => {
      if (!params.rid || !params.customerId)
        throw new Error('Required params missing')

      const response = await axios.get<CustomerDetailsResponse>(
        '/api/crm/details',
        {
          params,
        },
      )

      return response.data
    },
    enabled: !!params.rid && !!params.customerId,
    staleTime: 5 * 60 * 1000,
  })
}
