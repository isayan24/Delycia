import React, { useEffect, useMemo, useState } from 'react'
import { ChefHat, AlertCircle, LayoutDashboard, BarChart2 } from 'lucide-react'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import {
  useDashboardStatsQuery,
  useSalesTrendQuery,
  useOrderStatusQuery,
  useTopItemsQuery,
  useCategoryRevenueQuery,
  useDeliveryTypesQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import DateFilterComponent from './DateFilterComponent'
import DateRangeDisplay from './DateRangeDisplay'
import DashboardStatsComponent from './DashboardStats'
import OverviewPage from './OverviewPage'
import SalesTrendChart from './SalesTrendChart'
import OrderStatusChart from './OrderStatusChart'
import TopSellingItems from './TopSellingItems'
import RevenueByCategoryChart from './RevenueByCategoryChart'
import DeliveryTypeChart from './DeliveryTypeChart'
import LoadingScreen from '@/components/common/LoadingScreen'
import CustomerActivityTable from './CustomerInsights'
import { motion, AnimatePresence } from 'motion/react'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>(
    'overview',
  )

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
  const deliveryTypesQuery = useDeliveryTypesQuery(queryParams)

  // Aggregate loading and error states
  const isLoading =
    statsQuery.isLoading ||
    salesTrendQuery.isLoading ||
    orderStatusQuery.isLoading ||
    topItemsQuery.isLoading ||
    categoryRevenueQuery.isLoading ||
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
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
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

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="font-medium">Analytics</span>
            </button>
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
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <OverviewPage rid={rid} />
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
                  error={
                    salesTrendQuery.error ? 'Failed to load sales trend' : null
                  }
                  onRetry={handleRefresh}
                />

                {/* Order Status */}
                <OrderStatusChart
                  data={orderStatusQuery.data || null}
                  loading={orderStatusQuery.isLoading}
                  error={
                    orderStatusQuery.error
                      ? 'Failed to load order status'
                      : null
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
                  error={
                    topItemsQuery.error ? 'Failed to load top items' : null
                  }
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      deliveryTypesQuery.error
                        ? 'Failed to load delivery types'
                        : null
                    }
                    onRetry={handleRefresh}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
