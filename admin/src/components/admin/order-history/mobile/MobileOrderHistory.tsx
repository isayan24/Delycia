import React, { memo, useState } from 'react'
import { TransformedOrder } from '@/utils/orderHistoryUtils'
import MobileOrderCard from './MobileOrderCard'
import MobileOrderDrawer from './MobileOrderDrawer'
import { OrderInfoSkeleton } from '../LoadingSkeleton'

interface MobileOrderHistoryProps {
  orders: TransformedOrder[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <div className="text-4xl mb-3">📋</div>
    <h3 className="text-base font-medium mb-2">No Orders Found</h3>
    <p className="text-sm text-center">There are no orders in the history yet.</p>
  </div>
))
EmptyState.displayName = 'EmptyState'

// Error state component
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <div className="text-4xl mb-3">⚠️</div>
    <h3 className="text-base font-medium mb-2">Error Loading Orders</h3>
    <p className="text-sm text-center mb-4">{error}</p>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Try Again
    </button>
  </div>
))
ErrorState.displayName = 'ErrorState'

// Loading state component
const LoadingState = memo(() => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
        <OrderInfoSkeleton />
      </div>
    ))}
  </div>
))
LoadingState.displayName = 'LoadingState'

const MobileOrderHistory = memo(function MobileOrderHistory({ 
  orders, 
  loading, 
  error, 
  onRetry 
}: MobileOrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<TransformedOrder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOrderClick = (order: TransformedOrder) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedOrder(null)
  }

  // Show loading state
  if (loading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            onClick={() => handleOrderClick(order)}
          />
        ))}
      </div>

      <MobileOrderDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  )
})

export default MobileOrderHistory