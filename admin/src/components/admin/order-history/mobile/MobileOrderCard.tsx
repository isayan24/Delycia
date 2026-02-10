import { memo, useMemo } from 'react'
import CustomerAvatar from '../CustomerAvatar'
import { TransformedOrder } from '../utils/orderHistoryUtils'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

interface MobileOrderCardProps {
  order: TransformedOrder
  onClick: () => void
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

const MobileOrderCard = memo(function MobileOrderCard({
  order,
  onClick,
}: MobileOrderCardProps) {
  // Calculate subtotal from items (prices already include quantity)
  const subtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + item.price, 0),
    [order.items],
  )

  // Use the tax calculation hook for consistent calculations
  const { grandTotal, taxAmount } = useOrderTaxCalculation({
    subtotal,
    discountAmount: order.discountAmount || 0,
    rid: order.rid,
  })
  
  // Memoize the formatted items to prevent recalculation
  const formattedItems = useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return 'No items available'
    }

    // Show first 2 items, then "and X more" if there are more
    const displayItems = order.items.slice(0, 2)
    const remainingCount = order.items.length - 2

    let itemsText = displayItems
      .map((item) => `${item.quantity} x ${item.name}`)
      .join(', ')

    if (remainingCount > 0) {
      itemsText += ` and ${remainingCount} more`
    }

    return itemsText
  }, [order.items])

  const statusColorClass = useMemo(
    () => getStatusColor(order.status),
    [order.status],
  )

  return (
    <div
      className="bg-white rounded-xl p-3 mb-2 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      {/* Header with status and time */}
      <div className="flex justify-between items-center mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}
        >
          {order.status}
        </span>
        <div className="text-right text-gray-500 text-xs">
          {order.time} | {order.date}
        </div>
      </div>

      {/* Order ID */}
      <div className="mb-2">
        <span className="text-gray-700 font-medium text-sm">ID: </span>
        <span className="text-gray-900 font-semibold text-sm">
          {order.orderId}
        </span>
      </div>

      {/* Items */}
      <div className="mb-2">
        <p className="text-gray-700 text-sm leading-tight">{formattedItems}</p>
      </div>

      {/* Footer with customer and total */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {order.customer && (
            <CustomerAvatar
              initials={order.customer.initials}
              name={order.customer.name}
              size="sm"
            />
          )}
          <span className="text-gray-600 text-xs">
            By {order.customer?.name || order.customerName}
          </span>
        </div>
        <div className="text-right">
          {order.discountAmount &&
            parseFloat(String(order.discountAmount)) > 0 && (
              <div className="text-xs text-green-600 font-medium">
                -₹{parseFloat(String(order.discountAmount)).toFixed(0)} off
              </div>
            )}
          {taxAmount > 0 && (
            <div className="text-xs text-gray-600">
              +₹{taxAmount.toFixed(0)} tax
            </div>
          )}
          <span className="text-base font-semibold text-gray-900">
            ₹{grandTotal.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  )
})

export default MobileOrderCard
