import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import tokenService from '@/services/tokenService'
import axiosInstance from '@/lib/axios'
import { Order } from '@/types/Order'

interface UseOrdersQueryOptions {
  customerId?: string
  rid?: string | null
  autoRefreshInterval?: number
  enableAutoRefresh?: boolean
}

export const useOrdersQuery = ({
  customerId,
  rid,
  autoRefreshInterval = 30000,
  enableAutoRefresh = true,
}: UseOrdersQueryOptions) => {
  const queryClient = useQueryClient()
  const [isAutoRefreshActive, setIsAutoRefreshActive] =
    useState(enableAutoRefresh)

  const {
    data: allOrders = [],
    isLoading,
    isError,
    error,
    refetch,
    status: queryStatus,
  } = useQuery({
    queryKey: ['orders', { customerId }],
    queryFn: async () => {
      if (!customerId) return []
      const token = await tokenService.getValidAccessToken()
      if (!token) throw new Error('No access token available')

      try {
        const response = await axiosInstance.get('/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            customer_id: customerId,
          },
        })

        if (response.data?.statusCode === 200 && response.data?.orders) {
          return response.data.orders
        }
        return []
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },
    enabled: !!customerId,
    // Only refresh if active and interval is set
    refetchInterval:
      isAutoRefreshActive && autoRefreshInterval > 0
        ? autoRefreshInterval
        : false,
  })

  // Derived state: filtered orders
  const orders = rid
    ? allOrders.filter((order: Order) => String(order.rid) === String(rid))
    : allOrders

  // Derived status string (mimicking UseFetchOrders behavior)
  let status = 'Loading...'
  if (queryStatus === 'pending') {
    status = 'Loading orders...'
  } else if (queryStatus === 'error') {
    status = 'Error loading orders'
  } else if (queryStatus === 'success') {
    const totalOrdersText = rid
      ? `${orders.length} orders for restaurant (${allOrders.length} total)`
      : `${allOrders.length} orders`
    status = `Loaded ${totalOrdersText} successfully ✅`
  }

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshActive((prev) => !prev)
  }, [])

  return {
    orders,
    allOrders,
    status,
    isLoading,
    error: isError ? (error as Error).message : null,
    refreshOrders: refetch,
    toggleAutoRefresh,
    isAutoRefreshActive,
  }
}
