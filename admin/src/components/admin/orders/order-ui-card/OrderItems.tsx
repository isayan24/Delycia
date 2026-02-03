import React from 'react'
import { ProcessedOrderItem } from '@/types/WebSocketOrder'

interface OrderItemsProps {
  items: ProcessedOrderItem[]
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        // Use item.id if available, otherwise use index as fallback
        const key = item.id || `item-${index}`
        return (
          <div key={key} className="flex justify-between items-center py-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  <span className=" text-[1.1rem]">
                    {item.quantity} x {item.display_name}
                  </span>
                </span>
              </div>
              {/* Render Addons */}
              {item.addons && item.addons.length > 0 && (
                <div className="ml-4 flex flex-col gap-0.5">
                  {item.addons.map((addon: any, addonIndex: number) => (
                    <span key={addonIndex} className="text-sm text-gray-500">
                      + {addon.quantity > 1 ? `${addon.quantity} x ` : ''}
                      {addon.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="font-medium">₹{item.total_amount.toFixed(2)}</span>
          </div>
        )
      })}
    </div>
  )
}
