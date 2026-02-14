import { useState, memo } from 'react'
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  Layers,
  Merge,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

interface LargeOrderFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
  isSelectionMode: boolean
  onToggleSelectionMode: () => void
  selectedCount: number
  onMerge: () => void
  isMergePending: boolean
}

export const LargeOrderFilters = memo(
  ({
    search,
    onSearchChange,
    onDateRangeChange,
    onClearFilters,
    isSelectionMode,
    onToggleSelectionMode,
    selectedCount,
    onMerge,
    isMergePending,
  }: LargeOrderFiltersProps) => {
    const [showFilters, setShowFilters] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [isStartDateOpen, setIsStartDateOpen] = useState(false)
    const [isEndDateOpen, setIsEndDateOpen] = useState(false)

    // Apply date range
    const handleApplyDateRange = () => {
      const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined
      const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      onDateRangeChange(start, end)
    }

    // Clear all filters
    const handleClearAll = () => {
      setStartDate(undefined)
      setEndDate(undefined)
      onSearchChange('')
      onClearFilters()
    }
    return (
      <div className="sticky top-14  z-30 -mx-4 px-4 lg:-mx-10 lg:px-10 py-5  dark:bg-[#1d130c]/95 backdrop-blur-md border-b border-[#ead9cd] dark:border-primary/10 shadow-sm transition-all mb-4">
        <div className="space-y-4 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border shadow-sm ${
                  showFilters
                    ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-primary/20 dark:text-primary dark:border-primary/20'
                    : 'bg-white text-slate-600 border-[#ead9cd] dark:bg-[#2d1e14] dark:text-slate-200 dark:border-primary/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>

              <Button
                variant={isSelectionMode ? 'secondary' : 'outline'}
                onClick={onToggleSelectionMode}
                className={`h-11 px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border shadow-sm ${
                  isSelectionMode
                    ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30'
                    : 'bg-white text-slate-600 border-[#ead9cd] dark:bg-[#2d1e14] dark:text-slate-200 dark:border-primary/10'
                }`}
              >
                <Layers className="w-4 h-4" />
                {isSelectionMode ? 'Exit Merge Mode' : 'Merge Orders'}
              </Button>

              {isSelectionMode && selectedCount > 0 && (
                <Button
                  onClick={onMerge}
                  disabled={selectedCount < 2 || isMergePending}
                  className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 animate-in zoom-in-95 duration-200"
                >
                  <Merge className="w-4 h-4" />
                  {isMergePending
                    ? 'Merging...'
                    : `Merge ${selectedCount} Orders`}
                </Button>
              )}

              {(startDate || endDate || search) && !isSelectionMode && (
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  className="h-11 px-4 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Clear All
                </Button>
              )}
            </div>

            {/* Global Search */}
            <div className="relative w-full md:w-80">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a16b45]">
                <Search className="w-4 h-4" />
              </div>
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-11 pl-12 pr-10 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 rounded-xl focus-visible:ring-primary/50 text-sm shadow-sm"
                placeholder="Filter by Customer Name or items..."
              />
              {search && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-orange-50/30 dark:bg-primary/5 rounded-2xl border border-orange-100/50 dark:border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-[#a16b45] mr-2">
                <CalendarIcon className="w-4 h-4" /> Range:
              </div>

              {/* Start Date */}
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 text-xs font-bold justify-start px-4 rounded-xl border-[#ead9cd] bg-white dark:bg-[#2d1e14] dark:border-primary/10 min-w-[140px]"
                  >
                    {startDate ? (
                      <span className="text-slate-900 dark:text-white">
                        {format(startDate, 'dd MMM yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-400">From Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl border-[#ead9cd] shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date)
                      setIsStartDateOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>

              <span className="text-slate-400 font-bold">to</span>

              {/* End Date */}
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 text-xs font-bold justify-start px-4 rounded-xl border-[#ead9cd] bg-white dark:bg-[#2d1e14] dark:border-primary/10 min-w-[140px]"
                  >
                    {endDate ? (
                      <span className="text-slate-900 dark:text-white">
                        {format(endDate, 'dd MMM yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-400">To Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl border-[#ead9cd] shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date)
                      setIsEndDateOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleApplyDateRange}
                className="h-10 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all ml-auto"
              >
                Apply Range
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  },
)
