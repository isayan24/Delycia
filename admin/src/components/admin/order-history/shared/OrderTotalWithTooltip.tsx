import { memo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

interface OrderTotalWithTooltipProps {
  subtotal: number
  discountAmount?: number
  rid?: number
  className?: string
  showTooltip?: boolean
}

/**
 * Reusable component that displays order total with optional tax breakdown tooltip
 * 
 * @param subtotal - Pre-tax subtotal amount
 * @param discountAmount - Optional discount amount
 * @param rid - Optional restaurant ID
 * @param className - Optional CSS classes for the total display
 * @param showTooltip - Whether to show the tooltip (default: true)
 */
const OrderTotalWithTooltip = memo(function OrderTotalWithTooltip({
  subtotal,
  discountAmount = 0,
  rid,
  className = 'text-sm font-semibold',
  showTooltip = true,
}: OrderTotalWithTooltipProps) {
  const { grandTotal, taxAmount, taxPercent, isLoading } = useOrderTaxCalculation({
    subtotal,
    discountAmount,
    rid,
  })

  const displayAmount = isLoading ? subtotal : grandTotal
  const formattedAmount = `₹${displayAmount.toFixed(0)}`

  // If tooltip is disabled, just show the amount
  if (!showTooltip) {
    return <div className={className}>{formattedAmount}</div>
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={`${className} cursor-help hover:text-blue-600 transition-colors`}>
            {formattedAmount}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="p-3 max-w-xs bg-white border border-gray-200 shadow-lg"
        >
          <div className="space-y-1.5 text-xs">
            <div className="font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
              Amount Breakdown
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">GST ({taxPercent}%):</span>
                <span className="font-medium text-gray-900">
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-1.5 border-t border-gray-200 font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export default OrderTotalWithTooltip
