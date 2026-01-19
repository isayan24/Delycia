import { ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItemsCellProps {
  order: any
  expandedOrders: Set<string>
  onToggleExpand: (cartId: string) => void
}

export function OrderItemsCell({
  order,
  expandedOrders,
  onToggleExpand,
}: OrderItemsCellProps) {
  // Parse items if they're a JSON string
  const items = order.items
    ? typeof order.items === 'string'
      ? JSON.parse(order.items)
      : order.items
    : []

  if (!items || items.length === 0) {
    return <div className="text-gray-500 text-xs">No items</div>
  }

  const cartId = order.cart_id || order.id
  const isExpanded = expandedOrders.has(cartId)
  const itemsToShow = isExpanded ? items : items.slice(0, 1)

  return (
    <div className="space-y-0.5">
      {itemsToShow.map((item: any, index: number) => (
        <div key={index} className="text-sm">
          <span className="font-medium">
            {item.name || item.item_name || 'Unknown Item'}
          </span>
          {item.quantity > 1 && (
            <span className="text-gray-600 ml-1">× {item.quantity}</span>
          )}
        </div>
      ))}

      {items.length > 1 && (
        <button
          onClick={() => onToggleExpand(cartId)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium mt-0.5"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-0.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-0.5" />
              Show {items.length - 1} more
            </>
          )}
        </button>
      )}
    </div>
  )
}
