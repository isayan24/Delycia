import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Package, AlertCircle, RefreshCw } from 'lucide-react'
import { OrderStatusData } from '@/types/dashboard.types'

interface OrderStatusChartProps {
  data: OrderStatusData[] | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

// Status color mapping
const statusColors: Record<string, string> = {
  completed: '#fb923c',
  'in progress': '#fed7aa',
  pending: '#ffedd5',
  cancelled: '#9ca3af',
  ready: '#10b981',
  processing: '#3b82f6',
  delivered: '#059669',
  failed: '#ef4444',
}

const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/[^a-z]/g, '')
  return (
    statusColors[normalizedStatus] ||
    statusColors[status.toLowerCase()] ||
    '#6b7280'
  )
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="h-[300px] bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="w-8 h-4 bg-gray-300 rounded"></div>
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
        Order Status - Error
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
        <p className="text-red-600 font-medium">Failed to load order status</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    </div>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No order data available</p>
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
        <p className="text-gray-800 font-medium capitalize">{data.status}</p>
        <p className="text-gray-600 text-sm">
          Orders:{' '}
          <span className="font-semibold">{data.count.toLocaleString()}</span>
        </p>
        <p className="text-gray-600 text-sm">
          Percentage:{' '}
          <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    )
  }
  return null
}

const StatusLegend: React.FC<{ data: OrderStatusData[] }> = ({ data }) => {
  const totalOrders = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-gray-700 border-b pb-2">
        <span>Status</span>
        <span>Orders</span>
      </div>
      {data.map((status, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(status.status) }}
            ></div>
            <span className="text-gray-600 capitalize">{status.status}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{status.count.toLocaleString()}</span>
            <span className="text-gray-500 text-xs">
              ({status.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between text-sm font-semibold text-gray-800 border-t pt-2">
        <span>Total</span>
        <span>{totalOrders.toLocaleString()}</span>
      </div>
    </div>
  )
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
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

  // Merge 'settled' into 'completed' for unified status display
  const mergedData = React.useMemo(() => {
    if (!data) return []

    const statusMap = new Map<string, number>()

    // Aggregate counts, merging 'settled' into 'completed'
    data.forEach((item) => {
      const status =
        item.status.toLowerCase() === 'settled'
          ? 'completed'
          : item.status.toLowerCase()
      statusMap.set(status, (statusMap.get(status) || 0) + item.count)
    })

    // Calculate total and create new array with percentages
    const total = Array.from(statusMap.values()).reduce(
      (sum, count) => sum + count,
      0,
    )

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
  }, [data])

  // Prepare data for the pie chart
  const chartData = mergedData.map((item) => ({
    ...item,
    fill: getStatusColor(item.status),
  }))

  const totalOrders = mergedData.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Order Status
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Total Orders:{' '}
            <span className="font-bold text-blue-600">
              {totalOrders.toLocaleString()}
            </span>
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full animate-pulse">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
            <span>Syncing...</span>
          </div>
        )}
      </div>

      <div className="h-[250px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="count"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="hover:opacity-85 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <StatusLegend data={mergedData} />
    </div>
  )
}

export default OrderStatusChart
