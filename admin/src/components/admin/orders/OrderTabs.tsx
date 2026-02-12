import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { PendingOrderCard } from './order-states/PendingOrderCard'
import { ProcessingOrderCard } from './order-states/ProcessingOrderCard'
import { ReadyOrderCard } from './order-states/ReadyOrderCard'
import { DeliveredOrderCard } from './order-states/DeliveredOrderCard'
import { CancelledOrderCard } from './order-states/CancelledOrderCard'
import { useSoundContext } from '@/context/SoundContext'

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

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative mb-6">
        <TabsList className="flex w-full items-center justify-start h-auto p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-x-auto no-scrollbar scroll-smooth">
          <TabsTrigger
            value="pending"
            className="shrink-0 min-w-max px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg gap-2"
          >
            <span>Pending</span>
            {pendingOrders.length > 0 && (
              <span className="bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border border-amber-200">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="preparing"
            className="shrink-0 min-w-max px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg gap-2"
          >
            <span>Preparing</span>
            {processingOrders.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border border-orange-200">
                {processingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="shrink-0 min-w-max px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg gap-2"
          >
            <span>Ready</span>
            {readyOrders.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border border-blue-200">
                {readyOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="shrink-0 min-w-max px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg gap-2"
          >
            <span>Delivered</span>
            {deliveredOrders.length > 0 && (
              <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border border-emerald-200">
                {deliveredOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="shrink-0 min-w-max px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg gap-2"
          >
            <span>Cancelled</span>
            {cancelledOrders.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center border border-rose-200">
                {cancelledOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Pending Orders Tab */}
      <TabsContent value="pending" className="space-y-4">
        {pendingOrders.length === 0 ? (
          <div className="text-center py-8">
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
          <div className="text-center py-8">
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
          <div className="text-center py-8">
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
      <TabsContent value="delivered" className="space-y-4">
        {deliveredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No delivered orders</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed orders will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map((order) => (
              <DeliveredOrderCard
                key={`delivered-${order.customer_id}-${order.created_at}`}
                order={order}
                onCall={() => handleCall(order)}
                showCallButton={false}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Cancelled Orders Tab */}
      <TabsContent value="cancelled" className="space-y-4">
        {cancelledOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No cancelled orders</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rejected orders will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cancelledOrders.map((order) => (
              <CancelledOrderCard
                key={`cancelled-${order.customer_id}-${order.created_at}`}
                order={order}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
