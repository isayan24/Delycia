
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { SalesTrendData } from '@/types/dashboard.types';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/utils/currencyUtils';

interface SalesTrendChartProps {
    data: SalesTrendData[] | null;
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="h-[300px] bg-gray-200 rounded"></div>
        </div>
    </div>
);

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
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
);

const EmptyState: React.FC = () => (
    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
        <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No sales data available</p>
                <p className="text-gray-500 text-sm mt-1">Try selecting a different date range</p>
            </div>
        </div>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const date = parseISO(label);
        const formattedDate = format(date, 'MMM dd, yyyy');

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="text-gray-600 text-sm font-medium mb-2">{formattedDate}</p>
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
                                    : entry.value.toLocaleString()
                                }
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const formatXAxisTick = (tickItem: string) => {
    try {
        const date = parseISO(tickItem);
        return format(date, 'MMM dd');
    } catch {
        return tickItem;
    }
};

const formatYAxisTick = (value: number) => {
    return formatCurrency(value);
};

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
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

    // Calculate totals for display
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

    return (
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
                    <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                            Total Sales: <span className="font-semibold text-orange-600">{formatCurrency(totalSales)}</span>
                        </span>
                        <span className="text-sm text-gray-600">
                            Total Orders: <span className="font-semibold text-blue-600">{totalOrders.toLocaleString()}</span>
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

            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={formatXAxisTick}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={formatYAxisTick}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#fb923c"
                            strokeWidth={3}
                            dot={{ fill: '#fb923c', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#fb923c', strokeWidth: 2, fill: '#fff' }}
                            name="Sales"
                        />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                            name="Orders"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesTrendChart;