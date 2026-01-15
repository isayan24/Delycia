// Main dashboard components
export { default as DashboardWrapper } from './DashboardWrapper';
export { default as EnhancedAdminDashboard } from './EnhancedAdminDashboard';
// export { default as AdminDashboard } from './AdminDashboard'; // Legacy component

// Date filtering components
export { default as DateFilterComponent } from './DateFilterComponent';
export { default as DateRangeDisplay } from './DateRangeDisplay';

// Chart and data components
export { default as DashboardStatsComponent } from './DashboardStats';
export { default as SalesTrendChart } from './SalesTrendChart';
export { default as OrderStatusChart } from './OrderStatusChart';
export { default as TopSellingItems } from './TopSellingItems';
export { default as RevenueByCategoryChart } from './RevenueByCategoryChart';
export { default as PaymentMethodChart } from './PaymentMethodChart';
export { default as DeliveryTypeChart } from './DeliveryTypeChart';

// Utility components
export { default as DashboardErrorBoundary } from './DashboardErrorBoundary';

// Legacy chart components (for backward compatibility)
// export { BarCharts } from './BarCharts';
// export { RoundAreaChart } from './RoundAreaChart';

// Types
export type { DashboardData, DashboardStats, UseDashboardDataReturn } from '@/types/dashboard.types';
export type { DateFilterType, DateRange } from '@/utils/dashboardDateUtils';

// Hooks
export { useDashboardData } from '@/hooks/useDashboardData';

// Store
export { useDateFilterStore } from '@/store/useDateFilterStore';

// Utils
export { DateRangeCalculator, DateFilterStorage } from '@/utils/dashboardDateUtils';
export { DashboardErrorHandler, RetryHandler } from '@/utils/errorHandler';
export { performanceMonitor, usePerformanceMonitor } from '@/utils/performanceMonitor';