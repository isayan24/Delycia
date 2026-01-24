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
          <div className="font-medium text-gray-900">
            {item.name || item.item_name || 'Unknown Item'}
            {item.variant_name && (
              <span className="text-gray-500 text-xs font-normal ml-1">
                [{item.variant_name}]
              </span>
            )}
          </div>
          {item.quantity > 1 && (
            <div className="text-xs text-blue-600 font-medium mt-0.5">
              Qty: {item.quantity}
            </div>
          )}

          {/* Addons */}
          {(() => {
            const addons =
              typeof item.addons === 'string'
                ? JSON.parse(item.addons)
                : item.addons

            if (!addons || addons.length === 0) return null

            return (
              <div className="ml-2 flex flex-col gap-0.5 mt-0.5">
                {addons.map((addon: any, addonIndex: number) => (
                  <span
                    key={addonIndex}
                    className="text-[0.7rem] text-gray-500 block"
                  >
                    + {addon.quantity} {addon.name} ({addon.price})
                  </span>
                ))}
              </div>
            )
          })()}
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
