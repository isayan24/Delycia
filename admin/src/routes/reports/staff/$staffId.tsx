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
  Phone,
} from 'lucide-react'
import { requireAuth } from '@/middleware/auth'
import { format } from 'date-fns'
import { parseOrderItems } from '@/components/admin/order-history/utils/orderHistoryUtils'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'

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

  const { state } = useSidebar()
  const isSidebarCollapsed = state === 'collapsed'

  if (isLoading && !infiniteData) {
    return (
      <div className="space-y-6 px-4 py-4 md:py-8 max-w-7xl mx-auto font-sans bg-slate-50/50 min-h-screen">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 sm:h-36 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800/50"
            ></div>
          ))}
        </div>

        {/* Orders Table Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-48 mb-2" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 sm:h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 animate-pulse"
            ></div>
          ))}
        </div>
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
      <div className="flex-1 flex flex-col gap-6">
        <div className="px-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Order Activity Timeline
          </h2>
          <p className="text-[14px] text-slate-500 font-medium mt-1">
            Historical transaction records processed by {staff?.name}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visibleItems && visibleItems.length > 0 ? (
            visibleItems.map((order) => {
              const orderTotal = (
                parseFloat(order.order_total.toString()) -
                parseFloat((order.total_discount || 0).toString())
              ).toFixed(2)

              return (
                <div
                  key={order.cart_id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none p-5 md:p-6"
                >
                  <div
                    className={cn(
                      'grid grid-cols-12 gap-6 md:gap-8 lg:gap-4 items-center',
                      isSidebarCollapsed
                        ? 'max-[1024px]:block max-[1024px]:grid-cols-1'
                        : 'max-[1200px]:grid-cols-1 max-[1200px]:block',
                    )}
                  >
                    {/* Left Column: Order Meta */}
                    <div
                      className={cn(
                        'col-span-3 flex flex-col gap-1',
                        isSidebarCollapsed ? '' : 'max-[1200px]:mb-4',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] md:text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          #{order.cart_id.slice(-8)}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                            order.order_status === 'settled'
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20'
                              : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-orange-100 dark:border-orange-900/20'
                          }`}
                        >
                          {order.order_status === 'settled'
                            ? 'COMPLETED'
                            : order.order_status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-slate-500">
                        <Calendar className="size-3.5 opacity-40 shrink-0" />
                        <span>
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="opacity-30">•</span>
                        <span>
                          {format(new Date(order.created_at), 'hh:mm a')}
                        </span>
                      </div>
                    </div>

                    {/* Center Column: Customer */}
                    <div
                      className={cn(
                        'col-span-3 flex items-center gap-4',
                        isSidebarCollapsed
                          ? 'max-[1024px]:my-3 max-[1024px]:border-y max-[1024px]:py-3 max-[1024px]:border-slate-100 dark:max-[1024px]:border-slate-800'
                          : 'max-[1200px]:col-span-1 max-[1200px]:my-3 max-[1200px]:border-y max-[1200px]:py-3 max-[1200px]:border-slate-100 dark:max-[1200px]:border-slate-800',
                      )}
                    >
                      <Avatar className="size-11 md:size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <AvatarImage
                          src={order.customer_profile_pic || undefined}
                        />
                        <AvatarFallback className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold text-sm">
                          {order.customer_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-[15px] md:text-[16px] leading-tight truncate">
                          {order.customer_name}
                        </h4>
                        <p className="text-[12px] md:text-[13px] font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                          <Phone className="size-3 lg:size-3.5 opacity-40 shrink-0" />
                          <span className="truncate">
                            {order.customer_phone}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Items & Financials */}
                    <div
                      className={cn(
                        'md:col-span-2 lg:col-span-6 flex flex-wrap sm:flex-nowrap items-center justify-end gap-6 xl:gap-8 dark:border-slate-800/50 pt-5 lg:pt-0 lg:pl-6 xl:pl-8',
                        isSidebarCollapsed
                          ? 'max-[1024px]:justify-between'
                          : 'max-[1200px]:justify-between ',
                      )}
                    >
                      <div className="flex-1 min-w-[150px] lg:min-w-[200px] border-dotted md:border-l border-slate-300 dark:border-slate-800 md:pl-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Items Summary
                        </span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {parseOrderItems(order.items).map(
                            (item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 "
                              >
                                <span className="text-[12px] font-black text-slate-900 dark:text-slate-200">
                                  {item.quantity}×
                                </span>
                                <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                                  {item.item_name}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-right min-w-[100px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Total Value
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          {order.total_discount > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 line-through opacity-50">
                              ₹{order.order_total}
                            </span>
                          )}
                          <span className="font-black text-slate-900 dark:text-white text-lg md:text-xl">
                            ₹{orderTotal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
              <ShoppingCart className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">
                No orders identified for this period
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
