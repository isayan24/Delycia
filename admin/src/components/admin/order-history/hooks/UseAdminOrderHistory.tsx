import { useState, useEffect, useCallback, useRef } from 'react'
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
    isFetching, // use isFetching for better loading states in infinite scroll
    isLoading,
    error: queryError,
    refetch,
  } = useOrderHistoryQuery({
    rid,
    page: pagination.page,
    limit: pagination.limit,
    search: effectiveSearch,
    start_date: filters.start_date,
    end_date: filters.end_date,
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

  // Track previous filters/rid to detect resets
  const prevFiltersRef = useRef(
    JSON.stringify({ rid, ...filters, search: effectiveSearch }),
  )

  useEffect(() => {
    // We use effectiveSearch here to avoid resetting the list until 2+ chars are typed
    const currentFilters = JSON.stringify({
      rid,
      ...filters,
      search: effectiveSearch,
    })
    const isResetNeeded = currentFilters !== prevFiltersRef.current

    if (isResetNeeded) {
      prevFiltersRef.current = currentFilters
      setAccumulatedOrders([])
      // After reset, the next data fetch will set page 1 data below
      return
    }

    if (orders.length > 0) {
      const transformed = transformOrderData(orders)

      setAccumulatedOrders((prev) => {
        if (pagination.page === 1) {
          return transformed
        }
        // Append unique orders only (prevent duplicates during rapid scrolling/updates)
        const existingIds = new Set(prev.map((o) => o.id))
        const newUniqueOrders = transformed.filter(
          (o) => !existingIds.has(o.id),
        )
        return [...prev, ...newUniqueOrders]
      })
    } else if (pagination.page === 1) {
      setAccumulatedOrders([])
    }
  }, [
    orders,
    pagination.page,
    filters.start_date,
    filters.end_date,
    rid,
    effectiveSearch,
  ])

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
