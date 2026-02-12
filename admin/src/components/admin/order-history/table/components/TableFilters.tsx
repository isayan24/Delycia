import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Search,
  Calendar as CalendarIcon,
  X,
  Filter,
  Merge,
} from 'lucide-react'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'

interface TableFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
  // Merge Props
  isSelectionMode: boolean
  toggleSelectionMode: () => void
  selectedCount: number
  onMerge: () => void
  isMergePending: boolean
}

export function TableFilters({
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
  isSelectionMode,
  toggleSelectionMode,
  selectedCount,
  onMerge,
  isMergePending,
}: TableFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the filter container
      // We also check if the click target is NOT an descendant of a popover (like the calendar)
      const target = event.target as HTMLElement
      const isInsidePopover = target.closest(
        '[data-radix-popper-content-wrapper]',
      )

      if (
        filterRef.current &&
        !filterRef.current.contains(target) &&
        !isInsidePopover &&
        showFilters
      ) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

  const handleApplyDateRange = () => {
    const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined
    const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
    onDateRangeChange(start, end)
  }

  const handleClearAll = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onSearchChange('')
    onClearFilters()
  }

  return (
    <div className="flex items-center gap-2 w-full relative" ref={filterRef}>
      {/* Search Bar - Takes available space */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        <Input
          placeholder="Search items, customers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 text-sm w-full bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-xl"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle Filters Button */}
      <Button
        variant={showFilters ? 'secondary' : 'outline'}
        onClick={() => setShowFilters(!showFilters)}
        className={`gap-2 h-10 text-sm px-3 sm:px-4 shrink-0 transition-all rounded-xl border-gray-200 ${
          showFilters
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden xs:inline">
          {showFilters ? 'Hide' : 'Filter'}
        </span>
      </Button>

      {/* Expanded Filters - Absolute Dropdown on Mobile */}
      {showFilters && (
        <div className="absolute top-12 left-0 right-0 z-50 mt-1 p-3 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:static sm:w-auto sm:border-0 sm:shadow-none sm:p-0 sm:mt-0 sm:bg-transparent animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-semibold text-gray-400 sm:hidden px-1">
            Filter Orders
          </div>
          {/* Start Date */}
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start h-8 text-xs px-2.5 font-normal"
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {startDate ? format(startDate, 'MMM d') : 'Start'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date)
                  setIsStartDateOpen(false)
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>

          {/* End Date */}
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start h-8 text-xs px-2.5 font-normal"
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {endDate ? format(endDate, 'MMM d') : 'End'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date)
                  setIsEndDateOpen(false)
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleApplyDateRange}
            size="sm"
            className="h-8 text-xs px-3"
          >
            Apply
          </Button>

          {(startDate || endDate || search) && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Merge Actions - Integrated */}
      <div className="flex items-center border-l border-gray-100 pl-3 ml-1">
        {!isSelectionMode ? (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-2 h-10 text-sm px-3 sm:px-4 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Merge className="w-4 h-4" />
            <span className="hidden xs:inline">Merge</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap hidden lg:inline">
              {selectedCount > 0
                ? `${selectedCount} selected`
                : 'Select orders'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectionMode}
              className="h-10 px-3 text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onMerge}
              disabled={isMergePending || selectedCount < 2}
              className="gap-2 h-10 text-sm px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all"
            >
              <Merge className="w-4 h-4" />
              {isMergePending ? 'Merging...' : 'Merge'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
