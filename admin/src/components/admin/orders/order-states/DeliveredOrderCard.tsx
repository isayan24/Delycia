import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ChevronDown, ChevronUp, Phone, Clock } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import {
  calculateTimeElapsed,
  formatTimeElapsed,
  formatOrderTime,
} from '../utils/orderProcessing'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface DeliveredOrderCardProps {
  order: ProcessedOrder
  onCall: (customerId: number) => void
  onViewTimeline: (customerId: number) => void
  showCallButton?: boolean
}

export function DeliveredOrderCard({
  order,
  onCall,
  onViewTimeline,
  showCallButton = true,
}: DeliveredOrderCardProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

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

  const getOrderTypeDisplay = () => {
    if (order.is_delivery) {
      return 'DELIVERY'
    } else if (order.unique_table_numbers.length > 0) {
      return `TABLE ${order.unique_table_numbers.join(', ')}`
    }
    return 'TAKEAWAY'
  }
  return (
    <Card className="w-full shadow-sm border-l-4 border-l-green-400 bg-green-50/20 hover:shadow-md transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-3">
          {/* Compact Overview */}
          <div className="flex items-center justify-between">
            {/* Customer Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">
                    {order.customer_name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs px-2 py-0.5"
                  >
                    {getOrderTypeDisplay()}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeElapsed(timeElapsed)}
                  </span>
                  <span>
                    {order.discount_amount &&
                    parseFloat(String(order.discount_amount)) > 0
                      ? `₹${(
                          order.total_amount -
                          parseFloat(String(order.discount_amount))
                        ).toFixed(2)}`
                      : `₹${order.total_amount}`}
                  </span>
                  <span>{order.items.length} items</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {showCallButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCall(order.customer_id)}
                  className="h-8 w-8 p-0"
                >
                  <Phone className="h-3 w-3" />
                </Button>
              )}

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Expandable Details */}
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Order Details */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">
                  Order Items ({order.items.length})
                </h4>
                <div className="text-right">
                  {order.discount_amount &&
                    parseFloat(String(order.discount_amount)) > 0 && (
                      <span className="block text-xs text-green-600 font-medium">
                        -₹{parseFloat(String(order.discount_amount)).toFixed(2)}{' '}
                        off
                      </span>
                    )}
                  <span className="text-sm font-semibold">
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

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <div className="flex-1">
                        <span className="block">
                          {item.quantity}x {item.display_name}
                        </span>
                        {/* Render Addons */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="ml-0 flex flex-col gap-0.5 mt-0.5">
                            {item.addons.map(
                              (addon: any, addonIndex: number) => (
                                <span
                                  key={addonIndex}
                                  className="text-xs text-gray-500 block"
                                >
                                  + {addon.quantity} x {addon.name}: ₹
                                  {addon.price}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">₹{item.total_amount}</span>
                  </div>
                ))}
              </div>

              {/* Order Meta */}
              <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t">
                <div className="flex items-center gap-2">
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

            {/* Customer Details */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Customer Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{order.customer_phone_masked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span>{formatOrderTime(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer ID:</span>
                  <span>#{order.customer_id}</span>
                </div>
              </div>
            </div>

            {/* Success Status */}
            <div className="text-center">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 px-4 py-2"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Order Delivered Successfully
              </Badge>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  )
}
