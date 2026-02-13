import { createFileRoute } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useStaffOrdersQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import DateRangeDisplay from '@/components/admin/dashboard/DateRangeDisplay'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ShoppingCart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  IndianRupee,
} from 'lucide-react'
import { requireAuth } from '@/middleware/auth'
import { format } from 'date-fns'
import { parseOrderItems } from '@/components/admin/order-history/utils/orderHistoryUtils'
import { getRoleBadge } from '@/components/admin/staff/helpers/getRoleBadge'

export const Route = createFileRoute('/reports/staff/$staffId')({
  beforeLoad: requireAuth,
  component: StaffOrdersPage,
})

function StaffOrdersPage() {
  const { staffId } = Route.useParams()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()
  const [page, setPage] = useState(1)
  const limit = 10

  const queryParams = useMemo(
    () => ({
      rid,
      start_date: currentDateRange.startDate,
      end_date: currentDateRange.endDate,
      page,
      limit,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate, page],
  )

  const { data, isLoading, refetch } = useStaffOrdersQuery(staffId, queryParams)

  const handleRefresh = async () => {
    await refetch()
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <Skeleton className="h-8 w-64" />

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Orders Table Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Use summary data from API instead of calculating from paginated orders
  const totalRevenue = parseInt(data?.summary?.total_revenue || 0)
  const totalOrders = parseInt(data?.summary?.total_orders || 0)
  const avgOrderValue = parseInt(data?.summary?.avg_order_value || 0)

  return (
    <div className="space-y-2 px-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="flex items-center space-x-2">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-sm">
              <AvatarImage src={data?.staff.profile_pic || undefined} />
              <AvatarFallback className="bg-orange-50 text-orange-600 font-bold text-sm md:text-base">
                {data?.staff.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <TrendingUp className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-md md:text-lg font-semibold tracking-tight text-gray-900 leading-tight">
              {data?.staff.name}'s History
            </h1>
            <div className="flex items-center gap-1 mt-0.3">
              <span className="text-[10px] md:text-xs text-gray-400 font-medium lowercase">
                @{data?.staff.username}
              </span>
              <span className="text-[10px] text-gray-300">•</span>
              <div className="scale-75 origin-left">
                {getRoleBadge(data?.staff.role)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="shrink-0 scale-90 md:scale-100 origin-right">
            <DateFilterComponent />
          </div>
          <StatefulButton
            onClick={handleRefresh}
            className="h-9 md:h-10 px-4 text-xs md:text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-sm transition-all active:scale-95"
          >
            Refresh
          </StatefulButton>
        </div>
      </div>

      {/* <DateRangeDisplay /> */}

      {/* KPI Cards - Horizontal scroll on mobile */}
      <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-3 px-3 md:grid md:grid-cols-3 gap-3 scrollbar-none">
        {/* Total Revenue */}
        <div className="flex-none w-auto p-2 rounded-2xl bg-white border border-orange-100  bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className=" p-1.5 rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
            <IndianRupee className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Revenue
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-base md:text-xl font-black text-gray-900 leading-none">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="flex-none w-auto p-2 rounded-2xl bg-white border border-orange-100  bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className=" p-1.5 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
            <ShoppingCart className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Orders
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-base md:text-xl font-black text-gray-900 leading-none">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="flex-none w-auto p-2 rounded-2xl bg-white border border-orange-100  bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className=" p-1.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
            <IndianRupee className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Avg Value
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-base md:text-xl font-black text-gray-900 leading-none">
                ₹{avgOrderValue.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[calc(100vh-15.6rem)] min-h-[400px]">
        <div className=" px-2 border-b border-gray-100 bg-gray-50/30 p-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
            Recent Orders
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none bg-gray-50/20">
          {data?.orders && data?.orders.length > 0 ? (
            data.orders.map((order) => {
              const orderTotal = (
                parseFloat(order.order_total.toString()) -
                parseFloat((order.total_discount || 0).toString())
              ).toFixed(2)

              return (
                <div
                  key={order.cart_id}
                  className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Row: ID, Time, Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">
                          #{order.cart_id.slice(-8)}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold leading-none">
                          {format(
                            new Date(order.created_at),
                            'MMM dd, hh:mm a',
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm md:text-base font-black text-gray-900 leading-none mb-1">
                          ₹{orderTotal}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tight border ${
                            order.order_status === 'settled'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}
                        >
                          {order.order_status === 'settled'
                            ? 'COMPLETED'
                            : order.order_status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Customer Info */}
                    <div className="flex items-center gap-3 pt-2.5 border-t border-gray-50">
                      <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-white shadow-xs">
                        <AvatarImage
                          src={order.customer_profile_pic || undefined}
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-500 font-semibold text-[10px] md:text-xs">
                          {order.customer_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate uppercase tracking-tight">
                          {order.customer_name}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                          {order.customer_phone}
                        </p>
                      </div>
                      {order.total_discount > 0 && (
                        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                          <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-tight">
                            -₹{order.total_discount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Items List */}
                    <div className="bg-gray-50/50 rounded-lg p-2.5 space-y-1.5 border border-gray-100/50">
                      {parseOrderItems(order.items).map(
                        (item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-black text-gray-400 text-[9px] md:text-[10px]">
                                {item.quantity}×
                              </span>
                              <span className="font-bold text-gray-700 truncate text-[11px] md:text-sm leading-tight">
                                {item.item_name}
                              </span>
                            </div>
                            <span className="font-black text-gray-900 text-[10px] md:text-xs shrink-0">
                              ₹{item.price}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                No orders found
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {data.pagination.current_page} of{' '}
              {data.pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev_page}
                className="h-9 px-4 text-xs font-bold uppercase tracking-tight bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next_page}
                className="h-9 px-4 text-xs font-bold uppercase tracking-tight bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
