import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Volume2, VolumeX, X } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { formatOrderTime } from '../utils/orderProcessing'
import { OrderHeader } from '../order-ui-card/OrderHeader'
import { OrderItems } from '../order-ui-card/OrderItems'
import { OrderSummary } from '../order-ui-card/OrderSummary'
import { PrepTimeSelector } from '../order-ui-card/PrepTimeSelector'
import { useSoundContext } from '@/context/SoundContext'
import { CountdownDisplay } from '../countdown'

interface OrderPopupProps {
  order: ProcessedOrder
  onAccept: (order: any, prepTime: number) => void
  onReject: (order: any) => void
  onClose: () => void
  isVisible: boolean
  onTogglePopups: () => void
  isTransitioning: boolean
}

export function OrderPopup({
  order,
  onAccept,
  onReject,
  onClose,
  isVisible,
  onTogglePopups,
  isTransitioning,
}: OrderPopupProps) {
  const [prepTime, setPrepTime] = useState(30)
  const { isSoundEnabled, toggleSound } = useSoundContext()

  const handleAccept = () => {
    onAccept(order, prepTime)
  }

  const handlePrepTimeChange = (newTime: number) => {
    setPrepTime(Math.max(5, newTime))
  }

  const getOrderTypeDisplay = () => {
    if (order.is_delivery) {
      return 'DELIVERY ORDER'
    } else if (order.unique_table_numbers.length > 0) {
      return `TABLE ${order.unique_table_numbers.join(', ')}`
    }
    return 'TAKEAWAY ORDER'
  }

  // Handle order expiration through CountdownDisplay component

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 ">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in slide-in-from-top-4 overflow-hidden">
        <CardHeader className="pb-2 max-[700px]:!p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-orange-400 max-[700px]:text-sm">
              🔔 NEW ORDER ALERT!
            </h3>
            <div className="flex items-center gap-2">
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
                {isSoundEnabled ? 'Mute' : 'Unmute'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose()
                  onTogglePopups()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="relative flex flex-col max-[700px]:max-h-[55vh] overflow-auto">
          <CardContent className=" max-[700px]:!p-3 flex-1 space-y-2 max-[700px]:h-[30rem] overflow-auto pb-20 relative">
            {/* Order Type Header */}
            <div className="bg-purple-100 p-3 max-[700px]:p-2 rounded-lg">
              <p className="font-semibold text-purple-800 text-center">
                {getOrderTypeDisplay()}
              </p>
            </div>

            {/* Order Header */}
            <OrderHeader
              orderId={order.customer_id.toString()}
              time={formatOrderTime(order.created_at)}
              customerName={order.customer_name}
              customerPhone={order.customer_phone_masked}
              isPremium={false}
            />

            {/*fix Special Instructions */}
            {order.items.some(
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

                {/* // .filter(item => item.special_instructions && item.special_instructions.trim() !== '')
                    // .map((item, index) => (
                    //   <div key={index} className="text-sm text-yellow-700 ml-4">
                    //     <span className="font-medium">{item.display_name}:</span> {item.special_instructions}
                    //   </div>
                    // )) */}
                {/* } */}
              </div>
            )}

            {/* Order Items */}
            <OrderItems items={order.items} />

            {/* Order Summary */}
            <OrderSummary
              itemCount={order.items.length}
              subtotal={order.total_amount}
              taxes={0.0}
              discount={order.discount_amount || 0}
              total={order.total_amount - (order.discount_amount || 0)}
              isPaid={order.payment_status.toLowerCase() === 'paid'}
            />

            {/* Prep Time Selector */}
            <PrepTimeSelector
              prepTime={prepTime}
              onPrepTimeChange={handlePrepTimeChange}
            />

            {/* Bottom glow effect to indicate more content */}

            <div className="w-full max-[700px]:h-[4rem]" />
          </CardContent>

          {/* Fixed Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-b-lg">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:text-red-600 hover:bg-red-50 text-md max-[700px]:text-sm"
                onClick={() => onReject(order)}
                disabled={isTransitioning}
              >
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-md max-[700px]:text-sm"
                onClick={handleAccept}
                disabled={isTransitioning}
              >
                <CountdownDisplay
                  orderTime={order.created_at}
                  onExpired={() => onReject(order)}
                  renderAs="button"
                  buttonText="Accept order"
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
