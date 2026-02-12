import { Fragment } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { useIsMobile } from '@/hooks/use-mobile'
import { OrderTaxBreakdown } from '@/components/common/OrderTaxBreakdown'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

interface ReadyOrderCardProps {
  order: ProcessedOrder
  onMarkDelivered: (order: ProcessedOrder) => void
  isMarkDelivered: boolean
}

export function ReadyOrderCard({
  order,
  onMarkDelivered,
  isMarkDelivered,
}: ReadyOrderCardProps) {
  const isMobile = useIsMobile()

  // Calculate final amount with tax
  const { grandTotal, isLoading: isTaxLoading } = useOrderTaxCalculation({
    subtotal: order.total_amount,
    discountAmount: order.discount_amount
      ? parseFloat(String(order.discount_amount))
      : 0,
  })

  const statusBadge = (
    <Badge
      variant="secondary"
      className="bg-blue-50/80 text-blue-600 font-semibold text-[10px] md:text-xs px-2 py-0.5 rounded-md border border-blue-200/50 flex items-center gap-1 h-5 md:h-6 active:scale-95 transition-transform"
    >
      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
      READY
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
              finalAmount={isTaxLoading ? order.total_amount : grandTotal}
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
                <span className="text-sm md:text-base font-semibold">
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
              <h4 className="font-semibold text-xs md:text-sm text-gray-700 uppercase tracking-tight">
                Order Items ({order.items.length})
              </h4>
              <div className="text-right">
                <span className="text-xs md:text-sm font-semibold text-gray-900">
                  ₹{(isTaxLoading ? order.total_amount : grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, index) => (
                <Fragment key={index}>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="flex-1 truncate font-semibold text-gray-800">
                      <span className="text-gray-400 font-semibold mr-1.5">
                        {item.quantity}x
                      </span>{' '}
                      {item.display_name}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      ₹{item.total_amount}
                    </span>
                  </div>
                  {/* Render Addons */}
                  {item.addons && item.addons.length > 0 && (
                    <div className="ml-5 flex flex-col gap-0.5 mt-0.5 mb-1">
                      {item.addons.map((addon: any, addonIndex: number) => (
                        <span
                          key={addonIndex}
                          className="text-[11px] md:text-xs text-gray-500 block leading-tight"
                        >
                          <span className="text-gray-300 mr-1">+</span>{' '}
                          {addon.quantity} x {addon.name}: ₹{addon.price}
                        </span>
                      ))}
                    </div>
                  )}
                </Fragment>
              ))}
              {order.items.length > 3 && (
                <p className="text-[11px] md:text-xs text-gray-500 font-semibold pt-1">
                  +{order.items.length - 3} more items...
                </p>
              )}
            </div>
            {/* Bill Summary */}
            <div className="mt-2 pt-2 border-t space-y-1">
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
            <div className="flex items-center gap-2 text-[11px] md:text-xs mt-2 pt-2 border-t border-gray-200/50">
              <div
                className={`w-1.5 h-1.5 rounded-full ${order.payment_status.toLowerCase() === 'paid' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}
              />
              <span
                className={`font-semibold uppercase tracking-tight ${
                  order.payment_status.toLowerCase() === 'paid'
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {order.payment_status.toLowerCase() === 'paid'
                  ? 'Paid'
                  : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 max-[500px]:h-9 max-[500px]:text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm shadow-green-100 text-sm md:text-base tracking-wide"
          onClick={() => onMarkDelivered(order)}
          disabled={isMarkDelivered}
        >
          Mark as Delivered
        </Button>
      </CardContent>
    </Card>
  )
}
