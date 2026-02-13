import React, { memo, useMemo, useCallback } from 'react'
import { TransformedOrderItem, CustomerInfo } from '../utils/orderHistoryUtils'
import CustomerAvatar from '../CustomerAvatar'
import { Printer } from 'lucide-react'
import { formatDateTime } from '@/utils/dateUtils'

interface OrderInfoCardProps {
  status: 'DELIVERED' | 'CANCELLED'
  orderDate: string
  orderId: string
  customerName: string
  customer?: CustomerInfo
  items: TransformedOrderItem[]
  totalAmount: number // Subtotal (pre-tax)
  discountAmount?: number
  taxPercent?: number
  isSelected?: boolean
  onClick?: () => void
  onPrint?: () => void
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const OrderInfoCard = memo(function OrderInfoCard({
  status,
  orderDate,
  orderId,
  customerName,
  customer,
  items,
  totalAmount,
  discountAmount,
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

  // Memoize the status styles to prevent recalculation
  const statusStyles = useMemo(() => getStatusStyles(status), [status])

  return (
    <div
      className={`rounded-2xl p-3.5 mb-2 border transition-all duration-300 cursor-pointer overflow-hidden group ${
        isSelected
          ? 'bg-orange-50/10 border-orange-200 shadow-sm ring-1 ring-orange-100'
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-2.5">
        {/* Header: ID and Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ID:
            </span>
            <span className="font-black text-gray-900 text-xs truncate">
              {orderId}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${statusStyles}`}
          >
            {status}
          </span>
        </div>

        {/* Middle: Customer and Time */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CustomerAvatar
              initials={customer?.initials || customerName.charAt(0)}
              name={customer?.name || customerName}
              size="sm"
              className="bg-linear-to-br from-orange-300 to-orange-400 text-gray-600 border border-white shadow-xs"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 text-[11px] truncate">
                {customer?.name || customerName}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">
                {customer?.phone || 'Guest'}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              {formatDateTime(orderDate).split(',')[0]}
            </div>
            <div className="text-[9px] text-gray-400/80 font-medium">
              {formatDateTime(orderDate).split(',')[1]}
            </div>
          </div>
        </div>

        {/* Content: Items Description */}
        <div className="relative">
          <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-1 italic pr-2">
            {formattedItems}
          </p>
        </div>

        {/* Footer: Stats and Total */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-tight"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            )}
          </div>

          <div className="flex flex-col items-end leading-none">
            {discountAmount !== 0 &&
              discountAmount &&
              parseFloat(String(discountAmount)) > 0 && (
                <span className="text-[9px] text-emerald-600 font-black mb-0.5">
                  -₹{parseFloat(String(discountAmount)).toFixed(2)}
                </span>
              )}
            <span className="text-sm font-black text-gray-900">
              ₹{totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default OrderInfoCard
