import { createFileRoute, Link } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useStaffLeaderboardQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  TrendingUp,
  ShoppingCart,
  ChevronRight,
  IndianRupee,
  Users2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/reports/staff/')({
  beforeLoad: requireAuth,
  component: StaffReportsPage,
})

function StaffReportsPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString() || ''
  const { currentDateRange } = useDateFilterStore()
  const [page, setPage] = useState(1)
  const limit = 20

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

  const { data, isLoading, error } = useStaffLeaderboardQuery(queryParams)

  if (isLoading && !data) {
    return (
      <div className="space-y-4 px-3 py-2 md:py-4">
        <Skeleton className="h-6 w-48" />

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="p-4 border-none shadow-none bg-white rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Leaderboard Table Skeleton */}
        <Card className="p-6 border-none shadow-none bg-white rounded-2xl">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-none"
                >
                  <Skeleton className="h-4 w-12" />
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl m-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
          Error loading staff reports: {error.message}
        </p>
      </div>
    )
  }

  const totalRevenue =
    data?.staff.reduce(
      (sum, staff) => sum + parseFloat(staff.total_revenue.toString()),
      0,
    ) || 0
  const totalOrders =
    data?.staff.reduce(
      (sum, staff) => sum + parseInt(staff.total_orders.toString()),
      0,
    ) || 0
  const totalCustomers =
    data?.staff.reduce(
      (sum, staff) => sum + parseInt(staff.unique_customers.toString()),
      0,
    ) || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="font-sans px-3 py-4 md:py-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Sub-Header */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-[10px] lg:text-xs font-[600] uppercase tracking-[0.1rem] text-[#a16b45] opacity-80 mb-1">
            Performance Leaderboard
          </h2>
          <div className="h-0.5 w-12 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-2 sm:p-4 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 transition-all group overflow-hidden relative">
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-orange-50 dark:bg-[#3a291d] text-orange-600 border border-orange-100 dark:border-orange-900/10">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#a16b45] mb-0.5 opacity-70">
                Total Revenue
              </p>
              <h3 className="text-sm font-[520] sm:text-xl sm:font-black text-slate-900 dark:text-white leading-none">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-2 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 dark:bg-blue-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-100 dark:border-blue-900/20">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Total Orders
              </p>
              <h3 className="text-sm font-[520] sm:text-xl sm:font-black text-slate-900 dark:text-white leading-none">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="p-2 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-900/20">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Avg Value
              </p>
              <h3 className="text-sm font-[520] sm:text-xl sm:font-black text-slate-900 dark:text-white leading-none">
                ₹{avgOrderValue.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="p-2 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-50 dark:bg-purple-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 border border-purple-100 dark:border-purple-900/20">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Customers
              </p>
              <h3 className="text-sm font-[520] sm:text-xl sm:font-black text-slate-900 dark:text-white leading-none">
                {totalCustomers.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      {/* Leaderboard Container */}
      <div className="bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10   overflow-hidden transition-all   group/container">
        {/* Mobile Card View (Hidden on Tablet/Desktop) */}
        <div className="grid grid-cols-1 divide-y divide-[#ead9cd] dark:divide-primary/5 md:hidden">
          {data?.staff.map((staff, index) => (
            <Link
              to="/reports/staff/$staffId"
              params={{ staffId: staff.staff_id.toString() }}
              key={staff.staff_id}
              className="p-4 hover:bg-orange-50/10 dark:hover:bg-[#3a291d]/10 transition-all group/card relative space-y-3"
            >
              <div className="flex items-center gap-3">
                {/* Avatar & Rank */}
                <div className="relative shrink-0">
                  <Avatar className="h-9 w-9 border border-slate-100 dark:border-primary/10 shadow-sm">
                    <AvatarImage src={staff.profile_pic || undefined} />
                    <AvatarFallback className="bg-slate-50 dark:bg-[#3a291d] text-slate-400 font-bold text-sm">
                      {staff.staff_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1.5 -left-1.5 size-6 flex items-center justify-center text-lg z-10">
                    {index === 0
                      ? '🥇'
                      : index === 1
                        ? '🥈'
                        : index === 2
                          ? '🥉'
                          : null}
                  </div>
                  {index > 2 && (
                    <div className="absolute -top-1 -left-1 size-5 rounded-lg bg-white dark:bg-[#3a291d] border border-slate-100 dark:border-primary/10 text-[9px] font-bold text-slate-400 flex items-center justify-center shadow-sm z-10">
                      {index + 1}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#2d1e14] shadow-sm" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-white truncate group-hover/card:text-orange-600 transition-colors">
                    {staff.staff_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-[500]  mt-0.5">
                    @{staff.username}
                  </p>
                </div>

                {/* Action Link */}
                <div className="shrink-0 text-slate-600 group-hover/card:text-orange-500 transition-colors p-1">
                  <ChevronRight className="size-4.5" />
                </div>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-primary/5 rounded-lg px-4 h-12">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Orders
                  </span>
                  <span className="text-[14px] font-black text-slate-900 dark:text-white mt-0.5">
                    {staff.total_orders}
                  </span>
                </div>
                <div className="h-5 w-px bg-[#ead9cd]/40 dark:bg-primary/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Revenue
                  </span>
                  <span className="text-[14px] font-black text-slate-900 dark:text-white mt-0.5">
                    ₹{staff.total_revenue.toLocaleString()}
                  </span>
                </div>
                <div className="h-5 w-px bg-[#ead9cd]/40 dark:bg-primary/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Avg Val
                  </span>
                  <span className="text-[14px] font-black text-slate-900 dark:text-white mt-0.5">
                    ₹{parseFloat(staff.avg_order_value.toString()).toFixed(0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-[#3a291d]/10">
              <TableRow className="border-[#ead9cd] dark:border-primary/10 hover:bg-transparent">
                <TableHead className="w-24 pl-6 h-14 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Rank
                </TableHead>
                <TableHead className="h-14 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Staff Member
                </TableHead>
                <TableHead className="h-14 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Orders
                </TableHead>
                <TableHead className="h-14 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Revenue
                </TableHead>
                <TableHead className="h-14 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Avg Value
                </TableHead>
                <TableHead className="h-14 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Customers
                </TableHead>
                <TableHead className="w-16 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.staff.map((staff, index) => (
                <TableRow
                  key={staff.staff_id}
                  className="border-[#ead9cd]/40 dark:border-primary/5 hover:bg-slate-50/50 dark:hover:bg-[#3a291d]/10 transition-all group/row h-20"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center justify-start">
                      <div
                        className={`
                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs
                        ${
                          index === 0
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : index === 1
                              ? 'bg-slate-50 text-slate-400 border border-slate-100'
                              : index === 2
                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                : 'text-slate-300'
                        }
                      `}
                      >
                        #{index + 1}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 border border-slate-100 dark:border-primary/10 shadow-sm transition-transform group-hover/row:scale-105">
                          <AvatarImage src={staff.profile_pic || undefined} />
                          <AvatarFallback className="bg-slate-50 dark:bg-[#3a291d] text-slate-400 font-bold text-sm">
                            {staff.staff_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#2d1e14] shadow-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-slate-900 dark:text-white truncate group-hover/row:text-orange-600 transition-colors">
                          {staff.staff_name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                          @{staff.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {staff.total_orders.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{staff.total_revenue.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-xs font-bold text-slate-400">
                      ₹{parseFloat(staff.avg_order_value.toString()).toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {staff.unique_customers}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <Link
                      to="/reports/staff/$staffId"
                      params={{ staffId: staff.staff_id.toString() }}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-300 group-hover/row:text-orange-500 transition-colors"
                    >
                      <ChevronRight className="size-5 transition-transform group-hover/row:translate-x-0.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="px-6 py-5 border-t border-[#ead9cd] dark:border-primary/10 bg-slate-50/10 dark:bg-background-dark/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60 text-center sm:text-left">
              Displaying page {data.pagination.current_page} of{' '}
              {data.pagination.total_pages}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev_page}
                className="flex-1 sm:flex-none h-9 px-6 rounded-xl border-[#ead9cd] dark:border-primary/10 text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-[#3a291d] transition-all disabled:opacity-40"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next_page}
                className="flex-1 sm:flex-none h-9 px-6 rounded-xl border-[#ead9cd] dark:border-primary/10 text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-[#3a291d] transition-all disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
