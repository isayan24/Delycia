import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  Printer,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { OrderTaxBreakdown } from '@/components/common/OrderTaxBreakdown'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { calculateTimeElapsed, formatTimeElapsed } from '@/utils/dateUtils'

interface DeliveredOrderCardProps {
  order: ProcessedOrder
  onCall: (customerId: number) => void
  showCallButton?: boolean
}

export function DeliveredOrderCard({
  order,
  onCall,
  showCallButton = true,
}: DeliveredOrderCardProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [showThermalBill, setShowThermalBill] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()

  // Calculate final amount with tax
  const { grandTotal, isLoading: isTaxLoading } = useOrderTaxCalculation({
    subtotal: order.total_amount,
    discountAmount: order.discount_amount
      ? parseFloat(String(order.discount_amount))
      : 0,
  })

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
    } else if (
      order.items.some((item: any) => item.table_zone || item.table_number)
    ) {
      // Get table info from first item with zone/number data
      const tableItem = order.items.find(
        (item: any) => item.table_zone || item.table_number,
      )

      const zone = tableItem?.table_zone || ''
      const number =
        tableItem?.table_number || order.unique_table_numbers[0] || ''

      return zone ? `${zone} - Table ${number}` : `Table ${number}`
    } else if (order.unique_table_numbers.length > 0) {
      return `TABLE ${order.unique_table_numbers.join(', ')}`
    }
    return 'TAKEAWAY'
  }
  return (
    <Card className="w-full shadow-sm border-l-4 border-l-green-400 bg-green-50/20 hover:shadow-md transition-shadow">
      {/* Thermal Bill Popup */}
      <ThermalBill
        isOpen={showThermalBill}
        onClose={() => setShowThermalBill(false)}
        billData={orderToBillData(order, selectedRestaurant?.name || '')}
        showPrintButton={true}
        showDownloadButton={true}
        showShareButton={true}
        onShareToMobile={handleShareToMobile}
      />

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-2 md:p-3">
          {/* Mobile Table/Type Header - Visible at Top for compactness */}
          <div className="md:hidden mb-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-green-100/80 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-200/50 uppercase tracking-tight"
            >
              {getOrderTypeDisplay()}
            </Badge>
            <div className="h-1 flex-1 border-b border-gray-100" />
          </div>

          {/* Compact Overview */}
          <div className="flex items-center justify-between">
            {/* Customer Info */}
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-green-200/30">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                    {order.customer_name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="hidden md:flex bg-green-50 text-green-700 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md border border-green-200/50"
                  >
                    {getOrderTypeDisplay()}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeElapsed(timeElapsed)}
                  </span>
                  <span className="font-semibold text-gray-700">
                    ₹
                    {(isTaxLoading ? order.total_amount : grandTotal).toFixed(
                      2,
                    )}
                  </span>
                  <span>{order.items.length} items</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThermalBill(true)}
                className="h-8 w-8 p-0"
                title="Print Bill"
              >
                <Printer className="h-3 w-3" />
              </Button>

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
                <h4 className="font-semibold text-xs md:text-sm text-gray-700 uppercase tracking-tight">
                  Order Items ({order.items.length})
                </h4>
                <div className="text-right">
                  <span className="text-xs md:text-sm font-semibold text-gray-900">
                    ₹
                    {(isTaxLoading ? order.total_amount : grandTotal).toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm md:text-base"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="block truncate font-semibold text-gray-800">
                          <span className="text-gray-400 font-semibold mr-1">
                            {item.quantity}x
                          </span>{' '}
                          {item.display_name}
                        </span>
                        {/* Render Addons */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="ml-0 flex flex-col gap-0.5 mt-0.5">
                            {item.addons.map(
                              (addon: any, addonIndex: number) => (
                                <span
                                  key={addonIndex}
                                  className="text-[11px] md:text-xs text-gray-500 block leading-tight"
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
                    <span className="font-semibold text-gray-900 ml-2">
                      ₹{item.total_amount}
                    </span>
                  </div>
                ))}
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

              {/* Order Meta */}
              <div className="flex items-center justify-between text-[11px] md:text-xs mt-3 pt-2 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
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

            {/* Customer Details */}
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
              <h4 className="font-semibold text-xs md:text-sm text-blue-700 uppercase tracking-tight mb-2">
                Customer Details
              </h4>
              <div className="space-y-1.5 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-semibold text-gray-900">
                    {order.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-semibold text-gray-900">
                    {order.customer_phone_masked}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-semibold text-gray-900">
                    {order.formattedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer ID:</span>
                  <span className="font-semibold text-gray-900">
                    #{order.customer_id}
                  </span>
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
