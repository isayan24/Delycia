import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useOrderHistoryQuery } from '@/hooks/queries/useOrderHistoryQuery'
import {
  TransformedOrder,
  transformOrderData,
} from '../utils/orderHistoryUtils'
import { useDebounce } from '@/hooks/useDebounce'

interface UseAdminOrdersProps {
  rid: string | number
}

interface PaginationState {
  page: number
  limit: number
}

interface FilterState {
  search: string
  start_date?: string
  end_date?: string
}

export const UseAdminOrderHistory = ({ rid }: UseAdminOrdersProps) => {
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  })

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    start_date: undefined,
    end_date: undefined,
  })

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500)

  // State for transformed orders
  const [transformedOrders, setTransformedOrders] = useState<
    TransformedOrder[]
  >([])

  // Fetch paginated order history using TanStack Query
  const {
    data: orderHistoryData,
    isLoading,
    error: queryError,
    refetch,
  } = useOrderHistoryQuery({
    rid,
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch,
    start_date: filters.start_date,
    end_date: filters.end_date,
  })

  const orders = orderHistoryData?.orders || []

  const paginationMeta = orderHistoryData
    ? {
        total_orders: orderHistoryData.total_orders,
        total_pages: orderHistoryData.total_pages,
        current_page: orderHistoryData.current_page,
        per_page: orderHistoryData.per_page,
        has_next_page: orderHistoryData.has_next_page,
        has_prev_page: orderHistoryData.has_prev_page,
      }
    : null

  // Transform orders when raw data changes
  // Use a ref to avoid infinite re-renders, but include page number to detect page changes
  const ordersRef = useRef<string>('')

  // Memoize orders to prevent unnecessary re-renders
  const stableOrders = useMemo(
    () => orders,
    [JSON.stringify(orders.map((o: any) => o.cart_id || o.id))],
  )

  useEffect(() => {
    // Include page number in the key to detect page navigation
    const ordersKey = JSON.stringify({
      page: pagination.page,
      orderIds: stableOrders.map((o: any) => o.cart_id || o.id),
    })

    // Only skip if both page AND order IDs are identical
    if (ordersKey === ordersRef.current && stableOrders.length > 0) return
    ordersRef.current = ordersKey

    if (stableOrders.length > 0) {
      // Transform raw API data to UI format
      const transformed = transformOrderData(stableOrders)

      setTransformedOrders(transformed)
    } else {
      setTransformedOrders([])
    }
  }, [stableOrders, pagination.page])

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const nextPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
  }, [])

  const prevPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setPagination({ page: 1, limit })
  }, [])

  // Search and filter controls
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to page 1 on search
  }, [])

  const setDateRange = useCallback((start_date?: string, end_date?: string) => {
    setFilters((prev) => ({ ...prev, start_date, end_date }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to page 1 on filter change
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      start_date: undefined,
      end_date: undefined,
    })
    setPagination({ page: 1, limit: 10 })
  }, [])

  // Refresh function
  const refreshHistory = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    // Order data (transformed)
    orderHistory: transformedOrders,
    rawOrders: orders,

    // Loading and error states
    loading: isLoading,
    error: queryError ? String(queryError) : null,

    // Pagination metadata
    pagination: paginationMeta,

    // Pagination controls
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    currentPage: pagination.page,
    perPage: pagination.limit,

    // Search and filter controls
    search: filters.search,
    setSearch,
    setDateRange,
    clearFilters,

    // Refresh
    refreshHistory,
  }
}
