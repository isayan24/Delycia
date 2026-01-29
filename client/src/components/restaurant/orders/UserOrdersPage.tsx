'use client'
import { useMemo } from 'react'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tabs } from '@/components/ui/tabs'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { Loader2, RefreshCw, Play, Pause } from 'lucide-react'
import UserOrdersList from '@/components/restaurant/orders/UserOrdersList'
import { Button } from '@/components/ui/button'
import { useOrdersQuery } from '@/hooks/queries/useOrdersQuery'
import { useRestaurantId } from '@/hooks/useRestaurantId'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import { Order } from '@/types/Order'
import {
  groupOrdersByCartId,
  getOrderCountByStatus,
} from '@/helpers/orderGroupingUtils'

export default function UserOrdersPage() {
  const { user, isAuthenticated } = useAuthQuery()
  const rid = useRestaurantId()
  const { openLoginDialog } = useLoginDialogStore()

  // Use the updated hook with RID filtering and auto-refresh
  const {
    orders,
    allOrders,
    status,
    isLoading,
    refreshOrders,
    toggleAutoRefresh,
    isAutoRefreshActive,
  } = useOrdersQuery({
    customerId: user?.id,
    rid,
    autoRefreshInterval: 20000,
    enableAutoRefresh: true,
  })

  const handleSignInClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!user) {
      openLoginDialog()
    }
  }

  // Group orders by cart_id using memoization
  const groupedOrders = useMemo(() => {
    return groupOrdersByCartId(orders)
  }, [orders])

  // Calculate group counts by status for tabs
  const tabCounts = useMemo(() => {
    return {
      all: groupedOrders.length,
      pending: getOrderCountByStatus(groupedOrders, 'pending'),
      processing: getOrderCountByStatus(groupedOrders, 'processing'),
      ready: getOrderCountByStatus(groupedOrders, 'ready'),
      completed: getOrderCountByStatus(groupedOrders, 'completed'),
      cancelled: getOrderCountByStatus(groupedOrders, 'cancelled'),
    }
  }, [groupedOrders])

  // Filter orders by status for each tab (with proper typing)
  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) => order.order_status.toLowerCase() === 'pending',
      ),
    [orders],
  )

  const processingOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) => order.order_status.toLowerCase() === 'processing',
      ),
    [orders],
  )

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) => order.order_status.toLowerCase() === 'completed',
      ),
    [orders],
  )

  const readyOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) => order.order_status.toLowerCase() === 'ready',
      ),
    [orders],
  )

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) => order.order_status.toLowerCase() === 'cancelled',
      ),
    [orders],
  )

  // If loading
  if (isLoading) {
    return (
      <div className="my-10 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-btnColor" />
        <p>{status || 'Loading your orders...'}</p>
      </div>
    )
  } else if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 mx-auto max-w-md text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
          Sign in to view your orders
        </h2>
        <p className="text-gray-500 mb-8">
          Track your orders, view history, and more
        </p>
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-btnColor hover:bg-btnColorHover active:bg-btnColorActive"
            onClick={handleSignInClick}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // No orders found for this user
  if (!isLoading && orders.length === 0) {
    return (
      <div className="my-10 text-center p-8 bg-gray-50 rounded-lg max-w-[60rem] mx-auto">
        <p className="text-gray-500">
          {rid
            ? `You don't have any orders for this restaurant yet`
            : `You don't have any orders yet`}
        </p>
        {rid && allOrders.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            You have {allOrders.length} orders total from other restaurants
          </p>
        )}
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex justify-center w-full  rounded-b-3xl mt-6 left-0 z-[30] max-[700px]:top-[28px]">
        <TabsList className="my-2 rounded-full max-[700px]:w-full max-[700px]:rounded-none max-[700px]:bg-[#ffffffd6] backdrop-blur-sm max-[700px]:justify-start">
          <TabsTrigger value="all" className="rounded-full">
            All ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-full">
            Pending ({tabCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing" className="rounded-full">
            Processing ({tabCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="ready" className="rounded-full">
            Ready ({tabCounts.ready})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-full">
            Completed ({tabCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-full">
            Cancelled ({tabCounts.cancelled})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 items-center justify-between mt-5 mb-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            onClick={() => refreshOrders()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Orders
          </Button>

          <Button
            onClick={toggleAutoRefresh}
            variant="outline"
            className={`flex items-center gap-2 ${
              isAutoRefreshActive
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50'
            }`}
          >
            {isAutoRefreshActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Auto-refresh
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Enable Auto-refresh
              </>
            )}
          </Button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {isAutoRefreshActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refreshing every 20s</span>
            </div>
          )}
        </div>
      </div>

      <TabsContent value="all" className="mt-4">
        <UserOrdersList orders={orders} />
      </TabsContent>

      <TabsContent value="pending">
        <UserOrdersList orders={pendingOrders} />
      </TabsContent>

      <TabsContent value="processing">
        <UserOrdersList orders={processingOrders} />
      </TabsContent>

      <TabsContent value="ready">
        <UserOrdersList orders={readyOrders} />
      </TabsContent>

      <TabsContent value="completed">
        <UserOrdersList orders={completedOrders} />
      </TabsContent>

      <TabsContent value="cancelled">
        <UserOrdersList orders={cancelledOrders} />
      </TabsContent>
    </Tabs>
  )
}
