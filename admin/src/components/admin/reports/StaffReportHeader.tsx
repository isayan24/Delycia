import React, { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useStaffOrdersQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { getRoleBadge } from '@/components/admin/staff/helpers/getRoleBadge'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import { Button } from '@/components/ui/button'

export const StaffReportHeader: React.FC = () => {
  // Use non-strict useParams because this header is rendered globally
  // and might be accessed before the route is fully matched or outside the route scope
  const params = useParams({ strict: false }) as any
  const staffId = params?.staffId

  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()

  const queryParams = useMemo(
    () => ({
      rid,
      start_date: currentDateRange.startDate,
      end_date: currentDateRange.endDate,
      page: 1,
      limit: 1, // We only need staff metadata here
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const { data, refetch, isFetching } = useStaffOrdersQuery(
    staffId,
    queryParams,
  )

  const handleRefresh = async () => {
    await refetch()
  }

  // Defensive guard: if we somehow bypassed DynamicHeader logic or staffId is missing
  if (!staffId) {
    return (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
          <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />
          <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
            Staff Analytics
          </h1>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
        <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />

        <Link
          to="/reports/staff"
          search={(prev: any) => ({ ...prev, tab: 'staff' })}
          className="p-2 hover:bg-slate-100 dark:hover:bg-primary/5 rounded-xl transition-colors text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        {data?.staff && (
          <div className="flex items-center gap-3 ml-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <Avatar className="h-9 w-9 border-2 border-white dark:border-[#3a291d] shadow-sm">
              <AvatarImage src={data.staff.profile_pic || undefined} />
              <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-black text-[10px] uppercase">
                {data.staff.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col min-w-0">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                {data.staff.name}
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#a16b45] font-black uppercase opacity-60">
                  @{data.staff.username}
                </span>
                <div className="scale-[0.8]">
                  {getRoleBadge(data.staff.role)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <div className="bg-white/50 dark:bg-[#3a291d]/20 rounded-xl border border-[#ead9cd] dark:border-primary/5 p-0.5 flex items-center h-9">
          <DateFilterComponent compact />
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          className="h-9 w-9 sm:w-auto sm:px-3 gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest border-none shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Sync</span>
        </Button>
      </div>
    </header>
  )
}

export default StaffReportHeader
