import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag } from 'lucide-react'

export function OrdersEmptyState() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          New orders will appear here when customers place them. Make sure your WebSocket connection is active.
        </p>
      </CardContent>
    </Card>
  )
}