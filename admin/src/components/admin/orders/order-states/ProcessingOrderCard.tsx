import { useState, useTransition, Fragment } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Loader2 } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { ProcessingCountdownDisplay } from '../countdown'

import { OrderTaxBreakdown } from '@/components/common/OrderTaxBreakdown'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

interface ProcessingOrderCardProps {
  order: ProcessedOrder
  onMarkReady: (order: ProcessedOrder) => void
  onExtendTime?: (order: ProcessedOrder, additionalMinutes: number) => void // Callback for extending time
  isMarkingReadyTransition: boolean
  handleMarkDelivered: (order: ProcessedOrder) => void
  isMarkDelivered: boolean
}

export function ProcessingOrderCard({
  order,
  onMarkReady,
  onExtendTime,
  isMarkingReadyTransition,
  handleMarkDelivered,
  isMarkDelivered,
}: ProcessingOrderCardProps) {
  const [showExtendOptions, setShowExtendOptions] = useState(false)
  const [selectedExtendTime, setSelectedExtendTime] = useState<number | null>(
    null,
  )
  const [, startTransition] = useTransition()
  const [isExtendingTime, setIsExtendingTime] = useState(false)

  // Calculate final amount with tax
  const { grandTotal, isLoading: isTaxLoading } = useOrderTaxCalculation({
    subtotal: order.total_amount,
    discountAmount: order.discount_amount
      ? parseFloat(String(order.discount_amount))
      : 0,
  })

  // Use actual preparation time from order data
  const totalPrepTime = order.preparation_time || 30 // Default to 30 minutes if not set

  // For processing orders, use preparation_started_at if available, otherwise use updated_at (when order was accepted)
  const processingStartTime =
    order.preparation_started_at ||
    order.items[0]?.updated_at ||
    order.created_at

  const hasSpecialInstructions = order.items.some(
    (item) =>
      item.special_instructions && item.special_instructions.trim() !== '',
  )

  const getSpecialInstructionsItems = () => {
    return order.items.filter(
      (item) =>
        item.special_instructions && item.special_instructions.trim() !== '',
    )
  }

  const handleMarkReady = () => {
    onMarkReady(order)
  }

  const handleExtendTimeSelection = (minutes: number) => {
    setSelectedExtendTime(minutes)
  }

  const handleAddTime = () => {
    if (selectedExtendTime && onExtendTime) {
      setIsExtendingTime(true)

      startTransition(async () => {
        try {
          // Call the parent callback to handle DB saving
          await onExtendTime(order, selectedExtendTime)

          // Reset the UI only after successful extension
          setShowExtendOptions(false)
          setSelectedExtendTime(null)
        } catch (error) {
          console.error('Failed to extend time:', error)
        } finally {
          setIsExtendingTime(false)
        }
      })
    }
  }
  const statusBadge = (
    <Badge
      variant="secondary"
      className="bg-orange-50/80 text-orange-600 font-semibold text-[10px] md:text-xs px-2 py-0.5 rounded-md border border-orange-200/50 flex items-center gap-1 h-5 md:h-6 active:scale-95 transition-transform"
    >
      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
      PROCESSING
    </Badge>
  )

  return (
    <Card className="w-full shadow-sm border-l-4 border-l-orange-400 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
      <CardContent className="p-2.5 md:p-3.5 space-y-3">
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
        {hasSpecialInstructions && (
          <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-lg mb-1 max-[768px]:hidden flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <span className="text-xs md:text-sm text-amber-800 leading-tight">
              <span className="font-semibold">Instructions:</span>{' '}
              {getSpecialInstructionsItems()[0]?.special_instructions}
            </span>
          </div>
        )}

        {/* Mobile Accordion for Details */}
        <MobileOrderAccordion order={order} showSpecialInstructions={true} />

        {/* Desktop View - Compact Items List */}
        <OrderDetailsDesktop
          order={order}
          finalAmount={isTaxLoading ? order.total_amount : grandTotal}
        />

        {/* Action Buttons - Touch Optimized */}
        <ActionButtons
          order={order}
          orderTime={processingStartTime}
          preparationTime={totalPrepTime}
          preparationStartedAt={order.preparation_started_at}
          handleMarkReady={handleMarkReady}
          handleExtendTimeSelection={handleExtendTimeSelection}
          selectedExtendTime={selectedExtendTime}
          setShowExtendOptions={setShowExtendOptions}
          setSelectedExtendTime={setSelectedExtendTime}
          showExtendOptions={showExtendOptions}
          handleAddTime={handleAddTime}
          isMarkingReady={isMarkingReadyTransition}
          isExtendingTime={isExtendingTime}
          isMarkDelivered={isMarkDelivered}
          handleMarkDelivered={handleMarkDelivered}
        />
      </CardContent>
    </Card>
  )
}

