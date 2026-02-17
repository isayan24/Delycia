import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { SalesTrendData } from '@/types/dashboard.types'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '@/utils/currencyUtils'
import NoSSR from '@/components/common/NoSSR'

interface SalesTrendChartProps {
  data: SalesTrendData[] | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

const LoadingSkeleton: React.FC = () => (
  <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="h-[300px] bg-gray-200 rounded"></div>
    </div>
  </div>
)

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-red-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-red-600 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Sales Trend - Error
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
        <p className="text-red-600 font-medium">Failed to load sales trend</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    </div>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No sales data available</p>
        <p className="text-gray-500 text-sm mt-1">
          Try selecting a different date range
        </p>
      </div>
    </div>
  </div>
)

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = parseISO(label)
    const formattedDate = format(date, 'MMM dd, yyyy')

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-gray-600 text-sm font-medium mb-2">
          {formattedDate}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-700">
              {entry.dataKey === 'sales' ? 'Sales: ' : 'Orders: '}
              <span className="font-semibold">
                {entry.dataKey === 'sales'
                  ? formatCurrency(entry.value)
                  : entry.value.toLocaleString()}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const formatXAxisTick = (tickItem: string) => {
  try {
    const date = parseISO(tickItem)
    return format(date, 'MMM dd')
  } catch {
    return tickItem
  }
}

const formatYAxisTick = (value: number) => {
  return formatCurrency(value)
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
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

  // Calculate totals for display
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)

  return (
    <div className="bg-white dark:bg-[#2d1e14] rounded-xl p-4 md:p-6 border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Sales Trend
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-[#3a291d] px-2 py-1 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400">
                Revenue
              </span>
              <span className="text-sm font-bold text-orange-600">
                {formatCurrency(totalSales)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                Orders
              </span>
              <span className="text-sm font-bold text-blue-600">
                {totalOrders.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full animate-pulse">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
            <span>Syncing Data...</span>
          </div>
        )}
      </div>

      <div className="h-[250px] md:h-[300px] w-full min-w-0">
        <NoSSR>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                dy={10}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#fb923c"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#fb923c',
                  strokeWidth: 3,
                  fill: '#fff',
                }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: '#3b82f6',
                  strokeWidth: 2,
                  fill: '#fff',
                }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </NoSSR>
      </div>
    </div>
  )
}

export default SalesTrendChart
