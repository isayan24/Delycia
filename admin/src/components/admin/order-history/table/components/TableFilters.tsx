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
import { useState } from 'react'

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
    <div className="flex items-center gap-2 w-full">
      {/* Search Bar - Takes available space */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          placeholder="Search orders by item name, customer name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-xs w-full"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Toggle Filters Button */}
      <Button
        variant={showFilters ? 'secondary' : 'outline'}
        onClick={() => setShowFilters(!showFilters)}
        className="gap-1.5 h-8 text-xs px-2.5 shrink-0"
      >
        <Filter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {showFilters ? 'Hide' : 'Filter'}
        </span>
      </Button>

      {/* Expanded Filters - Absolute/Popover or expanded row? 
          User asked for "make these btns compact". 
          Let's make them show in a compact row if expanded, or just integrate them if space allows.
          Given typical table layouts, a popover or a second tight row is best. 
          Let's try a tight second row first, or if "compact" means "small buttons", let's adjust sizes.
          The user pointed to the whole file, including date pickers.
       */}

      {showFilters && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 p-2 bg-white border rounded-lg shadow-lg flex flex-col gap-2 sm:flex-row sm:items-center sm:static sm:w-auto sm:border-0 sm:shadow-none sm:p-0 sm:mt-0 sm:bg-transparent animate-in fade-in zoom-in-95 duration-200">
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
      <div className="flex items-center border-l pl-2 ml-1">
        {!isSelectionMode ? (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-1.5 h-8 text-xs px-2.5"
          >
            <Merge className="w-3.5 h-3.5" />
            Merge
          </Button>
        ) : (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:inline">
              {selectedCount > 0 ? `${selectedCount} selected` : 'Select'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectionMode}
              className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onMerge}
              disabled={isMergePending || selectedCount < 2}
              className="gap-1.5 h-8 text-xs px-2.5"
            >
              <Merge className="w-3.5 h-3.5" />
              {isMergePending ? 'Merging...' : 'Merge'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
