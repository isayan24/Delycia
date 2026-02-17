import React, { useMemo, useState } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Users2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaffQuery } from '@/hooks/queries/useStaffQueries'
import { useRouterState } from '@tanstack/react-router'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useStaffLeaderboardQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useQueryClient } from '@tanstack/react-query'

export const StaffManagementHeader: React.FC = () => {
  const queryClient = useQueryClient()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isReports = pathname.includes('/reports/')
  const [manualRefreshing, setManualRefreshing] = useState(false)

  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()

  // Queries (for loading state only)
  const { isFetching: isFetchingStaff } = useStaffQuery()

  const leaderboardParams = useMemo(
    () => ({
      rid,
      start_date: currentDateRange.startDate,
      end_date: currentDateRange.endDate,
      page: 1, // We just need an instance for loading state
      limit: 20,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )
  const { isFetching: isFetchingLeaderboard } =
    useStaffLeaderboardQuery(leaderboardParams)

  const isFetching =
    manualRefreshing || (isReports ? isFetchingLeaderboard : isFetchingStaff)

  const handleRefresh = async () => {
    setManualRefreshing(true)
    try {
      if (isReports) {
        // Invalidate all staff-related reports (leaderboard, stats, etc.)
        await queryClient.invalidateQueries({ queryKey: ['staff-leaderboard'] })
      } else {
        // Invalidate staff accounts list
        await queryClient.invalidateQueries({
          queryKey: ['staff', user?.selected_rid],
        })
      }
    } finally {
      // Small artificial delay for better UX affordance if query returns instantly from cache
      setTimeout(() => setManualRefreshing(false), 300)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
        <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-[#3a291d] text-orange-600 border border-orange-100 dark:border-orange-900/10">
            <Users2 className="h-4 w-4" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">
              {isReports ? 'Staff Performance' : 'Staff Management'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        {isReports && (
          <div className="bg-white/50 dark:bg-[#3a291d]/20 rounded-xl border border-[#ead9cd] dark:border-primary/5 p-0.5 flex items-center h-9">
            <DateFilterComponent compact />
          </div>
        )}
        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          className={`h-9 w-9 sm:w-auto sm:px-4 gap-2 text-white rounded-xl shadow-lg transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest border-none shrink-0 ${
            isReports
              ? 'bg-green-600 hover:bg-green-500 shadow-green-500/10'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'
          }`}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            strokeWidth={3}
          />
          <span className="hidden sm:inline-block">
            {isReports ? 'Sync' : 'Refresh'}
          </span>
        </Button>
      </div>
    </header>
  )
}

export default StaffManagementHeader
