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
          <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[#a16b45] opacity-80 mb-1">
            Performance Leaderboard
          </h2>
          <div className="h-0.5 w-12 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-50 dark:bg-[#3a291d] rounded-full border border-orange-100/50 dark:border-orange-900/10 group-hover:scale-125 transition-transform duration-500" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-orange-50 dark:bg-[#3a291d] text-orange-600 border border-orange-100 dark:border-orange-900/10">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Total Revenue
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 dark:bg-blue-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-100 dark:border-blue-900/20">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Total Orders
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-900/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Avg Value
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                ₹{avgOrderValue.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-50 dark:bg-purple-900/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="shrink-0 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 border border-purple-100 dark:border-purple-900/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a16b45] mb-0.5 opacity-70">
                Customers
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {totalCustomers.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      {/* Leaderboard Container */}
      <div className="bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden transition-all hover:shadow-lg group/container">
        <div className="px-6 py-5 border-b border-[#ead9cd] dark:border-primary/10 bg-slate-50/10 dark:bg-background-dark/30 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Staff Leaderboard
          </h2>
        </div>

        {/* Mobile Card View (Hidden on Tablet/Desktop) */}
        <div className="grid grid-cols-1 divide-y divide-[#ead9cd]/50 dark:divide-primary/5 md:hidden">
          {data?.staff.map((staff, index) => (
            <div
              key={staff.staff_id}
              className="p-4 hover:bg-orange-50/20 dark:hover:bg-[#3a291d]/20 transition-all group/card relative"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Rank & Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-[#3a291d] shadow-md transition-transform group-hover/card:scale-105">
                    <AvatarImage src={staff.profile_pic || undefined} />
                    <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-black">
                      {staff.staff_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center text-lg z-10">
                    {index === 0 ? (
                      '🥇'
                    ) : index === 1 ? (
                      '🥈'
                    ) : index === 2 ? (
                      '🥉'
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-[#3a291d] border border-[#ead9cd] dark:border-primary/20 text-[10px] font-black text-[#a16b45] flex items-center justify-center shadow-sm">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#2d1e14] shadow-sm ring-2 ring-emerald-500/10" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {staff.staff_name}
                  </p>
                  <p className="text-[10px] text-[#a16b45] font-bold uppercase tracking-widest opacity-60">
                    @{staff.username}
                  </p>
                </div>

                {/* Action */}
                <Link
                  to="/reports/staff/$staffId"
                  params={{ staffId: staff.staff_id.toString() }}
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#3a291d] text-slate-400 border border-slate-100 dark:border-primary/5 group-hover/card:bg-orange-600 group-hover/card:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </Link>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50/50 dark:bg-[#3a291d]/20 p-2 rounded-xl border border-slate-100/50 dark:border-primary/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#a16b45] opacity-60 mb-1">
                    Orders
                  </p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {staff.total_orders}
                  </p>
                </div>
                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-2 rounded-xl border border-emerald-100/20 dark:border-emerald-900/10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 opacity-60 mb-1">
                    Revenue
                  </p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-500">
                    ₹{staff.total_revenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50/50 dark:bg-[#3a291d]/20 p-2 rounded-xl border border-slate-100/50 dark:border-primary/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#a16b45] opacity-60 mb-1">
                    Avg Val
                  </p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                    ₹{parseFloat(staff.avg_order_value.toString()).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/5 dark:bg-[#3a291d]/10">
              <TableRow className="border-[#ead9cd] dark:border-primary/10 hover:bg-transparent">
                <TableHead className="w-20 pl-6 h-12 text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Rank
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Staff Member
                </TableHead>
                <TableHead className="h-12 text-right text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Orders
                </TableHead>
                <TableHead className="h-12 text-right text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Revenue
                </TableHead>
                <TableHead className="h-12 text-right text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Avg Value
                </TableHead>
                <TableHead className="h-12 text-right text-[10px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                  Customers
                </TableHead>
                <TableHead className="w-16 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.staff.map((staff, index) => (
                <TableRow
                  key={staff.staff_id}
                  className="border-[#ead9cd]/50 dark:border-primary/5 hover:bg-orange-50/30 dark:hover:bg-[#3a291d]/20 transition-all group/row"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm relative group-hover/row:scale-110 transition-transform">
                      {index === 0 && (
                        <div className="absolute inset-0 bg-yellow-400 opacity-10 rounded-full animate-pulse blur-md" />
                      )}
                      <span className="relative z-10 text-xl">
                        {index === 0 ? (
                          '🥇'
                        ) : index === 1 ? (
                          '🥈'
                        ) : index === 2 ? (
                          '🥉'
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#3a291d] flex items-center justify-center text-[10px] text-slate-400 border border-slate-100 dark:border-primary/5">
                            {index + 1}
                          </div>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-[#3a291d] shadow-sm transform group-hover/row:scale-105 transition-all">
                          <AvatarImage src={staff.profile_pic || undefined} />
                          <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-black text-[10px]">
                            {staff.staff_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#2d1e14] shadow-sm ring-2 ring-emerald-500/20" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover/row:text-orange-600 transition-colors">
                          {staff.staff_name}
                        </p>
                        <p className="text-[10px] text-[#a16b45] font-bold uppercase tracking-widest opacity-60 truncate">
                          @{staff.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {staff.total_orders.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                      ₹{staff.total_revenue.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 opacity-80">
                      ₹{parseFloat(staff.avg_order_value.toString()).toFixed(2)}
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#3a291d] text-slate-400 group-hover/row:bg-orange-600 group-hover/row:text-white transition-all shadow-sm"
                    >
                      <ChevronRight
                        className="w-4 h-4 transform group-hover/row:translate-x-0.5 transition-transform"
                        strokeWidth={3}
                      />
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
