import React, { useEffect, useMemo } from 'react'
import { ChefHat, AlertCircle } from 'lucide-react'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import {
  useDashboardStatsQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import OverviewPage from './OverviewPage'
import LoadingScreen from '@/components/common/LoadingScreen'
import { AnimatePresence, motion } from 'motion/react'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface EnhancedAdminDashboardProps {
  rid: string
}

const ErrorDisplay: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="bg-white rounded-xl p-6 max-[500px]:p-2 shadow-sm border border-red-200">
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
  const { selectedRestaurant } = useRestaurantSelector()

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

  const hasError = !!statsQuery.error

  // Refresh handler
  const handleRefresh = () => {
    refreshDashboard()
  }

  // Show loading state on initial load only if absolutely necessary (e.g. no RID)
  // For data refetching, we pass through to OverviewPage which handles skeletons
  if (!rid) {
    return <LoadingScreen message="Initializing dashboard..." />
  }

  return (
    <div className="">
      {/* Header */}
      <div className="">
        <div className="px-6 py-4 max-[500px]:px-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {selectedRestaurant?.name} Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Your restaurant at a glance
                </p>
              </div>
            </div>
          </div>

          {/* Date Range Display Removed */}
        </div>
      </div>

      <div className="p-6 space-y-6 max-[500px]:p-2">
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
