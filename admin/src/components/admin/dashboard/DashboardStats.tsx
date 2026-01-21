import React from 'react'
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { DashboardStats as StatsType } from '@/types/dashboard.types'
import { formatCurrency, formatGrowth } from '@/utils/currencyUtils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color?: string
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'orange',
  loading = false,
  error = false,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-1.5 rounded-lg bg-${color}-100`}>
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="w-12 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="w-20 h-7 bg-gray-300 rounded mb-1"></div>
          <div className="w-24 h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
        <div className="flex items-center justify-between mb-3">
          <div className="p-1.5 rounded-lg bg-red-100">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Retry loading"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        <h3 className="text-base font-bold text-red-600 mb-1">Error</h3>
        <p className="text-red-500 text-xs">{title}</p>
      </div>
    )
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (
        title.toLowerCase().includes('sales') ||
        title.toLowerCase().includes('value')
      ) {
        return formatCurrency(val)
      }
      return val.toLocaleString()
    }
    return val.toString()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-1.5 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {formatValue(value)}
      </h3>
      <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
        {title}
      </p>
    </div>
  )
}

interface DashboardStatsProps {
  stats: StatsType | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

export const DashboardStatsComponent: React.FC<DashboardStatsProps> = ({
  stats,
  loading,
  error,
  onRetry,
}) => {
  const hasError = !!error
  const isLoading = loading && !stats

  // Default stats for error state
  const defaultStats: StatsType = {
    totalSales: 0,
    totalOrders: 0,
    newCustomers: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    avgOrderGrowth: 0,
    totalCustomers: 0,
    customersToday: 0,
    customersMonth: 0,
    customersYear: 0,
  }

  const displayStats = stats || defaultStats

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Total Sales"
        value={displayStats.totalSales}
        icon={TrendingUp}
        color="orange"
        loading={isLoading}
        error={hasError}
        onRetry={onRetry}
      />
      <MetricCard
        title="Total Orders"
        value={displayStats.totalOrders}
        icon={ShoppingBag}
        color="blue"
        loading={isLoading}
        error={hasError}
        onRetry={onRetry}
      />
      <MetricCard
        title="New Customers"
        value={displayStats.newCustomers}
        icon={Users}
        color="green"
        loading={isLoading}
        error={hasError}
        onRetry={onRetry}
      />
      <MetricCard
        title="Avg Order Value"
        value={displayStats.avgOrderValue}
        icon={Clock}
        color="purple"
        loading={isLoading}
        error={hasError}
        onRetry={onRetry}
      />
    </div>
  )
}

export default DashboardStatsComponent
