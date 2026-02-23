import MobileOrderHistory from './mobile/MobileOrderHistory'
import ErrorBoundary from './ErrorBoundary'
import { UseAdminOrderHistory } from './hooks/UseAdminOrderHistory'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import OrderHistoryTablePaginated from './OrderHistoryTablePaginated'
import LoadingScreen from '@/components/common/LoadingScreen'
import { useState, useCallback, useMemo } from 'react'
import { useMergeOrders } from '@/hooks/mutations/useMergeOrders'
import useToast from '@/hooks/UseToast'

export default function OrderHistoryMain() {
  const { user } = useAdminAuthQuery()

  const rid = user?.selected_rid || ''

  // Handle session-related errors - don't render if no rid
  const sessionError = !user?.restaurant_rids?.[0] || !rid

  if (sessionError) {
    return <LoadingScreen message="Authenticating..." />
  }

  // Use the refactored hook with pagination and search - only when rid is valid
  const orderHistoryHook = UseAdminOrderHistory({ rid })

  const {
    orderHistory,
    refreshHistory,
    loading,
    isFetching,
    error,
    pagination,
    nextPage,
    search,
    setSearch,
    setDateRange,
    clearFilters,
    hasNextPage,
  } = orderHistoryHook

  // Lifted selection logic for merging
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const mergeMutation = useMergeOrders()
  const { showError, showSuccess } = useToast()

  const toggleSelection = useCallback((cartId: string) => {
    setSelectedCartIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cartId)) {
        newSet.delete(cartId)
      } else {
        newSet.add(cartId)
      }
      return newSet
    })
  }, [])

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev)
    setSelectedCartIds(new Set())
  }, [])

  const activeCustomerId = useMemo(() => {
    if (selectedCartIds.size === 0) return null
    const firstSelectedId = selectedCartIds.values().next().value
    const order = orderHistory.find((o) => o.id === firstSelectedId)
    return (order as any)?.customerId || (order as any)?.customer_id
  }, [selectedCartIds, orderHistory])

  const handleMerge = async () => {
    if (selectedCartIds.size < 2) {
      showError('Error', 'Select at least 2 orders to merge')
      return
    }

    const cartIdsArray = Array.from(selectedCartIds)
    const targetCartId = cartIdsArray[0]

    mergeMutation.mutate(
      { cartIds: cartIdsArray, targetCartId },
      {
        onSuccess: (data) => {
          if (data.statusCode === 200) {
            setSelectedCartIds(new Set())
            setIsSelectionMode(false)
            showSuccess('Success', 'Orders merged successfully')
            refreshHistory()
          }
        },
      },
    )
  }

  return (
    <ErrorBoundary>
      <div className="font-sans  min-h-screen">
        <div className="space-y-5">
          {/* Main Content Area */}
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden min-[501px]:block rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
              <OrderHistoryTablePaginated
                items={orderHistory}
                loading={loading}
                isFetching={isFetching}
                error={error}
                pagination={pagination}
                hasNextPage={hasNextPage}
                onNextPage={nextPage}
                search={search}
                onSearchChange={setSearch}
                onDateRangeChange={setDateRange}
                onClearFilters={clearFilters}
                // Selection props
                selectedCartIds={selectedCartIds}
                isSelectionMode={isSelectionMode}
                activeCustomerId={activeCustomerId}
                toggleSelection={toggleSelection}
                toggleSelectionMode={toggleSelectionMode}
                onMerge={handleMerge}
                isMergePending={mergeMutation.isPending}
              />
            </div>

            {/* Mobile View */}
            <div className="block min-[501px]:hidden">
              <MobileOrderHistory
                orders={orderHistory}
                loading={loading}
                isFetching={isFetching}
                error={error}
                onRetry={refreshHistory}
                pagination={pagination}
                search={search}
                onSearchChange={setSearch}
                onDateRangeChange={setDateRange}
                hasNextPage={hasNextPage}
                onNextPage={nextPage}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
