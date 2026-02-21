import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Settings2, Loader2 } from 'lucide-react'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { DateFilterType } from '@/utils/dashboardDateUtils'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    value: 'last7days',
    label: 'Last 7 Days',
    description: 'Past week including today',
  },
  {
    value: 'lastMonth',
    label: 'Last Month',
    description: 'Previous calendar month',
  },
  {
    value: 'thisMonth',
    label: 'This Month',
    description: 'Current month to date',
  },
  {
    value: 'allTime',
    label: 'All Time',
    description: 'All time earnings',
  },
  {
    value: 'custom',
    label: 'Custom Range',
    description: 'Select specific dates',
  },
]

interface DateFilterComponentProps {
  compact?: boolean
  hideCustomRange?: boolean
  className?: string
}

export const DateFilterComponent: React.FC<DateFilterComponentProps> = ({
  compact = false,
  hideCustomRange = false,
  className,
}) => {
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')

  const {
    selectedFilter,
    customStartDate,
    customEndDate,
    isCustomRangeOpen,
    isLoading,
    error,
    setFilter,
    setCustomRange,
    toggleCustomRange,
    setError,
  } = useDateFilterStore()

  // Initialize temp dates when custom range opens
  useEffect(() => {
    if (isCustomRangeOpen) {
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      setTempStartDate(
        customStartDate
          ? customStartDate.toISOString().split('T')[0]
          : weekAgo.toISOString().split('T')[0],
      )
      setTempEndDate(
        customEndDate
          ? customEndDate.toISOString().split('T')[0]
          : today.toISOString().split('T')[0],
      )
    }
  }, [isCustomRangeOpen, customStartDate, customEndDate])

  const handleFilterSelect = (value: string) => {
    const filterType = value as DateFilterType
    if (filterType === 'custom') {
      toggleCustomRange()
    } else {
      setFilter(filterType)
    }
  }

  const handleCustomRangeApply = () => {
    if (!tempStartDate || !tempEndDate) {
      setError('Please select both start and end dates')
      return
    }

    const startDate = new Date(tempStartDate)
    const endDate = new Date(tempEndDate)

    setCustomRange(startDate, endDate)
  }

  const handleCustomRangeCancel = () => {
    toggleCustomRange()
    if (selectedFilter === 'custom' && (!customStartDate || !customEndDate)) {
      setFilter('last7days')
    }
  }

  const currentOption =
    dateFilterOptions.find((option) => option.value === selectedFilter) ||
    dateFilterOptions[2]

  const visibleOptions = hideCustomRange
    ? dateFilterOptions.filter((opt) => opt.value !== 'custom')
    : dateFilterOptions

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Select
        value={selectedFilter}
        onValueChange={handleFilterSelect}
        disabled={isLoading}
      >
        <SelectTrigger
          className={`
            ${compact ? 'h-8 px-2 text-xs w-[120px]' : 'h-10 px-4 w-[180px]'}
            bg-white dark:bg-transparent border-[#ead9cd] dark:border-primary/10
            rounded-xl font-medium tracking-wider text-slate-600 dark:text-slate-300
            hover:bg-orange-50/50 dark:hover:bg-[#3a291d]/50 transition-all
          `}
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
            ) : (
              <CalendarIcon
                className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-orange-500`}
              />
            )}
            <SelectValue placeholder="Date Filter">
              {currentOption.label}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#ead9cd] dark:border-primary/10">
          {visibleOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-[14px] font-[450] rounded-lg focus:bg-orange-50 dark:focus:bg-[#3a291d] focus:text-orange-600 cursor-pointer"
            >
              <div className="flex flex-col">
                <span>{option.label}</span>
                {!compact && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Range Dialog */}
      {!hideCustomRange && (
        <Dialog open={isCustomRangeOpen} onOpenChange={toggleCustomRange}>
          <DialogContent className="rounded-2xl border-[#ead9cd] dark:border-primary/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Settings2 className="h-5 w-5 text-orange-500" />
                Custom Date Range
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="start-date"
                  className="text-right text-slate-600 dark:text-slate-400"
                >
                  From
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => {
                    setTempStartDate(e.target.value)
                    setError(null)
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="col-span-3 rounded-xl border-[#ead9cd] dark:border-primary/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="end-date"
                  className="text-right text-slate-600 dark:text-slate-400"
                >
                  To
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => {
                    setTempEndDate(e.target.value)
                    setError(null)
                  }}
                  min={tempStartDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="col-span-3 rounded-xl border-[#ead9cd] dark:border-primary/10"
                />
              </div>
              {error && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/20">
                  {error}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 flex-row">
              <Button
                variant="outline"
                onClick={handleCustomRangeCancel}
                className="rounded-xl border-[#ead9cd] dark:border-primary/10 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomRangeApply}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
              >
                Apply Range
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default DateFilterComponent
