import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PieChart, AlertCircle, RefreshCw, IndianRupee } from 'lucide-react'
import { CategoryRevenueData } from '@/types/dashboard.types'
import { formatCurrency } from '@/utils/currencyUtils'
import NoSSR from '@/components/common/NoSSR'

interface RevenueByCategoryChartProps {
  data: CategoryRevenueData[] | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
      <div className="h-[300px] bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="w-24 h-4 bg-gray-300 rounded"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
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
        Revenue by Category - Error
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
          Failed to load category revenue
        </p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    </div>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Revenue by Category
    </h3>
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No category data available</p>
        <p className="text-gray-500 text-sm mt-1">
          Try selecting a different date range
        </p>
      </div>
    </div>
  </div>
)

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-gray-800 font-medium">{data.categoryName}</p>
        <p className="text-gray-600 text-sm">
          Revenue:{' '}
          <span className="font-semibold text-green-600">
            {formatCurrency(data.totalRevenue)}
          </span>
        </p>
        <p className="text-gray-600 text-sm">
          Orders:{' '}
          <span className="font-semibold text-blue-600">
            {data.orderCount.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 text-sm">
          Avg per Order:{' '}
          <span className="font-semibold">
            {formatCurrency(data.totalRevenue / data.orderCount)}
          </span>
        </p>
      </div>
    )
  }
  return null
}

const CategorySummary: React.FC<{ data: CategoryRevenueData[] }> = ({
  data,
}) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0)

  // Sort by revenue for summary
  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue)

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-gray-700 border-b pb-2">
        <span>Category</span>
        <div className="flex space-x-8">
          <span>Revenue</span>
          <span>Orders</span>
        </div>
      </div>

      {sortedData.slice(0, 5).map((category) => {
        const revenuePercentage =
          totalRevenue > 0 ? (category.totalRevenue / totalRevenue) * 100 : 0

        return (
          <div
            key={category.categoryId}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-3 h-3 rounded-full bg-linear-to-r from-orange-400 to-orange-600"></div>
              <span
                className="text-gray-700 truncate"
                title={category.categoryName}
              >
                {category.categoryName}
              </span>
              <span className="text-gray-500 text-xs">
                ({revenuePercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex space-x-8 text-right">
              <span className="font-medium text-green-600 w-20">
                {formatCurrency(category.totalRevenue)}
              </span>
              <span className="font-medium text-blue-600 w-16">
                {category.orderCount.toLocaleString()}
              </span>
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between text-sm font-semibold text-gray-800 border-t pt-2">
        <span>Total</span>
        <div className="flex space-x-8 text-right">
          <span className="text-green-700 w-20">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-blue-700 w-16">
            {totalOrders.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

const formatYAxisTick = (value: number) => {
  return formatCurrency(value)
}

export const RevenueByCategoryChart: React.FC<RevenueByCategoryChartProps> = ({
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

  // Sort data by revenue for better visualization
  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue)
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0)

  return (
    <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-4 md:p-6 border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-500" />
            Revenue by Category
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                Total
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                Items
              </span>
              <span className="text-sm font-bold text-blue-600">
                {data.length}
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

      <div className="h-[250px] md:h-[300px] mb-8 min-w-0">
        <NoSSR>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="categoryName"
                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar
                dataKey="totalRevenue"
                fill="url(#colorGradientBar)"
                radius={[6, 6, 0, 0]}
                barSize={32}
                name="Revenue"
              />
              <defs>
                <linearGradient
                  id="colorGradientBar"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={1} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </NoSSR>
      </div>

      <CategorySummary data={data} />
    </div>
  )
}

export default RevenueByCategoryChart
