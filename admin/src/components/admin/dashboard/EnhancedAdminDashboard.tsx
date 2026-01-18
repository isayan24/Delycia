import React, { useEffect, useCallback, useState } from 'react'
import { ChefHat, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useDashboardData } from '@/hooks/useDashboardData'
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
  // accessToken removed - using httpOnly cookies
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
            <RefreshCw className="w-4 h-4" />
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
  const { loadFromStorage } = useDateFilterStore()
  const { data, loading, error, refetch } = useDashboardData({ rid })
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Load saved filter state on mount
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const handleHardRefresh = () => {
    window.location.reload()
  }

  // Enhanced refresh function with success notification
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      setLastRefreshTime(new Date())
      setShowRefreshSuccess(true)
      setTimeout(() => setShowRefreshSuccess(false), 3000)
    } catch (error) {
      // Error is already handled by the hook
      console.error('Refresh failed:', error)
    }
  }, [refetch])

  // Show loading state on initial load
  if (loading && !data) {
    return <LoadingScreen message="Loading dashboard data..." />
  }

  // Props are guaranteed to be valid by parent component and TypeScript

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showRefreshSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span>Dashboard refreshed successfully!</span>
        </div>
      )}

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
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
                title="Refresh dashboard data (Ctrl+R or F5)"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <DateFilterComponent />
            </div>
          </div>

          {/* Date Range Display */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DateRangeDisplay />
              {loading && data && (
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Refreshing data...</span>
                </div>
              )}
              {lastRefreshTime && !loading && (
                <div className="text-xs text-gray-500">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}
            </div>
            {error && (
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
          stats={data?.stats || null}
          loading={loading}
          error={error}
          onRetry={handleHardRefresh}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <SalesTrendChart
            data={data?.salesTrend || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />

          {/* Order Status */}
          <OrderStatusChart
            data={data?.orderStatus || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <TopSellingItems
            data={data?.topItems || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />

          {/* Revenue by Category */}
          <RevenueByCategoryChart
            data={data?.categoryRevenue || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <PaymentMethodChart
            data={data?.paymentMethods || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />

          {/* Delivery Types */}
          <DeliveryTypeChart
            data={data?.deliveryTypes || null}
            loading={loading}
            error={error}
            onRetry={handleHardRefresh}
          />
        </div>

        {/* Global Error State */}
        {error && !data && (
          <div className="col-span-full">
            <ErrorDisplay onRetry={handleHardRefresh} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedAdminDashboard
