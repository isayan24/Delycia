import { useQuery } from '@tanstack/react-query'
import { useState, useCallback } from 'react'

import { Order } from '@/types/Order'
import axios from 'axios'

interface UseOrdersQueryOptions {
  customerId?: string | null | number
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
      try {
        const response = await axios.get('/api/orders', {
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
