import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Query Key Factory for Orders
// ============================================
export const orderKeys = {
  all: ['orders'] as const,
  byRestaurant: (rid: string) => [...orderKeys.all, 'restaurant', rid] as const,
  byTable: (tableId: string) => [...orderKeys.all, 'table', tableId] as const,
  byStatus: (status: string) => [...orderKeys.all, 'status', status] as const,
  byId: (id: string) => [...orderKeys.all, 'order', id] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch orders with optional filters
 * 
 * This is for ACTIVE orders (pending, processing, ready) - real-time data
 */
export function useOrdersQuery(
  params?: {
    rid?: string
    table_id?: string
    status?: string
  },
  enabled = true,
) {
  return useQuery({
    queryKey: params?.rid ? orderKeys.byRestaurant(params.rid) : orderKeys.all,
    queryFn: async () => {
      const response = await axios.get('/api/orders', { params })
      return response.data
    },
    enabled,
    
    // Active orders caching strategy:
    // - 10 second staleTime: balance between freshness and API calls
    // - 2 minute gcTime: keep recent orders in cache
    // - Refetch on window focus: ensure fresh data when user returns
    // - Auto-refetch every 30s: keep orders up-to-date
    staleTime: 10 * 1000, // 10 seconds (reduced from 30s for real-time feel)
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30000, // Auto-refetch every 30s for live orders
    refetchOnWindowFocus: true, // Enable for real-time data
  })
}

// ============================================
// Mutation Hooks
// ============================================

interface CreateOrderParams {
  rid: string
  customer_id: string
  items: Array<{
    item_id: string
    quantity: number
    variant_id?: string
    special_instructions?: string
  }>
  table_id?: number
  delivery_type?: string
  payment_method?: string
  token: string
}

/**
 * Create a new order
 */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      const { token, ...data } = params
      const response = await axios.post('/api/orders', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.byRestaurant(variables.rid),
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

interface UpdateOrderStatusParams {
  orderIds: string[]
  status: string
  preparation_time?: number
  token: string
}

/**
 * Update order status (bulk)
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateOrderStatusParams) => {
      const { token, orderIds, status, preparation_time } = params

      // Call the PATCH /api/orders endpoint
      const response = await axios.patch(
        '/api/orders',
        { orderIds, status, preparation_time },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
