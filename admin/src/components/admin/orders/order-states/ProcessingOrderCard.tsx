import React, { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Loader2 } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { CompactOrderHeader } from '../order-ui-card/CompactOrderHeader'
import { MobileOrderAccordion } from '../small-screen/MobileOrderAccordion'
import { ProcessingCountdownDisplay } from '../countdown'
import logger from '@/lib/logger-dynamic'
import { calculateTimeElapsed } from '../utils/orderProcessing'

interface ProcessingOrderCardProps {
  order: ProcessedOrder
  onMarkReady: (order: ProcessedOrder) => void
  onCall: (customerId: number) => void
  onViewTimeline: (customerId: number) => void
  onExtendTime?: (order: ProcessedOrder, additionalMinutes: number) => void // Callback for extending time
  isMarkingReadyTransition: boolean
  handleMarkDelivered: (order: ProcessedOrder) => void
  isMarkDelivered: boolean
}

export function ProcessingOrderCard({
  order,
  onMarkReady,
  onCall,
  onViewTimeline,
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

  // Use actual preparation time from order data
  const totalPrepTime = order.preparation_time || 30 // Default to 30 minutes if not set

  // For processing orders, use preparation_started_at if available, otherwise use updated_at (when order was accepted)
  const processingStartTime =
    order.preparation_started_at ||
    order.items[0]?.updated_at ||
    order.created_at

  // Calculate time elapsed for header display (non-reactive)
  const timeElapsed = calculateTimeElapsed(processingStartTime)

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
      className="bg-orange-100 text-orange-500 font-medium hover:!bg-orange-100"
    >
      🔄 PROCESSING
    </Badge>
  )

  return (
    <Card className="w-full shadow-md border-l-4 border-l-orange-400 hover:shadow-lg transition-shadow">
      <CardContent className="p-3 md:p-4 space-y-3">
        {/* Compact Header */}
        <CompactOrderHeader
          order={order}
          statusBadge={statusBadge}
          onCall={onCall}
          onViewTimeline={onViewTimeline}
          showCallButton={false}
          timeElapsed={timeElapsed}
        />

        {/* Special Instructions - Compact (Mobile Only) */}
        {hasSpecialInstructions && (
          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg mb-2 max-[768px]:hidden">
            <div className="flex items-center gap-2 text-amber-800 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Special Instructions:{' '}
                {getSpecialInstructionsItems()[0]?.special_instructions}
              </span>
            </div>
          </div>
        )}

        {/* Mobile Accordion for Details */}
        <MobileOrderAccordion order={order} showSpecialInstructions={true} />

        {/* Desktop View - Compact Items List */}
        <OrderDetailsDesktop order={order} />

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

const OrderDetailsDesktop = ({ order }: any) => {
  return (
    <div className="hidden md:block">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-[1rem]">
            Order Items ({order.items.length})
          </h4>
          <div className="text-right">
            {order.discount_amount &&
              parseFloat(String(order.discount_amount)) > 0 && (
                <span className="block text-xs text-green-600 font-medium">
                  -₹{parseFloat(String(order.discount_amount)).toFixed(2)} off
                </span>
              )}
            <span className="text-sm font-semibold text-[1rem]">
              {order.discount_amount &&
              parseFloat(String(order.discount_amount)) > 0
                ? `₹${(
                    order.total_amount -
                    parseFloat(String(order.discount_amount))
                  ).toFixed(2)}`
                : `₹${order.total_amount}`}
            </span>
          </div>
        </div>
        <div className="space-y-1 ">
          {order.items.slice(0, 3).map((item: any, index: any) => (
            <React.Fragment key={index}>
              <div className="flex justify-between items-center text-[1rem]">
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
    <div className="space-y-2">
      {!isTimeExpired ? (
        <div className="flex items-center gap-2">
          <Button
            className="w-[30%] bg-blue-500 hover:bg-blue-600 text-white min-h-[3rem] text-[1rem] max-[768px]:text-[.9rem]"
            onClick={() => handleMarkDelivered(order)}
            disabled={isMarkDelivered}
          >
            Mark as Delivered
          </Button>
          <Button
            className="w-[70%] bg-green-600 hover:bg-green-700 text-white min-h-[50px]"
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
              className="text-[1rem] max-[768px]:text-[.8rem]"
            />
          </Button>
        </div>
      ) : (
        <>
          {!showExtendOptions ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 min-h-[44px] text-[1rem] max-[768px]:text-[.8rem]"
                onClick={() => setShowExtendOptions(true)}
                disabled={isMarkingReady || isExtendingTime}
              >
                <Plus className="h-4 w-4 mr-2" />
                Need More Time
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700/70 text-white min-h-[44px] text-[1rem] max-[768px]:text-[.8rem]"
                onClick={handleMarkReady}
                disabled={isMarkingReady}
              >
                {isMarkingReady ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking Ready...
                  </>
                ) : (
                  'Mark Ready'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Extend preparation time:
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedExtendTime === 5 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleExtendTimeSelection(5)}
                  className="min-h-[40px] flex-1"
                  disabled={isExtendingTime}
                >
                  +5 min
                </Button>
                <Button
                  variant={selectedExtendTime === 10 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleExtendTimeSelection(10)}
                  className="min-h-[40px] flex-1"
                  disabled={isExtendingTime}
                >
                  +10 min
                </Button>
                <Button
                  variant={selectedExtendTime === 15 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleExtendTimeSelection(15)}
                  className="min-h-[40px] flex-1"
                  disabled={isExtendingTime}
                >
                  +15 min
                </Button>
                <Button
                  variant={selectedExtendTime === 20 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleExtendTimeSelection(20)}
                  className="min-h-[40px] flex-1"
                  disabled={isExtendingTime}
                >
                  +20 min
                </Button>
                <Button
                  variant={selectedExtendTime === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleExtendTimeSelection(30)}
                  className="min-h-[40px] flex-1"
                  disabled={isExtendingTime}
                >
                  +30 min
                </Button>
              </div>
              <div className="flex gap-2 ">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 min-h-[44px] text-[1rem] max-[768px]:text-[.8rem]"
                  onClick={() => {
                    setShowExtendOptions(false)
                    setSelectedExtendTime(null)
                  }}
                  disabled={isExtendingTime}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-[44px] text-[1rem] max-[768px]:text-[.8rem]"
                  onClick={handleAddTime}
                  disabled={!selectedExtendTime || isExtendingTime}
                >
                  {isExtendingTime ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Time...
                    </>
                  ) : (
                    'Add Time'
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
