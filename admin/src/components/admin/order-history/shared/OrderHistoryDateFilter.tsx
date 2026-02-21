import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateFilterType, DateRangeCalculator } from '@/utils/dashboardDateUtils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DateFilterOption {
  value: DateFilterType
  label: string
  description: string
}

const dateFilterOptions: DateFilterOption[] = [
  {
    value: 'today',
    label: 'Today',
    description: 'Current day',
  },
  {
    value: 'yesterday',
    label: 'Yesterday',
    description: 'Previous day',
  },
  {
    value: 'thisWeek',
    label: 'This Week',
    description: 'Current week (Sun-Sat)',
  },
  {
    value: 'lastWeek',
    label: 'Last Week',
    description: 'Previous week',
  },
  {
    value: 'thisMonth',
    label: 'This Month',
    description: 'Current month to date',
  },
  {
    value: 'lastMonth',
    label: 'Last Month',
    description: 'Previous calendar month',
  },
  {
    value: 'thisYear',
    label: 'This Year',
    description: 'Current calendar year',
  },
  {
    value: 'allTime',
    label: 'All Time',
    description: 'All recorded orders',
  },
  {
    value: 'custom',
    label: 'Custom Range',
    description: 'Select specific dates',
  },
]

interface OrderHistoryDateFilterProps {
  compact?: boolean
  className?: string
  onFilterChange: (
    start_date?: string,
    end_date?: string,
    filter_type?: string,
  ) => void
}

export const OrderHistoryDateFilter: React.FC<OrderHistoryDateFilterProps> = ({
  compact = false,
  className,
  onFilterChange,
}) => {
  // Read current filter from URL search params
  const search = useSearch({ strict: false }) as any
  const currentFilterType = (search?.filter_type as DateFilterType) || 'allTime'

  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize temp dates when custom dialog opens
  useEffect(() => {
    if (isCustomDialogOpen) {
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      setTempStartDate(weekAgo.toISOString().split('T')[0])
      setTempEndDate(today.toISOString().split('T')[0])
      setError(null)
    }
  }, [isCustomDialogOpen])

  const handleFilterSelect = (filterType: DateFilterType) => {
    if (filterType === 'custom') {
      setIsCustomDialogOpen(true)
      return
    }

    if (filterType === 'allTime') {
      // For all time, don't send any date parameters
      onFilterChange(undefined, undefined, filterType)
    } else {
      // Calculate date range for the selected filter
      const dateRange = DateRangeCalculator.getDateRange(filterType)
      onFilterChange(dateRange.startDate, dateRange.endDate, filterType)
    }
  }

  const handleCustomRangeApply = () => {
    if (!tempStartDate || !tempEndDate) {
      setError('Please select both start and end dates')
      return
    }

    const startDate = new Date(tempStartDate)
    const endDate = new Date(tempEndDate)

    // Validate date range
    const validation = DateRangeCalculator.validateDateRange(startDate, endDate)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid date range')
      return
    }

    setIsCustomDialogOpen(false)
    setError(null)

    onFilterChange(tempStartDate, tempEndDate, 'custom')
  }

  const handleCustomDialogClose = () => {
    setIsCustomDialogOpen(false)
    setError(null)
  }

  const getCurrentLabel = () => {
    const option = dateFilterOptions.find(
      (opt) => opt.value === currentFilterType,
    )
    return option?.label || 'All Time'
  }

  return (
    <>
      <div className={className}>
        <Select value={currentFilterType} onValueChange={handleFilterSelect}>
          <SelectTrigger
            className={cn(
              'bg-white dark:bg-transparent border-[#ead9cd] dark:border-primary/10 rounded-xl font-medium tracking-wider text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all',
              compact
                ? 'h-9 px-3 text-xs w-full sm:w-auto'
                : 'h-11 px-4 text-sm w-full',
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Calendar
                className={cn(
                  'text-orange-500 shrink-0',
                  compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
                )}
              />
              <SelectValue placeholder="Select date range" className="truncate">
                {getCurrentLabel()}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="end"
            sideOffset={4}
            className="rounded-xl border-[#ead9cd] dark:border-primary/10 p-1 min-w-[220px] max-w-[90vw]"
          >
            {dateFilterOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-[13px] tracking-wide rounded-lg focus:bg-orange-50 dark:focus:bg-[#3a291d] focus:text-orange-600 cursor-pointer py-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-[550]">{option.label}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal tracking-widest">
                    {option.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={handleCustomDialogClose}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#ead9cd] dark:border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Custom Date Range
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={tempStartDate}
                onChange={(e) => {
                  setTempStartDate(e.target.value)
                  setError(null)
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[#ead9cd] dark:border-primary/10 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-[#2d1e14] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={tempEndDate}
                onChange={(e) => {
                  setTempEndDate(e.target.value)
                  setError(null)
                }}
                min={tempStartDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[#ead9cd] dark:border-primary/10 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-[#2d1e14] text-slate-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCustomDialogClose}
              className="rounded-xl border-[#ead9cd] dark:border-primary/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomRangeApply}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
            >
              Apply Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OrderHistoryDateFilter
