import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useOrderHistoryQuery } from '@/hooks/queries/useOrderHistoryQuery'
import {
  TransformedOrder,
  transformOrderData,
} from '../utils/orderHistoryUtils'
import { useDebounce } from '@/hooks/useDebounce'

interface UseAdminOrdersProps {
  rid: string | number
}

export const UseAdminOrderHistory = ({ rid }: UseAdminOrdersProps) => {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as any

  // Get filter values from URL search params
  const page = search?.page || 1
  const searchQuery = search?.search || ''
  const filter_type = search?.filter_type
  const start_date = search?.start_date
  const end_date = search?.end_date

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 1000)

  // Only trigger search if 2+ characters are entered (or if cleared)
  const effectiveSearch =
    debouncedSearch.length >= 2 || debouncedSearch.length === 0
      ? debouncedSearch
      : ''

  // State for accumulated orders (for infinite scroll)
  const [accumulatedOrders, setAccumulatedOrders] = useState<
    TransformedOrder[]
  >([])

  // Fetch paginated order history using TanStack Query
  const {
    data: orderHistoryData,
    isFetching,
    isLoading,
    error: queryError,
    refetch,
  } = useOrderHistoryQuery({
    rid,
    page,
    limit: 10,
    search: effectiveSearch,
    start_date,
    end_date,
    filter_type,
  })

  const orders = orderHistoryData?.orders || []

  const paginationMeta = orderHistoryData
    ? {
        total_orders: orderHistoryData.total_orders,
        total_delivered: orderHistoryData.total_delivered,
        total_cancelled: orderHistoryData.total_cancelled,
        total_pages: orderHistoryData.total_pages,
        current_page: orderHistoryData.current_page,
        per_page: orderHistoryData.per_page,
        has_next_page: orderHistoryData.has_next_page,
        has_prev_page: orderHistoryData.has_prev_page,
      }
    : null

  // Handle order data updates - single effect for all order state management
  useEffect(() => {
    if (orders.length > 0) {
      const transformed = transformOrderData(orders)

      setAccumulatedOrders((prev) => {
        if (page === 1) {
          // Page 1: replace all accumulated orders
          return transformed
        }
        // Subsequent pages: append unique orders only
        const existingIds = new Set(prev.map((o) => o.id))
        const newUniqueOrders = transformed.filter(
          (o) => !existingIds.has(o.id),
        )
        return [...prev, ...newUniqueOrders]
      })
    } else if (page === 1 && !isLoading && !isFetching) {
      // No orders on page 1 and not loading: clear accumulated orders
      setAccumulatedOrders([])
    }
  }, [orders, page, isLoading, isFetching])

  // Pagination controls - update URL search params
  const goToPage = useCallback(
    (newPage: number) => {
      navigate({
        to: '/orders/history',
        search: (prev: any) => ({ ...prev, page: newPage }),
      })
    },
    [navigate],
  )

  const nextPage = useCallback(() => {
    navigate({
      to: '/orders/history',
      search: (prev: any) => ({ ...prev, page: (prev?.page || 1) + 1 }),
    })
  }, [navigate])

  const prevPage = useCallback(() => {
    navigate({
      to: '/orders/history',
      search: (prev: any) => ({
        ...prev,
        page: Math.max(1, (prev?.page || 1) - 1),
      }),
    })
  }, [navigate])

  // Search and filter controls - update URL search params
  const setSearch = useCallback(
    (search: string) => {
      navigate({
        to: '/orders/history',
        search: (prev: any) => ({ ...prev, search, page: 1 }),
      })
    },
    [navigate],
  )

  const setDateRange = useCallback(
    (start_date?: string, end_date?: string, filter_type?: string) => {
      navigate({
        to: '/orders/history',
        search: (prev: any) => ({
          ...prev,
          start_date,
          end_date,
          filter_type,
          page: 1, // Reset to page 1 when filters change
        }),
      })
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    navigate({
      to: '/orders/history',
      search: {},
    })
  }, [navigate])

  // Refresh function
  const refreshHistory = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    // Order data (transformed)
    orderHistory: accumulatedOrders,
    rawOrders: orders,

    // Loading and error states
    loading: isLoading,
    isFetching,
    error: queryError ? String(queryError) : null,

    // Pagination metadata
    pagination: paginationMeta,
    hasNextPage: !!paginationMeta?.has_next_page,

    // Pagination controls
    goToPage,
    nextPage,
    prevPage,
    currentPage: page,
    perPage: 10,

    // Search and filter controls
    search: searchQuery,
    setSearch,
    setDateRange,
    clearFilters,

    // Refresh
    refreshHistory,
  }
}
