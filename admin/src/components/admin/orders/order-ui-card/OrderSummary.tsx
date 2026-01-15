import React from 'react'
import { Badge } from '@/components/ui/badge'

interface OrderSummaryProps {
  itemCount: number
  subtotal: number
  taxes: number
  discount: number
  total: number
  isPaid?: boolean
}

export function OrderSummary({ 
  itemCount, 
  subtotal, 
  taxes, 
  discount, 
  total, 
  isPaid = false 
}: OrderSummaryProps) {
  return (
    <div className="space-y-2 py-3 border-t">
      <div className="flex justify-between text-sm">
        <span>{itemCount} item</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="border-b border-dotted border-gray-400">Taxes</span>
        <span>₹{taxes.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="border-b border-dotted border-gray-400">Discount</span>
        <span className="text-green-600">₹{discount.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t">
        <div className="flex items-center gap-2">
          <span>Total Bill</span>
          {isPaid && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              PAID
            </Badge>
          )}
        </div>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  )
}