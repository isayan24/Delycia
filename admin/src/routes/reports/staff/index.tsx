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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Staff Performance Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track staff performance and revenue contribution
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <DateFilterComponent />
          </div>
          <StatefulButton onClick={handleRefresh} className="w-auto shadow-sm">
            Refresh
          </StatefulButton>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <DateRangeDisplay />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold">₹{totalRevenue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-lg font-bold">₹{avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Customers</p>
              <p className="text-lg font-bold">{totalCustomers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Staff Leaderboard</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Value</TableHead>
                <TableHead className="text-right">Customers</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.staff.map((staff, index) => (
                <TableRow key={staff.staff_id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.profile_pic || undefined} />
                        <AvatarFallback>
                          {staff.staff_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{staff.staff_name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{staff.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {staff.total_orders}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    ₹{staff.total_revenue}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{staff.avg_order_value}
                  </TableCell>
                  <TableCell className="text-right">
                    {staff.unique_customers}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/reports/staff/$staffId"
                      params={{ staffId: staff.staff_id.toString() }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Page {data.pagination.current_page} of{' '}
              {data.pagination.total_pages}
            </div>
            <div className="flex gap-2">
              <StatefulButton
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev_page}
              >
                Previous
              </StatefulButton>
              <StatefulButton
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next_page}
              >
                Next
              </StatefulButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
