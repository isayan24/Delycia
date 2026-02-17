import React, { useState } from 'react'
import { Box, ChevronLeft, RefreshCw } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useInventoryLevelsQuery } from '@/hooks/queries/useDashboardQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries/queryKeys'

export const InventoryReportHeader: React.FC = () => {
  const queryClient = useQueryClient()
  const [manualRefreshing, setManualRefreshing] = useState(false)
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid ? String(user.selected_rid) : ''

  const { data, isFetching } = useInventoryLevelsQuery({ rid })
  const totalItems = data?.summary?.total || 0

  const handleRefresh = async () => {
    setManualRefreshing(true)
    try {
      // Invalidate all inventory-related dashboard queries
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      })
    } finally {
      setTimeout(() => setManualRefreshing(false), 300)
    }
  }

  const isLoading = manualRefreshing || isFetching

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
        <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-[#3a291d] text-orange-600 border border-orange-100 dark:border-orange-900/10">
            <Box className="h-4 w-4" />
          </div>
          <div className="">
            <h1 className="text-md sm:text-lg font-[500] text-slate-900 dark:text-white tracking-wide truncate">
              Inventory Report
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Total Item Box */}
        <div className="hidden md:flex flex-col items-end px-3 py-1 bg-white/50 dark:bg-[#3a291d]/20 rounded-xl border border-[#ead9cd] dark:border-primary/5 min-w-[100px]">
          <span className="text-[8px] font-black uppercase tracking-widest text-[#a16b45] opacity-60 leading-none">
            Total Items
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
            {totalItems} <span className="text-[10px] opacity-40">SKUs</span>
          </span>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-9 w-9 sm:w-auto sm:px-4 gap-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest border-none shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
            strokeWidth={3}
          />
          <span className="hidden sm:inline-block">Sync</span>
        </Button>
      </div>
    </header>
  )
}

export default InventoryReportHeader
