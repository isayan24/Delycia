import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Printer } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { PendingOrderCard } from './order-states/PendingOrderCard'
import { ProcessingOrderCard } from './order-states/ProcessingOrderCard'
import { ReadyOrderCard } from './order-states/ReadyOrderCard'
import { DeliveredOrderCard } from './order-states/DeliveredOrderCard'
import { useSoundContext } from '@/context/SoundContext'
import ThermalBill from '@/components/admin/order-history/ThermalBill'
import {
  orderToBillData,
  handleShareToMobile,
} from '@/components/admin/order-history/thermalBillUtils'

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
  handleViewTimeline: (order: ProcessedOrder) => void
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
  handleViewTimeline,
  handleExtendTime,
  isAcceptingOrder,
  isRejectingOrder,
  isMarkingReady,
  isMarkDelivered,
}: OrderTabsProps) {
  const { isSoundEnabled, toggleSound } = useSoundContext()
  const [cancelledBillOpen, setCancelledBillOpen] = useState<string | null>(
    null,
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full overflow-auto"
    >
      <TabsList className="grid w-full grid-cols-5 max-[500px]:grid-cols-3 max-[500px]:space-y-3">
        <TabsTrigger value="pending" className="relative">
          Pending
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
              {pendingOrders.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="preparing" className="relative">
          Preparing
          {processingOrders.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {processingOrders.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="ready" className="relative">
          Ready
          {readyOrders.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {readyOrders.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="delivered" className="relative">
          Delivered
          {deliveredOrders.length > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full px-2 py-0.5">
              {deliveredOrders.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="relative">
          Cancelled
          {cancelledOrders.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {cancelledOrders.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

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
                onCall={() => handleCall(order)}
                onViewTimeline={() => handleViewTimeline(order)}
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
                onCall={() => handleCall(order)}
                onViewTimeline={() => handleViewTimeline(order)}
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
                onViewTimeline={() => handleViewTimeline(order)}
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
              <div
                key={`cancelled-${order.customer_id}-${order.created_at}`}
                className="p-4 border rounded-lg bg-red-50"
              >
                {/* Thermal Bill Popup for this cancelled order */}
                <ThermalBill
                  isOpen={
                    cancelledBillOpen ===
                    `${order.customer_id}-${order.created_at}`
                  }
                  onClose={() => setCancelledBillOpen(null)}
                  billData={orderToBillData(order)}
                  showPrintButton={true}
                  showDownloadButton={true}
                  showShareButton={true}
                  onShareToMobile={handleShareToMobile}
                />

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-red-800">
                      Order Cancelled
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customer_name} | Total: ₹
                      {order.discount_amount && order.discount_amount > 0 ? (
                        <span>
                          {order.total_amount - order.discount_amount}
                        </span>
                      ) : (
                        order.total_amount
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCancelledBillOpen(
                          `${order.customer_id}-${order.created_at}`,
                        )
                      }
                      className="h-8 w-8 p-0"
                      title="Print Bill"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      ❌ Cancelled
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between">
                        <span>
                          {item.quantity}x {item.display_name}
                        </span>
                      </div>
                      {item.addons && item.addons.length > 0 && (
                        <div className="ml-4 flex flex-col gap-0 text-xs text-gray-500">
                          {item.addons.map((addon, aIndex) => (
                            <span key={aIndex}>
                              + {addon.quantity} x {addon.name}: ₹{addon.price}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
