import { useEffect, useMemo, useState, useCallback } from 'react'
import OrderHistoryInfoList from './order-info/OrderInfoList'
import OrderHistoryDetailsList from './order-details/OrderDetailsList'
import MobileOrderHistory from './mobile/MobileOrderHistory'
import ErrorBoundary from './ErrorBoundary'
import { UseAdminOrderHistory } from './hooks/UseAdminOrderHistory'
import OrderHistoryHeader from './OrderHistoryHeader'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrderHistoryTablePaginated from './OrderHistoryTablePaginated'
import LoadingScreen from '@/components/common/LoadingScreen'

export default function OrderHistoryMain() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const { user } = useAuth()

  const rid = user?.selected_rid || ''

  // Use the refactored hook with pagination and search
  const orderHistoryHook = UseAdminOrderHistory({ rid })

  const {
    orderHistory,
    refreshHistory,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    currentPage,
    search,
    setSearch,
    setDateRange,
    clearFilters,
  } = orderHistoryHook

  // Get the selected order object
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId || !orderHistory.length) return null
    return orderHistory.find((order) => order.id === selectedOrderId) || null
  }, [selectedOrderId, orderHistory])

  // Memoize the order selection handler to prevent child re-renders
  const handleOrderSelect = useCallback((orderId: string) => {
    setSelectedOrderId(orderId)
  }, [])

  // Auto-select first order when orders load (only when no order is selected)
  useEffect(() => {
    if (orderHistory.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orderHistory[0].id)
    }
  }, [orderHistory, orderHistory.length, selectedOrderId]) // Only depend on length to avoid unnecessary triggers

  // Reset selection when orders change significantly
  useEffect(() => {
    if (selectedOrderId && orderHistory.length > 0) {
      const orderExists = orderHistory.some(
        (order) => order.id === selectedOrderId,
      )
      if (!orderExists) {
        setSelectedOrderId(orderHistory[0]?.id || null)
      }
    }
  }, [orderHistory, selectedOrderId])

  // Handle session-related errors
  const sessionError = !user?.restaurant_rids?.[0]

  if (sessionError) {
    return <LoadingScreen message="Authenticating..." />
  }

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col gap-2">
        <Tabs defaultValue="table" className="flex-1 flex flex-col min-h-0">
          <div className="flex-none bg-white   shadow-sm mb-2 p-2 flex items-center justify-between">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>

            <OrderHistoryHeader
              refreshHistory={refreshHistory}
              loading={loading}
            />
          </div>

          {/* Grid View */}
          <TabsContent
            value="grid"
            className="flex-1 min-h-0 mt-0 shadow-sm bg-white overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="hidden md:block w-full h-[calc(100vh-10rem)]">
              <div className="h-full w-full flex overflow-hidden">
                <ErrorBoundary fallback={<div>Error</div>}>
                  <OrderHistoryInfoList
                    orders={orderHistory}
                    selectedOrderId={selectedOrderId}
                    onOrderSelect={handleOrderSelect}
                    loading={loading}
                    error={error}
                    onRetry={refreshHistory}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={goToPage}
                    onNextPage={nextPage}
                    onPrevPage={prevPage}
                    search={search}
                    onSearchChange={setSearch}
                    onDateRangeChange={setDateRange}
                    onClearFilters={clearFilters}
                  />
                </ErrorBoundary>
                <div className="h-full border-l border-gray-100" />
                <ErrorBoundary fallback={<div>Error</div>}>
                  <OrderHistoryDetailsList
                    selectedOrder={selectedOrder}
                    loading={loading}
                  />
                </ErrorBoundary>
              </div>
            </div>
            <div className="block md:hidden h-full overflow-y-auto">
              <MobileOrderHistory
                orders={orderHistory}
                loading={loading}
                error={error}
                onRetry={refreshHistory}
              />
            </div>
          </TabsContent>

          {/* Table View */}
          <TabsContent
            value="table"
            className="flex-1 min-h-0 mt-0 shadow-sm bg-white overflow-hidden flex flex-col data-[state=inactive]:hidden"
          >
            <OrderHistoryTablePaginated
              items={orderHistory}
              loading={loading}
              error={error}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              search={search}
              onSearchChange={setSearch}
              onDateRangeChange={setDateRange}
              onClearFilters={clearFilters}
              onRefresh={refreshHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
