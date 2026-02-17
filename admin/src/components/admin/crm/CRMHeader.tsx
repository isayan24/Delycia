import React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRefreshCRM } from '@/hooks/queries/useCRMQueries'

export const CRMHeader: React.FC = () => {
  const search = useSearch({ strict: false }) as any
  const timeRange = search?.timeRange || 'this_month'
  const refreshCRM = useRefreshCRM()
  const navigate = useNavigate()

  const handleRefresh = async () => {
    await refreshCRM()
  }

  const handleTimeRangeChange = (value: string) => {
    navigate({
      to: '/reports/crm',
      search: (prev: any) => ({ ...prev, timeRange: value }),
    })
  }

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 dark:bg-[#2d1e14]/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />
        <div className="h-4 w-px bg-gray-200 dark:bg-primary/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-[#3a291d] text-orange-600 border border-orange-100 dark:border-orange-900/10">
            <Users className="h-4 w-4" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-lg font-[500] text-slate-900 dark:text-white ">
              CRM Reports
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="h-9 w-[130px] sm:w-[160px] bg-white dark:bg-transparent border-[#ead9cd] dark:border-primary/10 rounded-xl text-[14px] font-[500] tracking-wider text-slate-600 dark:text-slate-300">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#ead9cd] dark:border-primary/10">
              {timeRanges.map((range) => (
                <SelectItem
                  key={range.value}
                  value={range.value}
                  className="text-[14px] font-[500] tracking-wider rounded-lg focus:bg-orange-50 dark:focus:bg-[#3a291d] focus:text-orange-600 cursor-pointer"
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-9 px-3 gap-2 rounded-xl border-[#ead9cd] dark:border-primary/10 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider hover:bg-orange-50 dark:hover:bg-[#3a291d] transition-all shrink-0 bg-white dark:bg-transparent"
        >
          <RefreshCw className="h-3.5 w-3.5 text-orange-500" strokeWidth={3} />
          <span className="hidden sm:inline-block">Sync Data</span>
        </Button>
      </div>
    </header>
  )
}

export default CRMHeader
