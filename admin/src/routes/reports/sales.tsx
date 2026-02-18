import { createFileRoute } from '@tanstack/react-router'
import {
  useDashboardStatsQuery,
  useSalesTrendQuery,
  useOrderStatusQuery,
  useTopItemsQuery,
  useCategoryRevenueQuery,
  useDeliveryTypesQuery,
  useRefreshDashboard,
} from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import DashboardStatsComponent from '@/components/admin/dashboard/DashboardStats'
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart'
import OrderStatusChart from '@/components/admin/dashboard/OrderStatusChart'
import TopSellingItems from '@/components/admin/dashboard/TopSellingItems'
import RevenueByCategoryChart from '@/components/admin/dashboard/RevenueByCategoryChart'
import DeliveryTypeChart from '@/components/admin/dashboard/DeliveryTypeChart'
import CustomerActivityTable from '@/components/admin/dashboard/CustomerInsights'
import LoadingScreen from '@/components/common/LoadingScreen'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useMemo } from 'react'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import MiniStats from '@/components/admin/dashboard/MiniStats'
import { requireAuth } from '@/middleware/auth'

import { z } from 'zod'

const salesSearchSchema = z.object({
  tab: z
    .enum(['overview', 'items', 'customers', 'delivery'])
    .optional()
    .catch('overview'),
})

export const Route = createFileRoute('/reports/sales')({
  beforeLoad: requireAuth,
  validateSearch: (search) => salesSearchSchema.parse(search),
  component: SalesReportPage,
})

function SalesReportPage() {
  const { tab = 'overview' } = Route.useSearch()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()
  const refreshDashboard = useRefreshDashboard()

  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const statsQuery = useDashboardStatsQuery(queryParams)
  const salesTrendQuery = useSalesTrendQuery(queryParams)
  const orderStatusQuery = useOrderStatusQuery(queryParams)
  const topItemsQuery = useTopItemsQuery(queryParams)
  const categoryRevenueQuery = useCategoryRevenueQuery(queryParams)
  const deliveryTypesQuery = useDeliveryTypesQuery(queryParams)

  const isLoading =
    statsQuery.isLoading ||
    salesTrendQuery.isLoading ||
    orderStatusQuery.isLoading ||
    topItemsQuery.isLoading ||
    categoryRevenueQuery.isLoading ||
    deliveryTypesQuery.isLoading

  const handleRefresh = async () => {
    await refreshDashboard()
  }

  if (isLoading && !statsQuery.data) {
    return <LoadingScreen message="Loading sales report..." />
  }

  return (
    <div className="bg-slate-50/30 dark:bg-background-dark/30 min-h-screen p-4 md:p-6 transition-colors">
      <div className="flex items-center justify-between gap-4 px-1 mb-4">
        <div>
          <h2 className="text-[10px] lg:text-xs font-[600] uppercase tracking-[0.1rem] text-[#a16b45] opacity-80 mb-1">
            Sales Analytics
          </h2>
          <div className="h-0.5 w-12 bg-emerald-500 rounded-full" />
        </div>
      </div>
      {/* Date Information Bar */}
      <div className="bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 p-2 md:p-3 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex-1 flex items-center overflow-hidden">
          <MiniStats
            stats={statsQuery.data || null}
            loading={statsQuery.isLoading}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <DateFilterComponent className="w-full sm:w-[180px]" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <SalesTrendChart
                  data={salesTrendQuery.data || null}
                  loading={salesTrendQuery.isLoading}
                  error={
                    salesTrendQuery.error ? 'Failed to load sales trend' : null
                  }
                  onRetry={handleRefresh}
                />
              </div>

              <div className="lg:col-span-4">
                <OrderStatusChart
                  data={orderStatusQuery.data || null}
                  loading={orderStatusQuery.isLoading}
                  error={
                    orderStatusQuery.error
                      ? 'Failed to load order status'
                      : null
                  }
                  onRetry={handleRefresh}
                />
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {tab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="lg:col-span-7">
              <TopSellingItems
                data={topItemsQuery.data || null}
                loading={topItemsQuery.isLoading}
                error={topItemsQuery.error ? 'Failed to load top items' : null}
                onRetry={handleRefresh}
              />
            </div>

            <div className="lg:col-span-5">
              <RevenueByCategoryChart
                data={categoryRevenueQuery.data || null}
                loading={categoryRevenueQuery.isLoading}
                error={
                  categoryRevenueQuery.error
                    ? 'Failed to load category revenue'
                    : null
                }
                onRetry={handleRefresh}
              />
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {tab === 'customers' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CustomerActivityTable rid={rid} />
          </div>
        )}

        {/* Delivery Tab */}
        {tab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="lg:col-span-8 mx-auto w-full">
              <DeliveryTypeChart
                data={deliveryTypesQuery.data || null}
                loading={deliveryTypesQuery.isLoading}
                error={
                  deliveryTypesQuery.error
                    ? 'Failed to load delivery types'
                    : null
                }
                onRetry={handleRefresh}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
