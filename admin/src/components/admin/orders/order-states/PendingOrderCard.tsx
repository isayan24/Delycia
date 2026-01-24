import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { PrepTimeSelector } from '../order-ui-card/PrepTimeSelector'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { CountdownDisplay } from '../countdown'

interface PendingOrderCardProps {
  order: ProcessedOrder
  onAccept: (order: ProcessedOrder, prepTime: number) => void
  onReject: (order: ProcessedOrder) => void
  isAcceptingOrder: boolean
  isRejectingOrder: boolean
}

export function PendingOrderCard({
  order,
  onAccept,
  onReject,
  isAcceptingOrder,
  isRejectingOrder,
}: PendingOrderCardProps) {
  const [prepTime, setPrepTime] = useState(30)

  const handleAccept = () => {
    onAccept(order, prepTime)
  }

  const handlePrepTimeChange = (newTime: number) => {
    setPrepTime(Math.max(5, newTime))
  }

  const handleCall = (customerId: number) => {}

  const handleViewTimeline = (customerId: number) => {}

  // Order expiration is now handled by CountdownDisplay component

  const hasSpecialInstructions = order.items.some(
    (item) =>
      item.special_instructions && item.special_instructions.trim() !== '',
  )

  const statusBadge = (
    <Badge
      variant="secondary"
      className="bg-yellow-100 text-yellow-800 font-medium"
    >
      ⏳ PENDING
    </Badge>
  )

  return (
    <Card className="w-full shadow-md border-l-4 border-l-yellow-400 hover:shadow-lg transition-shadow ">
      <CardContent className="p-3 md:p-4 space-y-3">
        {/* Compact Header */}
        <CompactOrderHeader
          order={order}
          statusBadge={statusBadge}
          onCall={handleCall}
          onViewTimeline={handleViewTimeline}
          showCallButton={false}
        />

        {/* Special Instructions - Compact (Mobile Only) */}
        <div className="max-[768px]:hidden">
          {hasSpecialInstructions &&
            order.items.some(
              (item) =>
                item.special_instructions &&
                item.special_instructions.trim() !== '',
            ) && (
              <div className="bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg ">
                <div className="flex items-center gap-2 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">
                    Special Instructions: {order.items[0]?.special_instructions}
                  </span>
                </div>
              </div>
            )}
        </div>

        {/* Mobile Accordion for Details */}
        <MobileOrderAccordion order={order} showSpecialInstructions={true} />

        {/* Desktop View - Compact Items List */}
        <div className="hidden md:block">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">
                Order Items ({order.items.length})
              </h4>
              <span className="text-sm font-semibold">
                ₹{order.total_amount}
              </span>
            </div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="flex-1 truncate">
                    {item.quantity}x {item.display_name}
                  </span>
                  <span className="font-medium">₹{item.total_amount}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-600 font-medium">
                  +{order.items.length - 3} more items...
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t">
              <div
                className={`w-2 h-2 rounded-full ${order.payment_status.toLowerCase() === 'paid' ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span
                className={
                  order.payment_status.toLowerCase() === 'paid'
                    ? 'text-green-700'
                    : 'text-red-700'
                }
              >
                {order.payment_status.toLowerCase() === 'paid'
                  ? 'Paid'
                  : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Prep Time Selector */}
        <div className="bg-green-50 p-3 rounded-lg">
          <PrepTimeSelector
            prepTime={prepTime}
            onPrepTimeChange={handlePrepTimeChange}
          />
        </div>

        {/* fix Action Buttons - Touch Optimized */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:text-red-600 hover:bg-red-50 min-h-[44px] text-md max-[700px]:text-sm"
            onClick={() => onReject(order)}
            disabled={isRejectingOrder}
          >
            Reject
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-[44px] text-md max-[700px]:text-sm"
            onClick={handleAccept}
            disabled={isAcceptingOrder}
          >
            <CountdownDisplay
              orderTime={order.created_at}
              onExpired={() => onReject(order)}
              renderAs="button"
              buttonText="Accept Order"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
