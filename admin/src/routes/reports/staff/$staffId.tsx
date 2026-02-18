import { createFileRoute } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useInfiniteStaffOrdersQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useLoadMore } from '@/hooks/useLoadMore'
import { useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  IndianRupee,
  Calendar,
  Loader2,
} from 'lucide-react'
import { requireAuth } from '@/middleware/auth'
import { format } from 'date-fns'
import { parseOrderItems } from '@/components/admin/order-history/utils/orderHistoryUtils'

export const Route = createFileRoute('/reports/staff/$staffId')({
  beforeLoad: requireAuth,
  component: StaffOrdersPage,
})

function StaffOrdersPage() {
  const { staffId } = Route.useParams()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()
  const queryParams = useMemo(
    () => ({
      rid,
      start_date: currentDateRange.startDate,
      end_date: currentDateRange.endDate,
      limit: 12,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const {
    data: infiniteData,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteStaffOrdersQuery(staffId, queryParams)

  // Flatten orders from infinite pages
  const allOrders = useMemo(() => {
    return infiniteData?.pages.flatMap((page) => page.orders) || []
  }, [infiniteData])

  // Get data from the first page (staff info and summary)
  const data = infiniteData?.pages[0]
  const summary = data?.summary
  const staff = data?.staff

  // Progressive rendering hook
  const { visibleItems, hasMore, sentinelRef } = useLoadMore(allOrders, 12)

  // Sync server-side loading with local progressive rendering
  useEffect(() => {
    // Trigger server fetch only when local cache is exhausted and no fetch is currently active
    if (
      hasNextPage &&
      !isFetching &&
      visibleItems.length >= allOrders.length &&
      allOrders.length > 0
    ) {
      fetchNextPage()
    }
  }, [
    visibleItems.length,
    allOrders.length,
    hasNextPage,
    isFetching,
    fetchNextPage,
  ])

  if (isLoading && !infiniteData) {
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

  // Use summary data from API
  const totalRevenue = parseInt(summary?.total_revenue || 0)
  const totalOrders = parseInt(summary?.total_orders || 0)
  const avgOrderValue = parseInt(summary?.avg_order_value || 0)

  return (
    <div className="space-y-6 px-4 py-4 md:py-8 max-w-7xl mx-auto font-sans bg-slate-50/50 min-h-screen">
      {/*mark KPI Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#2d1e14] p-3 sm:p-6 rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm transition-alls hover:shadow-orange-500/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
            <IndianRupee className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl w-fit border border-emerald-100 dark:border-emerald-900/20">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] sm:text-[13px] font-[550] sm:font-black sm:uppercase tracking-tight sm:tracking-[0.2em] text-[#a16b45] opacity-60 truncate">
                Gross Revenue
              </p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 truncate">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-[#2d1e14] p-3 sm:p-6 rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm transition-all hover:shadow-orange-500/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
            <ShoppingCart className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl w-fit border border-blue-100 dark:border-blue-900/20">
              <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] sm:text-[13px] font-[550] sm:font-black sm:uppercase tracking-tight sm:tracking-[0.2em] text-[#a16b45] opacity-60 truncate">
                Processed Orders
              </p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 truncate">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white dark:bg-[#2d1e14] p-3 sm:p-6 rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm transition-all hover:shadow-orange-500/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
            <TrendingUp className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl w-fit border border-amber-100 dark:border-amber-900/20">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] sm:text-[13px] font-[550] sm:font-black sm:uppercase tracking-tight sm:tracking-[0.2em] text-[#a16b45] opacity-60 truncate">
                Average Value
              </p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 truncate">
                ₹{avgOrderValue.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[#a16b45] opacity-80">
            Past orders by {staff?.name}
          </h2>
          <div className="h-px bg-[#ead9cd] dark:bg-primary/10 flex-1 ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {visibleItems && visibleItems.length > 0 ? (
            visibleItems.map((order) => {
              const orderTotal = (
                parseFloat(order.order_total.toString()) -
                parseFloat((order.total_discount || 0).toString())
              ).toFixed(2)

              return (
                <div
                  key={order.cart_id}
                  className="bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-orange-500/5 transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] lg:text-[15px] font-[500] text-slate-900 dark:text-slate-500 uppercase">
                        #{order.cart_id.slice(-8)}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-bold text-zinc-600 uppercase opacity-70">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(order.created_at), 'MMM dd, hh:mm a')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[14px] sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white">
                        ₹{orderTotal}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                          order.order_status === 'settled'
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20'
                            : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-orange-100 dark:border-orange-900/20'
                        }`}
                      >
                        {order.order_status === 'settled'
                          ? 'COMPLETED'
                          : order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-y border-slate-50 dark:border-primary/5">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-[#3a291d] shadow-sm">
                      <AvatarImage
                        src={order.customer_profile_pic || undefined}
                      />
                      <AvatarFallback className="bg-slate-50 dark:bg-[#3a291d] text-[#a16b45] font-black text-[10px]">
                        {order.customer_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base md:text-[19px] font-[500] text-slate-900 dark:text-white truncate tracking-tight">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-[#a16b45] font-bold truncate opacity-60">
                        {order.customer_phone}
                      </p>
                    </div>
                    {order.total_discount > 0 && (
                      <div className="ml-auto px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                        <span className="text-[9px] sm:text-xs font-black text-emerald-600 uppercase">
                          -₹{order.total_discount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                    {parseOrderItems(order.items).map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-[450] text-[12px] md:text-[16px] text-zinc-500 dark:text-slate-300">
                              {item.quantity}×
                            </span>
                            <span className="font-[450] text-[12px] md:text-[16px] text-zinc-500 dark:text-slate-300 truncate text-xs leading-tight">
                              {item.item_name}
                            </span>
                          </div>
                          <span className="font-[450] text-[12px] md:text-[16px] text-zinc-500 dark:text-slate-300 text-xs shrink-0">
                            ₹{item.price}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-full mb-4">
                <ShoppingCart className="w-10 h-10 text-orange-600" />
              </div>
              <p className="text-[10px] font-black text-[#a16b45] uppercase tracking-[0.2em]">
                No orders identified
              </p>
            </div>
          )}
        </div>

        {/* Infinite Scroll Sentinel */}
        {(hasNextPage || hasMore) && (
          <div
            ref={sentinelRef}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            {isFetchingNextPage || (hasNextPage && !hasMore) ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <p className="text-[10px] font-black text-[#a16b45] uppercase tracking-[0.2em] opacity-60">
                  Retrieving more orders...
                </p>
              </div>
            ) : (
              <div className="h-2 w-2 rounded-full bg-[#ead9cd] animate-pulse" />
            )}
          </div>
        )}

        {!hasNextPage && !hasMore && allOrders.length > 0 && (
          <div className="py-12 text-center">
            <p className="text-[10px] font-black text-[#a16b45]/40 uppercase tracking-[0.2em]">
              End of Activity Timeline
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
