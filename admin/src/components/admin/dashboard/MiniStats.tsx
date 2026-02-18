import React from 'react'
import { TrendingUp, ShoppingBag, Users, Clock } from 'lucide-react'
import { DashboardStats } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currencyUtils'

interface MiniStatsProps {
  stats: DashboardStats | null
  loading: boolean
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: any
  label: string
  value: string | number
  color: string
  loading: boolean
}) => (
  <div className="flex items-center gap-3 px-3 md:px-6 border-b border-r md:last:border-b-0 even:border-r-0 md:even:border-r md:last:border-r-0 border-gray-100 dark:border-primary/5 min-w-0 py-2 md:py-0">
    <div
      className={`shrink-0 p-2 md:p-2.5 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-sm md:text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
        {loading ? (
          <div className="h-5 w-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
        ) : (
          value
        )}
      </span>
      <span className="text-[10px] md:text-xs font-bold text-[#a16b45] uppercase tracking-wider truncate">
        {label}
      </span>
    </div>
  </div>
)

export const MiniStats: React.FC<MiniStatsProps> = ({ stats, loading }) => {
  const formatCompactValue = (val: number, isCurrency = false) => {
    if (val >= 1000) {
      const formatted = (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
      return isCurrency ? `₹${formatted}` : formatted
    }
    return isCurrency ? formatCurrency(val) : val.toLocaleString()
  }

  return (
    <div className="grid grid-cols-2 md:flex md:items-center w-full py-1.5 md:py-2">
      <StatItem
        icon={TrendingUp}
        label="Total Sales"
        value={formatCompactValue(stats?.totalSales || 0, true)}
        color="text-orange-600 bg-orange-100"
        loading={loading}
      />
      <StatItem
        icon={ShoppingBag}
        label="Orders"
        value={stats?.totalOrders || 0}
        color="text-blue-600 bg-blue-100"
        loading={loading}
      />
      <StatItem
        icon={Users}
        label="New Customers"
        value={stats?.newCustomers || 0}
        color="text-emerald-600 bg-emerald-100"
        loading={loading}
      />
      <StatItem
        icon={Clock}
        label="Avg Value"
        value={formatCurrency(stats?.avgOrderValue || 0)}
        color="text-purple-600 bg-purple-100"
        loading={loading}
      />
    </div>
  )
}

export default MiniStats
