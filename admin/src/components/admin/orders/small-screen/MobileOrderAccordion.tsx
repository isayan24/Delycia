import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'

interface MobileOrderAccordionProps {
  order: ProcessedOrder
  showSpecialInstructions?: boolean
}

export function MobileOrderAccordion({
  order,
  showSpecialInstructions = true,
}: MobileOrderAccordionProps) {
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

  return (
    <div className="md:hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="order-details" className="border-none">
          <AccordionTrigger className="py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium">
            View Order Details ({order.items.length} items)
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            {/* Special Instructions - Mobile */}
            {showSpecialInstructions && hasSpecialInstructions && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg mb-2">
                <div className="flex items-center gap-2 text-amber-800 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Special Instructions:{' '}
                    {getSpecialInstructionsItems()[0]?.special_instructions}
                  </span>
                </div>
              </div>
            )}

            {/* Order Items - Mobile */}
            <div className="space-y-1 mb-2 p-2 bg-gray-50 rounded">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center ">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-green-500 bg-green-100 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      </div>
                      <p className="font-medium text-sm">{item.display_name}</p>
                    </div>
                    <p className="text-xs text-gray-600 ml-5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">₹{item.total_amount}</p>
                </div>
              ))}
            </div>

            {/* Order Summary - Mobile */}
            <div className="bg-green-50 p-3 rounded-lg space-y-1">
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
                  <span>Tax ({order.tax_percent?.toFixed(1)}%):</span>
                  <span>+₹{parseFloat(String(order.tax_amount)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t pt-1">
                <span>Grand Total:</span>
                <span>
                  ₹{(
                    order.total_amount -
                    (parseFloat(String(order.discount_amount)) || 0) +
                    (parseFloat(String(order.tax_amount)) || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs pt-1 border-t">
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
          </AccordionContent>
          z
        </AccordionItem>
      </Accordion>
    </div>
  )
}
