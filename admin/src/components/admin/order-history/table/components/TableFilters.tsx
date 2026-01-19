import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, Calendar as CalendarIcon, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

interface TableFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
  totalOrders?: number
}

export function TableFilters({
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
  totalOrders,
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
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by customer, phone, or item..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
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

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide' : 'Filters'}
        </Button>
      </div>

      {/* Collapsible Date Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {startDate ? format(startDate, 'PPP') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {endDate ? format(endDate, 'PPP') : 'End Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyDateRange} className="flex-1">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1"
            >
              Clear All
            </Button>
          </div>

          {totalOrders !== undefined && (
            <div className="text-sm text-gray-600 text-center">
              Showing {totalOrders} order{totalOrders !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