const OrderDetailsDesktop = ({
  order,
  finalAmount,
}: {
  order: any
  finalAmount: number
}) => {
  return (
    <div className="hidden md:block">
      <div className="bg-gray-50/50 border border-gray-100 p-2.5 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-xs md:text-sm text-gray-700 uppercase tracking-tight">
            Items ({order.items.length})
          </h4>
          <span className="text-xs md:text-sm font-semibold text-gray-900">
            ₹{finalAmount.toFixed(2)}
          </span>
        </div>
        <div className="space-y-1.5">
          {order.items.slice(0, 3).map((item: any, index: any) => (
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
        <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-1">
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
  )
}

const ActionButtons = ({
  order,
  orderTime,
  preparationTime,
  preparationStartedAt,
  handleMarkReady,
  handleExtendTimeSelection,
  selectedExtendTime,
  setShowExtendOptions,
  setSelectedExtendTime,
  showExtendOptions,
  handleAddTime,
  isMarkingReady,
  isExtendingTime,
  isMarkDelivered,
  handleMarkDelivered,
}: any) => {
  const [isTimeExpired, setIsTimeExpired] = useState(false)

  return (
    <div className="pt-1">
      {!isTimeExpired ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 text-xs md:text-sm font-semibold border-gray-200 hover:bg-gray-50 rounded-xl"
            onClick={() => handleMarkDelivered(order)}
            disabled={isMarkDelivered}
          >
            Delivered
          </Button>
          <Button
            className="flex-2 h-10 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm shadow-green-100"
            onClick={handleMarkReady}
            disabled={isMarkingReady}
          >
            <ProcessingCountdownDisplay
              orderTime={orderTime}
              preparationTime={preparationTime}
              preparationStartedAt={preparationStartedAt}
              onTimeExpired={() => setIsTimeExpired(true)}
              renderAs="button"
              buttonText="Order Ready"
              className="text-sm md:text-base font-semibold uppercase tracking-wide"
            />
          </Button>
        </div>
      ) : (
        <>
          {!showExtendOptions ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl text-xs md:text-sm"
                onClick={() => setShowExtendOptions(true)}
                disabled={isMarkingReady || isExtendingTime}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Need Time
              </Button>
              <Button
                className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-sm shadow-orange-100 text-xs md:text-sm"
                onClick={handleMarkReady}
                disabled={isMarkingReady}
              >
                {isMarkingReady ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Ready...
                  </>
                ) : (
                  'Mark Ready'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 p-2 bg-gray-50/80 rounded-xl border border-gray-100">
              <p className="text-[10px] md:text-xs items-center justify-center flex font-semibold text-gray-500 uppercase tracking-widest">
                Extend Time:
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <Button
                    key={mins}
                    variant={
                      selectedExtendTime === mins ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleExtendTimeSelection(mins)}
                    className="h-8 flex-1 text-xs md:text-sm font-semibold rounded-lg"
                    disabled={isExtendingTime}
                  >
                    +{mins}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 pt-1 border-t border-gray-200/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 text-xs md:text-sm font-semibold text-gray-500 rounded-lg"
                  onClick={() => {
                    setShowExtendOptions(false)
                    setSelectedExtendTime(null)
                  }}
                  disabled={isExtendingTime}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-semibold rounded-lg"
                  onClick={handleAddTime}
                  disabled={!selectedExtendTime || isExtendingTime}
                >
                  {isExtendingTime ? 'Adding...' : 'Add Time'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
