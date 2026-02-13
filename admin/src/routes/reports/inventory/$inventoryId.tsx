import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useInventoryItemStats } from '@/hooks/queries/useInventoryQueries'
import LoadingScreen from '@/components/common/LoadingScreen'
import {
  ArrowLeft,
  Box,
  DollarSign,
  Calendar,
  Package,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { convertToIST } from '@/components/admin/order-history/utils/historyDateUtils'
import { QuickRestockButton } from '@/components/admin/inventory/QuickRestockButton'

import { Skeleton } from '@/components/ui/skeleton'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/reports/inventory/$inventoryId')({
  beforeLoad: requireAuth,
  component: InventoryItemDetailPage,
})

function InventoryItemDetailPage() {
  const { inventoryId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { user } = useAdminAuthQuery()
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useInventoryItemStats(
    inventoryId,
    user?.selected_rid ? String(user.selected_rid) : undefined,
    page,
    limit,
  )
  if (isLoading) {
    if (!user?.selected_rid) {
      return <LoadingScreen message="Loading item details..." />
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32 sm:w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 sm:self-end" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow border-gray-200/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3 pb-1">
                <Skeleton className="h-3 w-16 sm:w-20" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-24 mb-1" />
                <Skeleton className="h-2 w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Item Details Skeleton */}
          <Card className="lg:col-span-1 h-fit shadow border-gray-200/60">
            <CardHeader className="p-3 sm:p-4 py-2 sm:py-3 border-b">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders Skeleton */}
          <Card className="lg:col-span-2 h-full shadow border-gray-200/60">
            <CardHeader className="p-3 sm:p-4 py-2 sm:py-3 border-b">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                <div className="hidden sm:flex p-2 border-b bg-gray-50/50 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-2 sm:px-4 flex flex-col sm:flex-row gap-2 sm:gap-4 border-b last:border-0 sm:h-10 sm:items-center"
                  >
                    <div className="flex justify-between sm:contents">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12 sm:hidden" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-32 sm:w-24" />
                      <Skeleton className="h-2 w-20 sm:w-16" />
                    </div>
                    <div className="flex justify-between sm:contents">
                      <Skeleton className="h-3 w-24 sm:w-20" />
                      <Skeleton className="h-3 w-12 sm:w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-red-500 font-medium">Failed to load item details</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/reports/inventory' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
        </Button>
      </div>
    )
  }

  const { performance, recentOrders } = data

  const getStockLevel = (stock: number) => {
    if (stock === 0) return 'critical'
    if (stock < 10) return 'low'
    if (stock < 50) return 'medium'
    return 'good'
  }

  const stockLevel = getStockLevel(data.stock)

  return (
    <div className="space-y-3 sm:space-y-4 p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/reports/inventory' })}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-white bg-white shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {data.name}
              </h1>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium border ${
                  stockLevel === 'critical'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : stockLevel === 'low'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                {data.status}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">
              {data.category} • ID: #{data.id}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center">
          <QuickRestockButton
            inventoryId={data.id}
            rid={Number(user?.selected_rid)}
            currentStock={data.stock}
            itemName={data.name}
            onStockUpdate={() => {}}
            className="w-full sm:w-auto h-8 text-xs"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          {
            label: 'Total Revenue',
            value: `₹${performance.revenue.toLocaleString()}`,
            sub: 'Lifetime earnings',
            icon: <DollarSign className="h-3 w-3 text-green-600" />,
          },
          {
            label: 'Units Sold',
            value: performance.unitsSold,
            sub: 'Total items sold',
            icon: <Package className="h-3 w-3 text-blue-600" />,
          },
          {
            label: 'Total Orders',
            value: performance.totalOrders,
            sub: 'Distinct orders',
            icon: <Activity className="h-3 w-3 text-orange-600" />,
          },
          {
            label: 'Last Ordered',
            value: performance.lastOrdered
              ? convertToIST(performance.lastOrdered)
              : 'Never',
            sub:
              performance.daysSinceLastOrder > 0
                ? `${performance.daysSinceLastOrder} days ago`
                : performance.lastOrdered
                  ? 'Today'
                  : 'No activity',
            icon: <Calendar className="h-3 w-3 text-gray-600" />,
            isDate: true,
          },
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden shadow border-gray-200/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3 pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="p-2 sm:p-3 pt-0">
              <div
                className={`font-bold truncate ${stat.isDate ? 'text-[11px] sm:text-sm' : 'text-lg sm:text-xl'}`}
              >
                {stat.value}
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Item Details */}
        <Card className="lg:col-span-1 h-fit shadow border-gray-200/60">
          <CardHeader className="p-3 sm:p-4 py-2 sm:py-3 border-b">
            <CardTitle className="text-xs sm:text-sm">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex sm:block gap-3">
              <div className="aspect-square w-24 sm:w-full shrink-0 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100">
                {data.images && data.images.length > 0 ? (
                  <img
                    src={data.images[0]}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <Box className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center sm:block sm:mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-[10px] sm:text-xs">
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-semibold text-xs sm:text-sm">
                      ₹{data.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock</p>
                    <p
                      className={`font-semibold text-xs sm:text-sm ${data.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}
                    >
                      {data.stock} units
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-1">
                    Description
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {data.description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:hidden border-t pt-2">
              <p className="text-gray-500 text-[10px] mb-0.5">Description</p>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {data.description || 'No description available.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden shadow border-gray-200/60">
          <CardHeader className="p-3 sm:p-4 py-2 sm:py-3 border-b">
            <CardTitle className="text-xs sm:text-sm">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 h-9">
                    <TableHead className="h-9 text-xs">Order ID</TableHead>
                    <TableHead className="h-9 text-xs">Customer</TableHead>
                    <TableHead className="h-9 text-xs">Date</TableHead>
                    <TableHead className="h-9 text-xs text-right">
                      Qty
                    </TableHead>
                    <TableHead className="h-9 text-xs text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-gray-500 text-sm"
                      >
                        No orders found for this item.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order.id} className="h-10">
                        <TableCell className="py-2 text-xs font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {order.customer.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.customer.phone || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-gray-500">
                          {convertToIST(order.date)}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-right font-medium">
                          {order.quantity}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-right">
                          <div className="font-medium">₹{order.amount}</div>
                          {order.discount > 0 && (
                            <div className="text-[10px] text-red-500">
                              -₹{order.discount.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List View */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No orders found for this item.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          #{order.id}
                        </span>
                        <div className="mt-1 font-medium text-xs text-gray-900">
                          {order.customer.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-gray-900">
                          ₹{order.amount}
                        </div>
                        {order.discount > 0 && (
                          <div className="text-[9px] text-red-500">
                            -₹{order.discount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-gray-500">
                      <div>{convertToIST(order.date)}</div>
                      <div className="font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                        Qty: {order.quantity}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          {/* Pagination */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t">
            <div className="text-[10px] sm:text-xs text-gray-500">
              Page {data.pagination?.page || 1} of{' '}
              {data.pagination?.totalPages || 1}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <span className="sr-only">Previous Page</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  page >= (data.pagination?.totalPages || 1) || isLoading
                }
              >
                <span className="sr-only">Next Page</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
