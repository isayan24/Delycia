import { useState, memo } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Search, Filter, X, Layers, Merge } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OrderHistoryDateFilter } from '../../shared/OrderHistoryDateFilter'

interface LargeOrderFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onDateRangeChange: (
    start_date?: string,
    end_date?: string,
    filter_type?: string,
  ) => void
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

    // Read current filters from URL to show active state
    const urlSearch = useSearch({ strict: false }) as any
    const hasActiveFilters = !!(urlSearch?.filter_type || search)

    // Clear all filters
    const handleClearAll = () => {
      onClearFilters()
    }

    return (
      <div className="sticky top-14 z-30 bg-slate-50/95 dark:bg-[#1d130c]/95 backdrop-blur-md border-b border-[#ead9cd] dark:border-primary/10 px-4 lg:px-10 py-5 mb-8">
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

              {hasActiveFilters && !isSelectionMode && (
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  className="h-11 px-4 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Clear Filters
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
                Date Filter:
              </div>

              <OrderHistoryDateFilter
                onFilterChange={onDateRangeChange}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>
    )
  },
)
