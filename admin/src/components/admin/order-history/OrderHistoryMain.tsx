import {} from 'react'
import MobileOrderHistory from './mobile/MobileOrderHistory'
import ErrorBoundary from './ErrorBoundary'
import { UseAdminOrderHistory } from './hooks/UseAdminOrderHistory'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import OrderHistoryTablePaginated from './OrderHistoryTablePaginated'
import LoadingScreen from '@/components/common/LoadingScreen'
import {} from 'lucide-react'

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

  return (
    <ErrorBoundary>
      <div className="font-sans  min-h-screen">
        <div className="space-y-5">
          {/* Main Content Area */}
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
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
              />
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
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
                onClearFilters={clearFilters}
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
