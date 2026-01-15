
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Truck, AlertCircle, RefreshCw, MapPin, Home, Store } from 'lucide-react';
import { DeliveryTypeData } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/currencyUtils';

interface DeliveryTypeChartProps {
  data: DeliveryTypeData[] | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

// Delivery type color mapping
const deliveryColors: Record<string, string> = {
  'dine-in': '#fb923c',
  'takeaway': '#10b981',
  'delivery': '#3b82f6',
  'pickup': '#8b5cf6',
  'drive-through': '#f59e0b',
  'curbside': '#ef4444'
};

const getDeliveryColor = (type: string): string => {
  const normalizedType = type.toLowerCase().replace(/[^a-z-]/g, '');
  return deliveryColors[normalizedType] || deliveryColors[type.toLowerCase()] || '#6b7280';
};

const getDeliveryIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes('delivery')) {
    return <Truck className="w-4 h-4" />;
  }
  if (normalizedType.includes('dine') || normalizedType.includes('in')) {
    return <Store className="w-4 h-4" />;
  }
  if (normalizedType.includes('pickup') || normalizedType.includes('takeaway')) {
    return <MapPin className="w-4 h-4" />;
  }
  if (normalizedType.includes('drive') || normalizedType.includes('curbside')) {
    return <Home className="w-4 h-4" />;
  }
  return <Truck className="w-4 h-4" />;
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
      <div className="h-[250px] bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-red-600 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Delivery Types - Error
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
    <div className="h-[250px] flex items-center justify-center bg-red-50 rounded-lg">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Failed to load delivery types</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Types</h3>
    <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No delivery data available</p>
        <p className="text-gray-500 text-sm mt-1">Try selecting a different date range</p>
      </div>
    </div>
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.count / payload[0].payload.totalOrders) * 100).toFixed(1);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          {getDeliveryIcon(data.type)}
          <p className="text-gray-800 font-medium capitalize">{data.type}</p>
        </div>
        <p className="text-gray-600 text-sm">
          Orders: <span className="font-semibold">{data.count.toLocaleString()}</span>
        </p>
        <p className="text-gray-600 text-sm">
          Revenue: <span className="font-semibold">{formatCurrency(data.totalAmount)}</span>
        </p>
        <p className="text-gray-600 text-sm">
          Share: <span className="font-semibold">{percentage}%</span>
        </p>
        <p className="text-gray-600 text-sm">
          Avg per Order: <span className="font-semibold">{formatCurrency(data.totalAmount / data.count)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DeliveryTypeLegend: React.FC<{ data: DeliveryTypeData[] }> = ({ data }) => {
  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-gray-700 border-b pb-2">
        <span>Delivery Type</span>
        <div className="flex space-x-6">
          <span>Orders</span>
          <span>Revenue</span>
        </div>
      </div>

      {data.map((delivery, index) => {
        const percentage = totalOrders > 0 ? (delivery.count / totalOrders) * 100 : 0;

        return (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDeliveryColor(delivery.type) }}
              ></div>
              <div className="flex items-center space-x-1">
                {getDeliveryIcon(delivery.type)}
                <span className="text-gray-700 capitalize truncate" title={delivery.type}>
                  {delivery.type}
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex space-x-6 text-right">
              <span className="font-medium w-16">{delivery.count.toLocaleString()}</span>
              <span className="font-medium w-20">{formatCurrency(delivery.totalAmount)}</span>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between text-sm font-semibold text-gray-800 border-t pt-2">
        <span>Total</span>
        <div className="flex space-x-6 text-right">
          <span className="w-16">{totalOrders.toLocaleString()}</span>
          <span className="w-20">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export const DeliveryTypeChart: React.FC<DeliveryTypeChartProps> = ({
  data,
  loading,
  error,
  onRetry
}) => {
  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // Prepare data for the pie chart
  const chartData = data.map(item => ({
    ...item,
    fill: getDeliveryColor(item.type),
    totalOrders: data.reduce((sum, d) => sum + d.count, 0)
  }));

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-orange-500" />
            Delivery Types
          </h3>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-600">
              Orders: <span className="font-semibold text-blue-600">{totalOrders.toLocaleString()}</span>
            </span>
            <span className="text-sm text-gray-600">
              Revenue: <span className="font-semibold text-green-600">{formatCurrency(totalAmount)}</span>
            </span>
          </div>
        </div>
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
            <span>Updating...</span>
          </div>
        )}
      </div>

      <div className="h-[250px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <DeliveryTypeLegend data={data} />
    </div>
  );
};

export default DeliveryTypeChart;