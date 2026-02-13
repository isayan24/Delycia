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
import { formatCurrency } from '@/utils/currencyUtils'

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
      <div className="bg-white rounded-2xl p-3 md:p-5 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl bg-${color}-50`}>
              <div className="w-5 h-5 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <div className="w-24 h-8 bg-gray-100 rounded-lg mb-2"></div>
          <div className="w-16 h-4 bg-gray-50 rounded-md"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-3 md:p-5 shadow-sm border border-red-100 bg-linear-to-br from-white to-red-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
              title="Retry loading"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        <h3 className="text-lg font-bold text-red-600 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
          Error
        </h3>
        <p className="text-red-400 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
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

  const colorVariants: Record<string, string> = {
    orange:
      'from-orange-50/50 via-white to-white border-orange-100/50 text-orange-600 bg-orange-50',
    blue: 'from-blue-50/50 via-white to-white border-blue-100/50 text-blue-600 bg-blue-50',
    green:
      'from-emerald-50/50 via-white to-white border-emerald-100/50 text-emerald-600 bg-emerald-50',
    purple:
      'from-purple-50/50 via-white to-white border-purple-100/50 text-purple-600 bg-purple-50',
  }

  const variant = colorVariants[color] || colorVariants.orange

  return (
    <div
      className={`bg-white rounded-2xl p-3 md:p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 bg-linear-to-br ${variant.split(' ').slice(0, 3).join(' ')}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-2 rounded-xl ${variant.split(' ').slice(4).join(' ')}`}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">
          {formatValue(value)}
        </h3>
        <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-widest">
          {title}
        </p>
      </div>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
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
