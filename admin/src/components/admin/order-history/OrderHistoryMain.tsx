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

  // Use the refactored hook with pagination and search
  const orderHistoryHook = UseAdminOrderHistory({ rid })

  const {
    orderHistory,
    refreshHistory,
    loading,
    isFetching,
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
    hasNextPage,
  } = orderHistoryHook

  // Handle session-related errors
  const sessionError = !user?.restaurant_rids?.[0]

  if (sessionError) {
    return <LoadingScreen message="Authenticating..." />
  }

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
