import { useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import {
  useInventoryItemStats,
  useInfiniteInventoryItemOrdersQuery,
} from '@/hooks/queries/useInventoryQueries'
import { useLoadMore } from '@/hooks/useLoadMore' 
import {
  ArrowLeft,
  Box,
  DollarSign,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Receipt,
  MoreVertical,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { QuickRestockButton } from '@/components/admin/inventory/QuickRestockButton'

import { requireAuth } from '@/middleware/auth'
import { LoadingOverlay } from '@/components/smallComponents/LoadingOverlay'

export const Route = createFileRoute('/reports/inventory/$inventoryId')({
  beforeLoad: requireAuth,
  component: InventoryItemDetailPage,
})

function InventoryItemDetailPage() {
  const { inventoryId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid ? String(user.selected_rid) : undefined

  // Fixed stats and basic info
  const { data, isLoading, error } = useInventoryItemStats(inventoryId, rid)

  // Infinite orders
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteInventoryItemOrdersQuery(inventoryId, rid, 12)

  // Flatten orders from infinite pages
  const allOrders = useMemo(() => {
    return infiniteData?.pages.flatMap((page) => page.recentOrders) || []
  }, [infiniteData])

  // Progressive rendering hook
  const { visibleItems, hasMore, sentinelRef } = useLoadMore(allOrders, 12)

  // Sync server-side loading with local progressive rendering
  useEffect(() => {
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

  if (isLoading) {
    if (!user?.selected_rid) {
      return <LoadingOverlay
        isVisible={true}
        message="Loading item details" 
      /> 
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-white min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* KPI Strip Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-3 w-8 rounded-md" />
              </div>
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex gap-4 items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-2 ml-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 bg-white min-h-screen">
      {/* Top Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-6 border-b border-gray-100/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/reports/inventory' })}
            className="h-9 w-9 shrink-0 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="h-16 w-24 sm:h-20 sm:w-32 shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm">
              {data.images && data.images.length > 0 ? (
                <img
                  src={data.images[0]}
                  alt={data.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-200">
                  <Box className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-sm sm:text-lg font-[550] text-gray-900  ">
                  {data.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                    stockLevel === 'critical'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : stockLevel === 'low'
                        ? 'bg-orange-50 text-orange-600 border-orange-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}
                >
                  {data.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <span className="bg-gray-100/80 px-2 py-0.5 rounded text-[10px] text-gray-500 border border-gray-200/50">
                  SKU: {data.id}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-blue-600 font-bold">{data.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <QuickRestockButton
            inventoryId={data.id}
            rid={Number(user?.selected_rid)}
            currentStock={data.stock}
            itemName={data.name}
            onStockUpdate={() => {}}
            className="h-9 px-4 text-xs font-bold rounded-lg shadow-xs hover:shadow-md transition-all"
          />
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg border border-gray-100 hover:bg-gray-50"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </Button> */}
        </div>
      </div>

      {/* Compact KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `₹${performance.revenue}`,
            icon: <DollarSign className="w-3.5 h-3.5" />,
            trend: '+8.4%',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
          },
          {
            label: 'Lifetime Sold',
            value: performance.unitsSold,
            icon: <ShoppingBag className="w-3.5 h-3.5" />,
            trend: 'Units',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            label: 'Total Orders',
            value: performance.totalOrders,
            icon: <TrendingUp className="w-3.5 h-3.5" />,
            trend: 'Direct',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
          },
          {
            label: 'Current Stock',
            value: data.stock,
            icon: <Box className="w-3.5 h-3.5" />,
            trend: 'Live',
            color: data.stock < 10 ? 'text-red-600' : 'text-emerald-600',
            bgColor: data.stock < 10 ? 'bg-red-50' : 'bg-emerald-50',
            status: data.stock < 10 ? 'text-red-600' : 'text-emerald-600',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span
                  className={`p-1 ${stat.bgColor} rounded-lg ${stat.color} shadow-sm`}
                >
                  {stat.icon}
                </span>
                {stat.label}
              </span>
              <span className="text-[8px] font-extrabold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                {stat.trend}
              </span>
            </div>
            <div
              className={`text-md pl-5 font-black tracking-tight ${stat.status || 'text-gray-900'}`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Transactional Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {allOrders.length} Events Total
          </span>
        </div>

        <div className="min-h-[400px]">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-40">
              <Receipt className="w-10 h-10 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No activity log found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-gray-50/20 border-gray-100">
                  <TableHead className="py-4 h-auto text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 px-6">
                    ID
                  </TableHead>
                  <TableHead className="py-4 h-auto text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                    Customer & Date
                  </TableHead>
                  <TableHead className="py-4 h-auto text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 text-center">
                    Status
                  </TableHead>
                  <TableHead className="py-4 h-auto text-center text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                    Sold
                  </TableHead>
                  <TableHead className="py-4 h-auto text-right text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 px-6">
                    Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((order) => (
                  <TableRow
                    key={order.id}
                    className="group border-gray-50 hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <TableCell className="py-5 px-6">
                      <span className="text-xs font-bold text-gray-400">
                        #{order.id.toString().slice(-3)}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-[500] text-gray-900 group-hover:text-blue-600 transition-colors">
                          {order.customer.name}
                        </span>
                        <span className="text-[12px] text-gray-400 font-semibold uppercase tracking-tight mt-0.5">
                          {new Date(order.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {' • '}
                          {new Date(order.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Sale
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-5">
                      <span className="text-[13px] font-bold text-gray-900">
                        {order.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-5 px-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-black text-gray-900">
                          ₹{order.amount?.toFixed(2)}
                        </span>
                        {order.discount > 0 && (
                          <span className="text-[10px] text-emerald-500 font-semibold tracking-tight">
                            -₹{order.discount?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Table Footer / Sentinel */}
          {(hasNextPage || hasMore) && (
            <div
              ref={sentinelRef}
              className="py-12 border-t border-gray-50 flex flex-col items-center justify-center bg-gray-50/20"
            >
              <div className="flex items-center gap-1 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
              </div>
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                Scanning Ledger
              </span>
            </div>
          )}

          {!hasNextPage && !hasMore && allOrders.length > 0 && (
            <div className="py-8 text-center border-t border-gray-50 bg-gray-50/10">
              <span className="text-[9px] font-bold text-gray-200 uppercase tracking-[0.4em]">
                intelligence feed complete
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
