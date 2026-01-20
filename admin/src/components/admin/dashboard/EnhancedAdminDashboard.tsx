import React, { useEffect, useMemo } from 'react'
import { ChefHat, AlertCircle } from 'lucide-react'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import {
  useDashboardStatsQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import DateFilterComponent from './DateFilterComponent'
import DateRangeDisplay from './DateRangeDisplay'
import OverviewPage from './OverviewPage'
import LoadingScreen from '@/components/common/LoadingScreen'
import { AnimatePresence, motion } from 'motion/react'

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

  // Use stats query mainly for loading/error state of the overview
  const statsQuery = useDashboardStatsQuery(queryParams)

  const isLoading = statsQuery.isLoading
  const hasError = !!statsQuery.error

  // Refresh handler
  const handleRefresh = () => {
    refreshDashboard()
  }

  // Show loading state on initial load
  if (isLoading && !statsQuery.data) {
    return <LoadingScreen message="Loading dashboard data..." />
  }

  return (
    <div className="">
      {/* Header */}
      <div className="">
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
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <OverviewPage rid={rid} />
          </motion.div>
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
