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

  const totalRevenue =
    data?.orders.reduce(
      (sum, order) =>
        sum +
        (parseFloat(order.order_total.toString()) -
          parseFloat(order.total_discount.toString() || '0')),
      0,
    ) || 0
  const totalOrders = data?.orders.length || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 max-[500px]:p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Staff Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 max-[500px]:h-10 max-[500px]:w-10">
              <AvatarImage src={data?.staff.profile_pic || undefined} />
              <AvatarFallback className="text-lg max-[500px]:text-sm">
                {data?.staff.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg max-[500px]:text-base font-bold tracking-tight text-gray-900">
                {data?.staff.name}'s Order History
              </h1>
              <p className="text-xs text-muted-foreground">
                @{data?.staff.username} • Role: {getRoleBadge(data?.staff.role)}
              </p>
            </div>
          </div>

          {/* Filters - Full width on mobile */}
          <div className="flex items-center gap-2 relative z-50">
            <DateFilterComponent />
            <StatefulButton
              onClick={handleRefresh}
              className="w-auto shadow-sm shrink-0"
            >
              Refresh
            </StatefulButton>
          </div>
        </div>
      </div>

      <DateRangeDisplay />

      {/* KPI Cards - Compact horizontal layout */}
      <div className="flex flex-wrap gap-2">
        <Card className="px-3 py-2 flex-1 min-w-[120px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Revenue</p>
              <p className="text-sm font-bold">₹{totalRevenue}</p>
            </div>
          </div>
        </Card>

        <Card className="px-3 py-2 flex-1 min-w-[100px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Orders</p>
              <p className="text-sm font-bold">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="px-3 py-2 flex-1 min-w-[100px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg Value</p>
              <p className="text-sm font-bold">₹{avgOrderValue.toFixed(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="p-4 max-[500px]:p-2 flex flex-col h-[calc(100vh-19rem)]">
        <h2 className="text-lg font-semibold mb-4">Order History</h2>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {data?.orders &&
            data?.orders.map((order) => (
              <div
                key={order.cart_id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium max-[500px]:text-sm">
                      Order #{order.cart_id.slice(-8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(order.created_at),
                        'MMM dd, yyyy hh:mm a',
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {order.total_discount > 0 ? (
                        <>₹{order.order_total - order.total_discount}</>
                      ) : (
                        <>₹{order.order_total}</>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {order.order_status === 'settled'
                        ? 'Completed'
                        : order.order_status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={order.customer_profile_pic || undefined}
                    />
                    <AvatarFallback>
                      {order.customer_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {parseOrderItems(order.items).map(
                    (item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.item_name}
                        </span>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                    ),
                  )}
                </div>

                {order.total_discount > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount</span>
                      <span>-₹{order.total_discount}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Page {data.pagination.current_page} of{' '}
              {data.pagination.total_pages}
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev_page}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next_page}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
