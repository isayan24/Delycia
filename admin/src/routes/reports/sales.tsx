import { createFileRoute } from '@tanstack/react-router'
import {
  useDashboardStatsQuery,
  useSalesTrendQuery,
  useOrderStatusQuery,
  useTopItemsQuery,
  useCategoryRevenueQuery,
  useDeliveryTypesQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import DashboardStatsComponent from '@/components/admin/dashboard/DashboardStats'
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart'
import OrderStatusChart from '@/components/admin/dashboard/OrderStatusChart'
import TopSellingItems from '@/components/admin/dashboard/TopSellingItems'
import RevenueByCategoryChart from '@/components/admin/dashboard/RevenueByCategoryChart'
import DeliveryTypeChart from '@/components/admin/dashboard/DeliveryTypeChart'
import CustomerActivityTable from '@/components/admin/dashboard/CustomerInsights'
import LoadingScreen from '@/components/common/LoadingScreen'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useMemo } from 'react'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import DateRangeDisplay from '@/components/admin/dashboard/DateRangeDisplay'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { AlertCircle } from 'lucide-react'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/reports/sales')({
  beforeLoad: requireAuth,
  component: SalesReportPage,
})

function SalesReportPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()
  const refreshDashboard = useRefreshDashboard()

  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const statsQuery = useDashboardStatsQuery(queryParams)
  const salesTrendQuery = useSalesTrendQuery(queryParams)
  const orderStatusQuery = useOrderStatusQuery(queryParams)
  const topItemsQuery = useTopItemsQuery(queryParams)
  const categoryRevenueQuery = useCategoryRevenueQuery(queryParams)
  const deliveryTypesQuery = useDeliveryTypesQuery(queryParams)

  const isLoading =
    statsQuery.isLoading ||
    salesTrendQuery.isLoading ||
    orderStatusQuery.isLoading ||
    topItemsQuery.isLoading ||
    categoryRevenueQuery.isLoading ||
    deliveryTypesQuery.isLoading

  const hasError = !!(statsQuery.error || salesTrendQuery.error)

  const handleRefresh = async () => {
    await refreshDashboard()
  }

  if (isLoading && !statsQuery.data) {
    return <LoadingScreen message="Loading sales report..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Sales Report
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyze your sales performance and trends.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <DateFilterComponent />
          </div>
          <StatefulButton onClick={handleRefresh} className="w-auto shadow-sm">
            Refresh
          </StatefulButton>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <DateRangeDisplay />
        {hasError && (
          <div className="flex items-center space-x-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Some data failed to load</span>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <DashboardStatsComponent
        stats={statsQuery.data || null}
        loading={statsQuery.isLoading}
        error={statsQuery.error ? 'Failed to load stats' : null}
        onRetry={handleRefresh}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <SalesTrendChart
          data={salesTrendQuery.data || null}
          loading={salesTrendQuery.isLoading}
          error={salesTrendQuery.error ? 'Failed to load sales trend' : null}
          onRetry={handleRefresh}
        />

        {/* Order Status */}
        <OrderStatusChart
          data={orderStatusQuery.data || null}
          loading={orderStatusQuery.isLoading}
          error={orderStatusQuery.error ? 'Failed to load order status' : null}
          onRetry={handleRefresh}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Items */}
        <TopSellingItems
          data={topItemsQuery.data || null}
          loading={topItemsQuery.isLoading}
          error={topItemsQuery.error ? 'Failed to load top items' : null}
          onRetry={handleRefresh}
        />

        {/* Revenue by Category */}
        <RevenueByCategoryChart
          data={categoryRevenueQuery.data || null}
          loading={categoryRevenueQuery.isLoading}
          error={
            categoryRevenueQuery.error
              ? 'Failed to load category revenue'
              : null
          }
          onRetry={handleRefresh}
        />
      </div>

      {/* Bottom Row: Customer Activity & Delivery Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Activity - Takes up 2/3 space */}
        <div className="lg:col-span-2">
          <CustomerActivityTable rid={rid} />
        </div>

        {/* Delivery Types - Takes up 1/3 space */}
        <div className="lg:col-span-1">
          <DeliveryTypeChart
            data={deliveryTypesQuery.data || null}
            loading={deliveryTypesQuery.isLoading}
            error={
              deliveryTypesQuery.error ? 'Failed to load delivery types' : null
            }
            onRetry={handleRefresh}
          />
        </div>
      </div>
    </div>
  )
}
