import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { PrepTimeSelector } from '../order-ui-card/PrepTimeSelector'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { CountdownDisplay } from '../countdown'
import { OrderTaxBreakdown } from '@/components/common/OrderTaxBreakdown'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

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

  // Calculate final amount with tax
  const { grandTotal, isLoading: isTaxLoading } = useOrderTaxCalculation({
    subtotal: order.total_amount,
    discountAmount: order.discount_amount
      ? parseFloat(String(order.discount_amount))
      : 0,
  })

  const handleAccept = () => {
    onAccept(order, prepTime)
  }

  const handlePrepTimeChange = (newTime: number) => {
    setPrepTime(Math.max(5, newTime))
  }

  const statusBadge = (
    <Badge
      variant="secondary"
      className="bg-yellow-100/80 text-yellow-800 font-semibold text-[10px] md:text-xs px-2 py-0.5 rounded-md border border-yellow-200/50 flex items-center gap-1 h-5 md:h-6"
    >
      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
      PENDING
    </Badge>
  )

  return (
    <Card className="w-full shadow-md border-l-4 border-l-yellow-400 hover:shadow-lg transition-shadow ">
      <CardContent className="p-3 md:p-4 space-y-3">
        {/* Compact Header with Print Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CompactOrderHeader
              order={order}
              statusBadge={statusBadge}
              finalAmount={isTaxLoading ? order.total_amount : grandTotal}
            />
          </div>
        </div>

        {/* Special Instructions - Compact (Mobile Only) */}

        {/* Mobile Accordion for Details */}
        <MobileOrderAccordion order={order} showSpecialInstructions={false} />

        {/* Desktop View - Compact Items List */}
        <div className="hidden md:block">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-[500] text-xs md:text-sm text-gray-700 uppercase tracking-tight">
                Order Items ({order.items.length})
              </h4>
              <span className="text-xs md:text-sm font-semibold text-gray-900">
                ₹{(isTaxLoading ? order.total_amount : grandTotal).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm md:text-base"
                >
                  <span className="flex-1 truncate font-[500] text-gray-800">
                    <span className="text-gray-400 font-[500] mr-1.5">
                      {item.quantity}x
                    </span>{' '}
                    {item.display_name}
                  </span>
                  <span className="font-semibold text-gray-900 ml-2">
                    ₹{item.total_amount}
                  </span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-[11px] md:text-xs text-gray-500 font-semibold pt-1">
                  +{order.items.length - 3} more items...
                </p>
              )}
            </div>
            {/* Bill Summary */}
            <div className="mt-2 pt-2 border-t space-y-1">
              {order.discount_amount &&
                parseFloat(String(order.discount_amount)) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>
                      -₹{parseFloat(String(order.discount_amount)).toFixed(2)}
                    </span>
                  </div>
                )}
              <OrderTaxBreakdown
                totalAmount={order.total_amount}
                showDetails={true}
                isPreTax={true}
                discountAmount={
                  order.discount_amount
                    ? parseFloat(String(order.discount_amount))
                    : 0
                }
              />
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

        {/* Action Buttons - Touch Optimized */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-10 text-xs md:text-sm font-semibold border-gray-200 hover:bg-gray-50 rounded-xl"
            onClick={() => onReject(order)}
            disabled={isRejectingOrder}
          >
            Reject
          </Button>
          <Button
            className="flex-2 h-10 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm shadow-green-100"
            onClick={handleAccept}
            disabled={isAcceptingOrder}
          >
            <CountdownDisplay
              orderTime={order.created_at}
              onExpired={() => onReject(order)}
              renderAs="button"
              buttonText="Accept Order"
              className="text-sm md:text-base font-semibold uppercase tracking-wide"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
