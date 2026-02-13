import { useEffect, useMemo, useState, useCallback } from 'react'
import OrderHistoryInfoList from './order-info/OrderInfoList'
import OrderHistoryDetailsList from './order-details/OrderDetailsList'
import MobileOrderHistory from './mobile/MobileOrderHistory'
import ErrorBoundary from './ErrorBoundary'
import { UseAdminOrderHistory } from './hooks/UseAdminOrderHistory'
import OrderHistoryHeader from './OrderHistoryHeader'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrderHistoryTablePaginated from './OrderHistoryTablePaginated'
import LoadingScreen from '@/components/common/LoadingScreen'
import { ShoppingBag, CheckCircle2, XCircle } from 'lucide-react'

export default function OrderHistoryMain() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const { user } = useAdminAuthQuery()

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
      <div className="font-sans px-3 py-2 min-h-screen">
        <div className="space-y-5">
          {/* Header Section */}
          <OrderHistoryHeader
            refreshHistory={refreshHistory}
            loading={loading}
          />

          <Tabs defaultValue="table" className="space-y-4">
            {/* Consolidated Controls Row: View Switcher (Left) + Stats (Right) */}
            <div className="flex items-center flex-wraps justify-between gap-3 bg-white p-1.5 sm:p-2 rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
              {/* View Switcher (Left) */}
              <TabsList className="shrink-0 p-0.5 bg-gray-100/50 rounded-lg border border-gray-100 h-8 sm:h-9">
                <TabsTrigger
                  value="table"
                  className="px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs rounded-md transition-all"
                >
                  Table
                </TabsTrigger>
                <TabsTrigger
                  value="grid"
                  className="px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs rounded-md transition-all"
                >
                  Split
                </TabsTrigger>
              </TabsList>

              {/* Stats (Right) - Horizontal scroll on mobile */}
              <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
                {/* Total Orders */}
                <div className="flex shrink-0 items-center gap-1.5 py-1 px-2.5 rounded-xl bg-orange-50/50 border border-orange-100/50 group transition-all">
                  <ShoppingBag className="h-3.5 w-3.5 text-orange-600" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {pagination?.total_orders}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Orders
                    </span>
                  </div>
                </div>

                {/* Delivered */}
                <div className="flex shrink-0 items-center gap-1.5 py-1 px-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50 group transition-all">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {pagination?.total_delivered}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Done
                    </span>
                  </div>
                </div>

                {/* Cancelled */}
                <div className="flex shrink-0 items-center gap-1.5 py-1 px-2.5 rounded-xl bg-rose-50/50 border border-rose-100/50 group transition-all">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {pagination?.total_cancelled}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Lost
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid/Split View */}
            <TabsContent value="grid" className="mt-0 outline-none">
              <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="h-[calc(100vh-14.5rem)]  flex overflow-hidden">
                  <div className="w-[360px] lg:w-[400px] shrink-0 border-r border-gray-100 overflow-hidden bg-gray-50/30">
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
                  </div>
                  <div className="flex-1 overflow-hidden ">
                    <OrderHistoryDetailsList
                      selectedOrder={selectedOrder}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
              <div className="block md:hidden">
                <MobileOrderHistory
                  orders={orderHistory}
                  loading={loading}
                  error={error}
                  onRetry={refreshHistory}
                />
              </div>
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table" className="mt-0 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}
