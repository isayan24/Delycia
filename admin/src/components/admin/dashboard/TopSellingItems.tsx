import React from 'react'
import { Star, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { TopSellingItem } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currencyUtils'

interface TopSellingItemsProps {
  data: TopSellingItem[] | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <div className="w-32 h-4 bg-gray-300 rounded mb-1"></div>
                <div className="w-20 h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-4 bg-gray-300 rounded mb-1"></div>
              <div className="w-24 h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-red-600 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Top Selling Items - Error
      </h3>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
    <div className="h-[300px] flex items-center justify-center bg-red-50 rounded-lg">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">
          Failed to load top selling items
        </p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    </div>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Top Selling Items
    </h3>
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No sales data available</p>
        <p className="text-gray-500 text-sm mt-1">
          Try selecting a different date range
        </p>
      </div>
    </div>
  </div>
)

interface ItemRowProps {
  item: TopSellingItem
  rank: number
  maxRevenue: number
  loading?: boolean
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  rank,
  maxRevenue,
  loading = false,
}) => {
  const progressPercentage =
    maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Star className="w-3 h-3" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="animate-pulse flex items-center justify-between py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div>
            <div className="w-32 h-4 bg-gray-300 rounded mb-1"></div>
            <div className="w-20 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="w-16 h-4 bg-gray-300 rounded mb-1"></div>
          <div className="w-24 h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <div className="flex items-center space-x-3">
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border
          ${getRankColor(rank)}
        `}
        >
          {getRankIcon(rank) || rank}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="font-medium max-[500px]:text-xs text-gray-900 truncate"
            title={item.name}
          >
            {item.name}
          </p>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>{item.orderCount.toLocaleString()} orders</span>
            <span>•</span>
            <span>{item.totalQuantity.toLocaleString()} sold</span>
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="font-semibold text-gray-900">
          {formatCurrency(item.totalRevenue)}
        </p>
        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-linear-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export const TopSellingItems: React.FC<TopSellingItemsProps> = ({
  data,
  loading,
  error,
  onRetry,
}) => {
  if (loading && !data) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data || data.length === 0) {
    return <EmptyState />
  }

  // Sort by total revenue and get top items
  const sortedItems = [...data]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10) // Show top 10 items

  const maxRevenue = sortedItems.length > 0 ? sortedItems[0].totalRevenue : 0
  const totalRevenue = sortedItems.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  )
  const totalOrders = sortedItems.reduce(
    (sum, item) => sum + item.orderCount,
    0,
  )

  return (
    <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-4 md:p-6 border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Top Selling Items
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-emerald-400">
                Total
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-blue-400">
                Orders
              </span>
              <span className="text-xs font-bold text-blue-600">
                {totalOrders.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full animate-pulse">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {sortedItems.map((item, index) => (
          <ItemRow
            key={item.itemId}
            item={item}
            rank={index + 1}
            maxRevenue={maxRevenue}
            loading={loading && !data}
          />
        ))}
      </div>

      {sortedItems.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No items found for the selected period</p>
        </div>
      )}
    </div>
  )
}

export default TopSellingItems
