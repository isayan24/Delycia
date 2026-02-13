import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Printer,
  ChevronDown,
  ChevronUp,
  XCircle,
  FileText,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { formatOrderTime } from '../utils/orderProcessing'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface CancelledOrderCardProps {
  order: ProcessedOrder
}

export function CancelledOrderCard({ order }: CancelledOrderCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showThermalBill, setShowThermalBill] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()

  return (
    <Card className="w-full shadow-sm border-l-4 border-l-red-400 bg-red-50/20 hover:shadow-md transition-shadow">
      {/* Thermal Bill Popup */}
      {showThermalBill && (
        <ThermalBill
          isOpen={showThermalBill}
          onClose={() => setShowThermalBill(false)}
          billData={orderToBillData(order, selectedRestaurant?.name || '')}
          showPrintButton={true}
          showDownloadButton={true}
          showShareButton={true}
          onShareToMobile={handleShareToMobile}
        />
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-2 md:p-3">
          {/* Mobile Header - Compact Status */}
          <div className="md:hidden mb-2 flex items-center justify-between">
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200/50 uppercase tracking-tight"
            >
              Order Cancelled
            </Badge>
            <span className="text-[10px] font-semibold text-gray-500">
              {formatOrderTime(order.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-red-100 rounded-full flex items-center justify-center shrink-0 border border-red-200/30">
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-none">
                    {order.customer_name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="hidden md:flex bg-red-50 text-red-700 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md border border-red-200/50"
                  >
                    Cancelled
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-700">
                    ₹
                    {(
                      order.total_amount - (order.discount_amount || 0)
                    ).toFixed(2)}
                  </span>
                  <span>{order.items.length} items</span>
                  <span className="hidden md:inline">
                    {formatOrderTime(order.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThermalBill(true)}
                className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-red-100/50 text-gray-600"
                title="Print Bill"
              >
                <Printer className="h-4 w-4" />
              </Button>

              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-gray-100"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Expandable Content */}
          <CollapsibleContent className="mt-3 pt-3 border-t border-red-100/50 space-y-3">
            <div className="bg-white/50 p-2 md:p-3 rounded-lg border border-red-100/30">
              <h4 className="font-semibold text-[11px] md:text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                Cancelled Items
              </h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="font-semibold text-gray-800">
                        <span className="text-gray-400 mr-1.5">
                          {item.quantity}x
                        </span>
                        {item.display_name}
                      </span>
                      <span className="font-semibold text-gray-700">
                        ₹{item.total_amount}
                      </span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="ml-5 flex flex-col gap-0.5">
                        {item.addons.map((addon: any, aIndex: number) => (
                          <span
                            key={aIndex}
                            className="text-[10px] md:text-xs text-gray-500"
                          >
                            + {addon.quantity} x {addon.name}: ₹{addon.price}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Info Placeholder or Just Status */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] md:text-xs text-gray-400">
                Customer ID: #{order.customer_id}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-red-200 text-red-500 bg-red-50/50"
              >
                Finalized
              </Badge>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  )
}
