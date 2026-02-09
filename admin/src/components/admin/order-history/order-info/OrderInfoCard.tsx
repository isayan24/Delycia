import React, { memo, useMemo, useCallback } from 'react'
import { TransformedOrderItem, CustomerInfo } from '../utils/orderHistoryUtils'
import CustomerAvatar from '../CustomerAvatar'
import { Printer } from 'lucide-react'
import { formatISTDateTime, getISTDateKey } from '../utils/historyDateUtils'

interface OrderInfoCardProps {
  status: 'DELIVERED' | 'CANCELLED'
  rating?: number 
  orderDate: string
  orderId: string
  customerName: string
  customer?: CustomerInfo
  items: TransformedOrderItem[]
  totalAmount: number // Subtotal (pre-tax)
  discountAmount?: number
  taxPercent?: number
  taxAmount?: number
  isSelected?: boolean
  onClick?: () => void
  onPrint?: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-600 text-white'
    case 'CANCELLED':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const OrderInfoCard = memo(function OrderInfoCard({
  status,
  rating, 
  orderDate,
  orderId,
  customerName,
  customer,
  items,
  totalAmount,
  discountAmount,
  taxPercent,
  taxAmount,
  isSelected = false,
  onClick,
  onPrint,
}: OrderInfoCardProps) {
  // Memoize the formatted items to prevent recalculation on every render
  const formattedItems = useMemo(() => {
    if (!items || items.length === 0) {
      return 'No items available'
    }

    // Show first 2 items, then "and X more" if there are more
    const displayItems = items.slice(0, 2)
    const remainingCount = items.length - 2

    let itemsText = displayItems
      .map((item) => {
        const variantText = item.variant_name ? ` (${item.variant_name})` : ''
        return `${item.quantity} x ${item.name}${variantText}`
      })
      .join(', ')

    if (remainingCount > 0) {
      itemsText += ` and ${remainingCount} more`
    }

    return itemsText
  }, [items])

  // Calculate grand total: subtotal - discount + tax
  const grandTotal = useMemo(() => {
    const subtotal = totalAmount
    const discount = parseFloat(String(discountAmount || 0))
    const tax = parseFloat(String(taxAmount || 0))
    return subtotal - discount + tax
  }, [totalAmount, discountAmount, taxAmount])

  // Memoize the click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  // Handle print with stopPropagation to prevent card selection
  const handlePrint = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onPrint) {
        onPrint()
      }
    },
    [onPrint],
  )

  // Memoize the status color to prevent recalculation
  const statusColorClass = useMemo(() => getStatusColor(status), [status])

  return (
    <div
      className={`rounded-lg p-4 mb-2 border transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'bg-green-50 border-green-300 shadow-sm'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={handleClick}
    >
      {/* Header with status and rating */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-md text-sm font-medium ${statusColorClass}`}
          >
            {status}
          </span>
          {rating && (
            <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-md">
              <span className="text-sm font-medium">{rating}</span>
              <span className="ml-1">★</span>
            </div>
          )}
        </div>
        <div className="text-right text-gray-500">
          <div className="text-sm"> 
            {formatISTDateTime(orderDate)} 
          </div>
        </div>
      </div>

      {/* Order ID and Customer */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-gray-700 font-medium">ID: </span>
          <span className="text-gray-900 font-semibold">{orderId}</span>
        </div>
        <div className="flex items-center gap-2">
          {customer && (
            <CustomerAvatar
              initials={customer.initials}
              name={customer.name}
              size="sm"
            />
          )}
          <div className="text-gray-500 text-sm">
            By {customer?.name || customerName}
          </div>
        </div>
      </div>

      {/* Items and Total */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {formattedItems}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          {discountAmount && parseFloat(String(discountAmount)) > 0 && (
            <div className="text-xs text-green-600 font-medium whitespace-nowrap">
              -₹{parseFloat(String(discountAmount)).toFixed(2)} off
            </div>
          )}
          {taxAmount && parseFloat(String(taxAmount)) > 0 && (
            <div className="text-xs text-gray-600 whitespace-nowrap">
              +₹{parseFloat(String(taxAmount)).toFixed(2)} tax
            </div>
          )}
          <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            ₹{grandTotal}
          </span>
        </div>
      </div>

      {/* Print Button */}
      {onPrint && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </button>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-1 pt-1 border-t border-green-200">
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
            Selected
          </div>
        </div>
      )}
    </div>
  )
})

export default OrderInfoCard
