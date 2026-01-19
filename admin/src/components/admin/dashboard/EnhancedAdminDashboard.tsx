import React, { useEffect, useMemo } from 'react'
import { ChefHat, AlertCircle } from 'lucide-react'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import {
  useDashboardStatsQuery,
  useSalesTrendQuery,
  useOrderStatusQuery,
  useTopItemsQuery,
  useCategoryRevenueQuery,
  usePaymentMethodsQuery,
  useDeliveryTypesQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import DateFilterComponent from './DateFilterComponent'
import DateRangeDisplay from './DateRangeDisplay'
import DashboardStatsComponent from './DashboardStats'
import SalesTrendChart from './SalesTrendChart'
import OrderStatusChart from './OrderStatusChart'
import TopSellingItems from './TopSellingItems'
import RevenueByCategoryChart from './RevenueByCategoryChart'
import PaymentMethodChart from './PaymentMethodChart'
import DeliveryTypeChart from './DeliveryTypeChart'
import LoadingScreen from '@/components/common/LoadingScreen'

interface EnhancedAdminDashboardProps {
  rid: string
}

const ErrorDisplay: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-red-600 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Dashboard Error
        </h3>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <span>Retry</span>
          </button>
        )}
      </div>
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">
          Something went wrong loading the dashboard
        </p>
        <p className="text-red-500 text-sm mt-1">
          Please try refreshing the page
        </p>
      </div>
    </div>
  )
}

export const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({
  rid,
}) => {
  const { loadFromStorage, currentDateRange } = useDateFilterStore()
  const refreshDashboard = useRefreshDashboard()

  // Load saved filter state on mount
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  // Query params from date filter
  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  // Individual queries for each dashboard section
  const statsQuery = useDashboardStatsQuery(queryParams)
  const salesTrendQuery = useSalesTrendQuery(queryParams)
  const orderStatusQuery = useOrderStatusQuery(queryParams)
  const topItemsQuery = useTopItemsQuery(queryParams)
  const categoryRevenueQuery = useCategoryRevenueQuery(queryParams)
  const paymentMethodsQuery = usePaymentMethodsQuery(queryParams)
  const deliveryTypesQuery = useDeliveryTypesQuery(queryParams)

  // Aggregate loading and error states
  const isLoading =
    statsQuery.isLoading ||
    salesTrendQuery.isLoading ||
    orderStatusQuery.isLoading ||
    topItemsQuery.isLoading ||
    categoryRevenueQuery.isLoading ||
    paymentMethodsQuery.isLoading ||
    deliveryTypesQuery.isLoading

  const hasError = !!(statsQuery.error || salesTrendQuery.error)

  // Refresh handler - invalidates all dashboard queries
  const handleRefresh = () => {
    refreshDashboard()
  }

  // Show loading state on initial load
  if (isLoading && !statsQuery.data) {
    return <LoadingScreen message="Loading dashboard data..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Delycia Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <StatefulButton
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-orange-600 hover:ring-orange-600"
                title="Refresh dashboard data"
              >
                Refresh
              </StatefulButton>
              <DateFilterComponent />
            </div>
          </div>

          {/* Date Range Display */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DateRangeDisplay />
              {isLoading && statsQuery.data && (
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <span>Refreshing data...</span>
                </div>
              )}
            </div>
            {hasError && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Some data failed to load</span>
                <button
                  onClick={handleRefresh}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <DashboardStatsComponent
          stats={statsQuery.data || null}
          loading={statsQuery.isLoading}
          error={statsQuery.error ? 'Failed to load stats' : null}
          onRetry={handleRefresh}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            error={
              orderStatusQuery.error ? 'Failed to load order status' : null
            }
            onRetry={handleRefresh}
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <PaymentMethodChart
            data={paymentMethodsQuery.data || null}
            loading={paymentMethodsQuery.isLoading}
            error={
              paymentMethodsQuery.error
                ? 'Failed to load payment methods'
                : null
            }
            onRetry={handleRefresh}
          />

          {/* Delivery Types */}
          <DeliveryTypeChart
            data={deliveryTypesQuery.data || null}
            loading={deliveryTypesQuery.isLoading}
            error={
              deliveryTypesQuery.error ? 'Failed to load delivery types' : null
            }
            onRetry={handleRefresh}
          />
        </div>

        {/* Global Error State */}
        {hasError && !statsQuery.data && (
          <div className="col-span-full">
            <ErrorDisplay onRetry={handleRefresh} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedAdminDashboard
