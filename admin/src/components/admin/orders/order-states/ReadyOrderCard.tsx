import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { calculateTimeElapsed } from '../utils/orderProcessing'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { useIsMobile } from '@/hooks/use-mobile'

interface ReadyOrderCardProps {
  order: ProcessedOrder
  onMarkDelivered: (order: ProcessedOrder) => void
  onCall: (customerId: number) => void
  onViewTimeline: (customerId: number) => void
  isMarkDelivered: boolean
}

export function ReadyOrderCard({
  order,
  onMarkDelivered,
  onCall,
  onViewTimeline,
  isMarkDelivered,
}: ReadyOrderCardProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const isMobile = useIsMobile()
  // Calculate time elapsed since order was placed using IST-aware function
  useEffect(() => {
    const updateElapsed = () => {
      const elapsed = calculateTimeElapsed(order.created_at)
      setTimeElapsed(elapsed)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [order.created_at])

  const statusBadge = (
    <Badge
      variant="secondary"
      className="bg-blue-100 text-blue-600 font-medium hover:!bg-blue-100"
    >
      ✅ READY
    </Badge>
  )

  return (
    <Card className="w-full shadow-md border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow">
      <CardContent className="p-3 md:p-4 space-y-3">
        {/* Compact Header with Print Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CompactOrderHeader
              order={order}
              statusBadge={statusBadge}
              onCall={onCall}
              onViewTimeline={onViewTimeline}
              showCallButton={true}
              timeElapsed={timeElapsed}
            />
          </div>
        </div>
        {!isMobile &&
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

        {/* Mobile Accordion for Details */}
        <MobileOrderAccordion order={order} showSpecialInstructions={true} />

        {/* Desktop View - Compact Items List */}
        <div className="hidden md:block">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">
                Order Items ({order.items.length})
              </h4>
              <div className="text-right">
                <span className="text-sm font-semibold">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex-1 truncate">
                      {item.quantity}x {item.display_name}
                    </span>
                    <span className="font-medium">₹{item.total_amount}</span>
                  </div>
                  {/* Render Addons */}
                  {item.addons && item.addons.length > 0 && (
                    <div className="ml-0 flex flex-col gap-0.5 mt-0.5 mb-1 pl-4">
                      {item.addons.map((addon: any, addonIndex: number) => (
                        <span
                          key={addonIndex}
                          className="text-xs text-gray-500 block"
                        >
                          + {addon.quantity} x {addon.name}: ₹{addon.price}
                        </span>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-600 font-medium">
                  +{order.items.length - 3} more items...
                </p>
              )}
            </div>
            {/* Bill Summary */}
            <div className="mt-2 pt-2 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              {order.discount_amount && parseFloat(String(order.discount_amount)) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-₹{parseFloat(String(order.discount_amount)).toFixed(2)}</span>
                </div>
              )}
              {order.tax_amount && parseFloat(String(order.tax_amount)) > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax ({order.tax_percent}%):</span>
                  <span>+₹{parseFloat(String(order.tax_amount)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                <span>Grand Total:</span>
                <span>
                  ₹{(
                    order.total_amount -
                    (parseFloat(String(order.discount_amount)) || 0) +
                    (parseFloat(String(order.tax_amount)) || 0)
                  ).toFixed(2)}
                </span>
              </div>
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

        {/* Mark as Delivered Button - Touch Optimized */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white min-h-[3rem] text-[1rem] max-[768px]:text-[.9rem]"
          onClick={() => onMarkDelivered(order)}
          disabled={isMarkDelivered}
        >
          Mark as Delivered
        </Button>
      </CardContent>
    </Card>
  )
}
