import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns'

export type DateFilterType =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'lastMonth'
  | 'thisMonth'
  | 'allTime'
  | 'custom'

export interface DateRange {
  startDate: string
  endDate: string
}
// fix calculate the yesterday date with previous day and today
export class DateRangeCalculator {
  static today(): DateRange {
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static yesterday(): DateRange {
    const yesterday = subDays(new Date(), 1)
    const start = startOfDay(yesterday)
    const end = endOfDay(yesterday)

    console.log(
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd'),
      'start, end',
    )

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static last7Days(): DateRange {
    const today = new Date()
    const start = startOfDay(subDays(today, 6)) // Include today, so 6 days back
    const end = endOfDay(today)

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static lastMonth(): DateRange {
    const lastMonth = subMonths(new Date(), 1)
    const start = startOfMonth(lastMonth)
    const end = endOfMonth(lastMonth)

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static thisMonth(): DateRange {
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfDay(today) // Up to today in current month

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static allTime(): DateRange {
    // For all time, we'll use a very early date as start
    // You can adjust this based on when your business started
    const start = new Date('2020-01-01') // Adjust this date as needed
    const end = endOfDay(new Date())

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static custom(startDate: Date, endDate: Date): DateRange {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  static getDateRange(
    filterType: DateFilterType,
    customStart?: Date,
    customEnd?: Date,
  ): DateRange {
    switch (filterType) {
      case 'today':
        return this.today()
      case 'yesterday':
        return this.yesterday()
      case 'last7days':
        return this.last7Days()
      case 'lastMonth':
        return this.lastMonth()
      case 'thisMonth':
        return this.thisMonth()
      case 'allTime':
        return this.allTime()
      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom date range requires both start and end dates')
        }
        return this.custom(customStart, customEnd)
      default:
        return this.last7Days() // Default fallback
    }
  }

  static formatDisplayRange(
    filterType: DateFilterType,
    customStart?: Date,
    customEnd?: Date,
  ): string {
    switch (filterType) {
      case 'today':
        return `Today (${format(new Date(), 'MMM dd, yyyy')})`
      case 'yesterday':
        return `Yesterday (${format(subDays(new Date(), 1), 'MMM dd, yyyy')})`
      case 'last7days':
        return `Last 7 Days (${format(subDays(new Date(), 6), 'MMM dd')} - ${format(new Date(), 'MMM dd, yyyy')})`
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1)
        return `Last Month (${format(startOfMonth(lastMonth), 'MMM dd')} - ${format(endOfMonth(lastMonth), 'MMM dd, yyyy')})`
      case 'thisMonth':
        const today = new Date()
        return `This Month (${format(startOfMonth(today), 'MMM dd')} - ${format(today, 'MMM dd, yyyy')})`
      case 'allTime':
        return 'All Time Earnings'
      case 'custom':
        if (!customStart || !customEnd) return 'Custom Range'
        return `${format(customStart, 'MMM dd')} - ${format(customEnd, 'MMM dd, yyyy')}`
      default:
        return 'Last 7 Days'
    }
  }

  static validateDateRange(
    startDate: Date,
    endDate: Date,
  ): { isValid: boolean; error?: string } {
    if (startDate > endDate) {
      return { isValid: false, error: 'End date must be after start date' }
    }

    const today = new Date()
    if (startDate > today || endDate > today) {
      return { isValid: false, error: 'Dates cannot be in the future' }
    }

    // Check if range is too large (more than 1 year)
    const oneYearAgo = subDays(today, 365)
    if (startDate < oneYearAgo) {
      return { isValid: false, error: 'Date range cannot exceed 1 year' }
    }

    return { isValid: true }
  }
}

// Session storage keys
export const DATE_FILTER_STORAGE_KEY = 'dashboard_date_filter'
export const CUSTOM_DATE_STORAGE_KEY = 'dashboard_custom_dates'

export interface StoredDateFilter {
  selectedFilter: DateFilterType
  customStartDate?: string
  customEndDate?: string
}

export class DateFilterStorage {
  static save(filter: StoredDateFilter): void {
    try {
      sessionStorage.setItem(DATE_FILTER_STORAGE_KEY, JSON.stringify(filter))
    } catch (error) {
      console.warn('Failed to save date filter to session storage:', error)
    }
  }

  static load(): StoredDateFilter | null {
    try {
      const stored = sessionStorage.getItem(DATE_FILTER_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load date filter from session storage:', error)
    }
    return null
  }

  static clear(): void {
    try {
      sessionStorage.removeItem(DATE_FILTER_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear date filter from session storage:', error)
    }
  }
}
