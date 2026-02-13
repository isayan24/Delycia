import { createFileRoute, Link } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useStaffLeaderboardQuery } from '@/hooks/queries/useStaffReportsQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import DateRangeDisplay from '@/components/admin/dashboard/DateRangeDisplay'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
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
  Users,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  IndianRupee,
} from 'lucide-react'
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

  const { data, isLoading, error, refetch } =
    useStaffLeaderboardQuery(queryParams)

  const handleRefresh = async () => {
    await refetch()
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Skeleton className="h-6 w-48" />

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

        {/* Leaderboard Table Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="rounded-md border">
            <div className="p-4">
              {/* Table Header Skeleton */}
              <div className="flex items-center gap-4 pb-3 border-b">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              {/* Table Rows Skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b">
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
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
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
    <div className="font-sans px-3 py-2 md:py-4 space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-md md:text-xl font-[460] tracking-tight text-gray-900">
              Staff Performance
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
              Analyze team productivity and revenue contribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="shrink-0">
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
      <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-3 px-3 md:grid md:grid-cols-4 gap-3 scrollbar-none">
        {/* Total Revenue */}
        <div className="flex-none w-auto md:w-auto p-2 rounded-2xl bg-white border border-orange-100  ring-1 ring-orange-100/50 bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className="shrink-0 p-1.5 rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
            <IndianRupee className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Total Revenue
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className=" md:text-md font-semibold text-gray-900 leading-none">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="flex-none w-auto md:w-auto p-2 rounded-2xl bg-white border border-orange-100 shadow-[0_8px_20px_-6px_rgba(249,115,22,0.12)] ring-1 ring-orange-100/50 bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className="shrink-0 p-1.5 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
            <ShoppingCart className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Total Orders
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className=" md:text-md font-semibold text-gray-900 leading-none">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="flex-none w-auto md:w-auto p-2 rounded-2xl bg-white border border-orange-100 shadow-[0_8px_20px_-6px_rgba(249,115,22,0.12)] ring-1 ring-orange-100/50 bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className="shrink-0 p-1.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
            <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Avg Order Value
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className=" md:text-md font-semibold text-gray-900 leading-none">
                ₹{avgOrderValue.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="flex-none w-auto md:w-auto p-2 rounded-2xl bg-white border border-orange-100 shadow-[0_8px_20px_-6px_rgba(249,115,22,0.12)] ring-1 ring-orange-100/50 bg-linear-to-br from-white to-orange-50/30 transition-all hover:shadow-orange-500/10 group flex items-center gap-2.5">
          <div className="shrink-0 p-1.5 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
            <Users className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 group-hover:text-orange-600 whitespace-nowrap">
              Unique Customers
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="md:text-md font-semibold text-gray-900 leading-none">
                {totalCustomers.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
            Staff Leaderboard
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="w-16 h-10 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Rank
                </TableHead>
                <TableHead className="h-10 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Staff Member
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Orders
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Revenue
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Avg Value
                </TableHead>
                <TableHead className="h-10 text-right text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Customers
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.staff.map((staff, index) => (
                // <Link
                //   to="/reports/staff/$staffId"
                //   params={{ staffId: staff.staff_id.toString() }}
                // >
                <TableRow
                  key={staff.staff_id}
                  className="border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 text-xs font-black text-gray-600 group-hover:bg-white transition-colors">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarImage src={staff.profile_pic || undefined} />
                          <AvatarFallback className="bg-orange-50 text-orange-600 font-bold text-xs">
                            {staff.staff_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                            <TrendingUp className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {staff.staff_name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          @{staff.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 font-bold text-gray-900">
                    {staff.total_orders.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-3 font-black text-emerald-600">
                    ₹{staff.total_revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-3 font-bold text-gray-600">
                    ₹{staff.avg_order_value}
                  </TableCell>
                  <TableCell className="text-right py-3 font-bold text-gray-500">
                    {staff.unique_customers}
                  </TableCell>
                  <TableCell className="py-3">
                    <Link
                      to="/reports/staff/$staffId"
                      params={{ staffId: staff.staff_id.toString() }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-orange-600 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </TableCell>
                </TableRow>
                // {/* </Link> */}
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {data.pagination.current_page} of{' '}
              {data.pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <StatefulButton
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev_page}
                className="h-9 px-4 text-xs font-bold uppercase tracking-tight bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
              >
                Previous
              </StatefulButton>
              <StatefulButton
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next_page}
                className="h-9 px-4 text-xs font-bold uppercase tracking-tight bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
              >
                Next
              </StatefulButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
