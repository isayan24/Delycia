import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { PendingOrderCard } from './order-states/PendingOrderCard'
import { ProcessingOrderCard } from './order-states/ProcessingOrderCard'
import { ReadyOrderCard } from './order-states/ReadyOrderCard'
import { DeliveredOrderCard } from './order-states/DeliveredOrderCard'
import { CancelledOrderCard } from './order-states/CancelledOrderCard'
import { useSoundContext } from '@/context/SoundContext'
import { useLoadMore } from '@/hooks/useLoadMore'

interface OrderTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  pendingOrders: ProcessedOrder[]
  processingOrders: ProcessedOrder[]
  readyOrders: ProcessedOrder[]
  deliveredOrders: ProcessedOrder[]
  cancelledOrders: ProcessedOrder[]
  // Handler functions
  handleAcceptOrder: (order: ProcessedOrder, prepTime: number) => void
  handleRejectOrder: (order: ProcessedOrder) => void
  handleMarkReady: (order: ProcessedOrder) => void
  handleMarkDelivered: (order: ProcessedOrder) => void
  handleCall: (order: ProcessedOrder) => void
  handleExtendTime: (order: ProcessedOrder, additionalMinutes: number) => void
  // Transition states
  isAcceptingOrder: boolean
  isRejectingOrder: boolean
  isMarkingReady: boolean
  isMarkDelivered: boolean
}

export default function OrderTabs({
  activeTab,
  onTabChange,
  pendingOrders,
  processingOrders,
  readyOrders,
  deliveredOrders,
  cancelledOrders,
  handleAcceptOrder,
  handleRejectOrder,
  handleMarkReady,
  handleMarkDelivered,
  handleCall,
  handleExtendTime,
  isAcceptingOrder,
  isRejectingOrder,
  isMarkingReady,
  isMarkDelivered,
}: OrderTabsProps) {
  const { isSoundEnabled, toggleSound } = useSoundContext()

  // Progressive rendering for large lists (delivered & cancelled)
  const {
    visibleItems: visibleDelivered,
    hasMore: hasMoreDelivered,
    sentinelRef: deliveredSentinelRef,
  } = useLoadMore(deliveredOrders, 10)

  const {
    visibleItems: visibleCancelled,
    hasMore: hasMoreCancelled,
    sentinelRef: cancelledSentinelRef,
  } = useLoadMore(cancelledOrders, 10)

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative mb-4">
        <TabsList className="flex w-full items-center justify-start h-auto p-1.5 bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 overflow-x-auto no-scrollbar scroll-smooth transition-all shadow-sm">
          <TabsTrigger
            value="pending"
            className="shrink-0 min-w-max px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-sm font-bold transition-all data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-900/20 data-[state=active]:text-orange-600 data-[state=active]:shadow-none rounded-lg gap-2 md:gap-3 text-[#a16b45] hover:text-orange-600"
          >
            <span>Pending</span>
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border-none shadow-sm">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="preparing"
            className="shrink-0 min-w-max px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-sm font-bold transition-all data-[state=active]:bg-yellow-50 dark:data-[state=active]:bg-yellow-900/20 data-[state=active]:text-yellow-600 data-[state=active]:shadow-none rounded-lg gap-2 md:gap-3 text-[#a16b45] hover:text-yellow-600"
          >
            <span>Preparing</span>
            {processingOrders.length > 0 && (
              <span className="bg-yellow-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border-none shadow-sm">
                {processingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="shrink-0 min-w-max px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-sm font-bold transition-all data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-lg gap-2 md:gap-3 text-[#a16b45] hover:text-blue-600"
          >
            <span>Ready</span>
            {readyOrders.length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border-none shadow-sm">
                {readyOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="shrink-0 min-w-max px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-sm font-bold transition-all data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/20 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none rounded-lg gap-2 md:gap-3 text-[#a16b45] hover:text-emerald-600"
          >
            <span>Delivered</span>
            {deliveredOrders.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border-none shadow-sm">
                {deliveredOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="shrink-0 min-w-max px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-sm font-bold transition-all data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-900/20 data-[state=active]:text-red-600 data-[state=active]:shadow-none rounded-lg gap-2 md:gap-3 text-[#a16b45] hover:text-red-600"
          >
            <span>Cancelled</span>
            {cancelledOrders.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border-none shadow-sm">
                {cancelledOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Pending Orders Tab */}
      <TabsContent value="pending" className="space-y-4">
        {pendingOrders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No pending orders</p>
            <p className="text-sm text-muted-foreground mt-1">
              New orders will appear here when they arrive
            </p>
          </div>
        ) : (
          <>
            {/* Pending Orders Header with Mute Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Pending Orders ({pendingOrders.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSound}
                className="flex items-center gap-2"
              >
                {!isSoundEnabled ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isSoundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}
              </Button>
            </div>

            <div className="grid gap-4 ">
              {pendingOrders.map((order) => (
                <PendingOrderCard
                  key={`pending-${order.customer_id}-${order.created_at}`}
                  order={order}
                  onAccept={handleAcceptOrder}
                  onReject={handleRejectOrder}
                  isAcceptingOrder={isAcceptingOrder}
                  isRejectingOrder={isRejectingOrder}
                />
              ))}
            </div>
          </>
        )}
      </TabsContent>

      {/* Preparing Orders Tab */}
      <TabsContent value="preparing" className="space-y-4">
        {processingOrders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No orders being prepared</p>
            <p className="text-sm text-muted-foreground mt-1">
              Accepted orders will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {processingOrders.map((order) => (
              <ProcessingOrderCard
                key={`processing-${order.customer_id}-${order.created_at}-${order.preparation_time}-${order.time_extended || 0}`}
                order={order}
                onMarkReady={() => handleMarkReady(order)}
                onExtendTime={handleExtendTime}
                isMarkingReadyTransition={isMarkingReady}
                handleMarkDelivered={handleMarkDelivered}
                isMarkDelivered={isMarkDelivered}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Ready Orders Tab */}
      <TabsContent value="ready" className="space-y-4">
        {readyOrders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No orders ready for pickup</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ready orders will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {readyOrders.map((order) => (
              <ReadyOrderCard
                key={`ready-${order.customer_id}-${order.created_at}`}
                order={order}
                onMarkDelivered={() => handleMarkDelivered(order)}
                isMarkDelivered={isMarkDelivered}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Delivered Orders Tab */}
      <TabsContent value="delivered" className="space-y-4 ">
        {deliveredOrders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No delivered orders</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed orders will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleDelivered.map((order) => (
              <DeliveredOrderCard
                key={`delivered-${order.customer_id}-${order.created_at}`}
                order={order}
                onCall={() => handleCall(order)}
                showCallButton={false}
              />
            ))}
            {/* Sentinel for infinite scroll */}
            {hasMoreDelivered && (
              <div
                ref={deliveredSentinelRef}
                className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more orders...
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Cancelled Orders Tab */}
      <TabsContent value="cancelled" className="space-y-4">
        {cancelledOrders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No cancelled orders</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rejected orders will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleCancelled.map((order) => (
              <CancelledOrderCard
                key={`cancelled-${order.customer_id}-${order.created_at}`}
                order={order}
              />
            ))}
            {/* Sentinel for infinite scroll */}
            {hasMoreCancelled && (
              <div
                ref={cancelledSentinelRef}
                className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more orders...
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
