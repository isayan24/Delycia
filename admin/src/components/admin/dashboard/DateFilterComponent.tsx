import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, X, Check } from 'lucide-react'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { DateFilterType } from '@/utils/dashboardDateUtils'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)
  const customRangeRef = useRef<HTMLDivElement>(null)

  const {
    selectedFilter,
    customStartDate,
    customEndDate,
    isCustomRangeOpen,
    isLoading,
    error,
    displayText,
    setFilter,
    setCustomRange,
    toggleCustomRange,
    setError,
  } = useDateFilterStore()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
      if (
        customRangeRef.current &&
        !customRangeRef.current.contains(event.target as Node)
      ) {
        if (isCustomRangeOpen && selectedFilter === 'custom') {
          // Don't close if we're in the middle of selecting custom dates
          return
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCustomRangeOpen, selectedFilter])

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

  const handleFilterSelect = (filterType: DateFilterType) => {
    if (filterType === 'custom') {
      toggleCustomRange()
    } else {
      setFilter(filterType)
      setIsDropdownOpen(false)
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
    setIsDropdownOpen(false)
  }

  const handleCustomRangeCancel = () => {
    toggleCustomRange()
    if (selectedFilter === 'custom' && (!customStartDate || !customEndDate)) {
      // If custom was selected but no dates were set, revert to last 7 days
      setFilter('last7days')
    }
    setIsDropdownOpen(false)
  }

  const getCurrentOption = () => {
    return (
      dateFilterOptions.find((option) => option.value === selectedFilter) ||
      dateFilterOptions[2]
    )
  }

  const currentOption = getCurrentOption()

  // Filter options based on hideCustomRange
  const visibleOptions = hideCustomRange
    ? dateFilterOptions.filter((opt) => opt.value !== 'custom')
    : dateFilterOptions

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      {/* Main Filter Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 
          ${
            compact
              ? 'px-2 py-1 text-xs border-transparent hover:bg-gray-100 rounded'
              : 'px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
          }
          bg-white transition-colors duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDropdownOpen && !compact ? 'ring-2 ring-orange-500 border-orange-500' : ''}
        `}
        aria-label="Select date filter"
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        <Calendar
          className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`}
        />
        {!compact && (
          <span className="text-sm font-medium text-gray-700 min-w-0 truncate">
            {currentOption.label}
          </span>
        )}
        {compact && (
          <span className="text-xs font-medium text-gray-600 min-w-0 truncate">
            {currentOption.label}
          </span>
        )}
        <ChevronDown
          className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className={`absolute top-full text-left right-0 mt-1 ${compact ? 'w-48' : 'w-64'} bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
        >
          <div className="py-1" role="listbox">
            {visibleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`
                  w-full ${compact ? 'px-3 py-2' : 'px-4 py-3'} text-left hover:bg-gray-50 transition-colors duration-150
                  ${selectedFilter === option.value ? 'bg-orange-50 border-r-2 border-orange-500' : ''}
                `}
                role="option"
                aria-selected={selectedFilter === option.value}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900`}
                    >
                      {option.label}
                    </div>
                    {!compact && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {selectedFilter === option.value && (
                    <Check
                      className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-orange-500`}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {isCustomRangeOpen && !hideCustomRange && (
            <div className="border-t border-gray-200 p-4" ref={customRangeRef}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Custom Date Range
                  </h4>
                  <button
                    onClick={handleCustomRangeCancel}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close custom date picker"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="block text-xs font-medium text-gray-700 mb-1"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="block text-xs font-medium text-gray-700 mb-1"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={handleCustomRangeCancel}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomRangeApply}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 mt-1 w-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600">Loading data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateFilterComponent
