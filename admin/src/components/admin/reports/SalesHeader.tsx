import { Link, useSearch } from '@tanstack/react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  BarChart3,
  LayoutDashboard,
  Users,
  Truck,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRefreshDashboard } from '@/hooks/queries/useDashboardQueries'
import React from 'react'

export const SalesHeader: React.FC = () => {
  const search = useSearch({ strict: false }) as any
  const activeTab = search?.tab || 'overview'
  const refreshDashboard = useRefreshDashboard()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'items', label: 'Items', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'delivery', label: 'Delivery', icon: Truck },
  ]

  const handleRefresh = async () => {
    await refreshDashboard()
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
        <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to="/reports/sales"
              search={(prev: any) => ({ ...prev, tab: tab.id })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 dark:shadow-none'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="size-3.5" strokeWidth={3} />
              <span className="hidden xs:inline">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-9 w-9 sm:w-auto sm:px-3 p-0 sm:gap-2 rounded-xl border-[#ead9cd] dark:border-primary/10 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider hover:bg-orange-50 dark:hover:bg-[#3a291d] transition-all shrink-0 bg-white dark:bg-transparent"
        >
          <RefreshCw className="h-3.5 w-3.5 text-orange-500" strokeWidth={3} />
          <span className="hidden sm:inline-block">Refresh</span>
        </Button>
      </div>
    </header>
  )
}

export default SalesHeader
