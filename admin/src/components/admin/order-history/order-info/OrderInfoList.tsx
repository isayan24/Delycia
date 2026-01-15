import React, { memo } from 'react'
import OrderInfoCard from './OrderInfoCard'
import { TransformedOrder } from '@/utils/orderHistoryUtils'
import { OrderInfoSkeleton } from '../LoadingSkeleton'

interface OrderInfoListProps {
  orders: TransformedOrder[]
  selectedOrderId: string | null
  onOrderSelect: (orderId: string) => void
  loading: boolean
  error: string | null
  onRetry: () => void
}

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <div className="text-6xl mb-4">📋</div>
    <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
    <p className="text-sm text-center">There are no orders in the history yet.</p>
  </div>
))
EmptyState.displayName = 'EmptyState'

// Error state component
const ErrorState = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <div className="text-6xl mb-4">⚠️</div>
    <h3 className="text-lg font-medium mb-2">Error Loading Orders</h3>
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
  <div className="w-[40%] h-full border flex flex-col p-4 overflow-y-auto">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <OrderInfoSkeleton key={index} />
      ))}
    </div>
  </div>
))
LoadingState.displayName = 'LoadingState'

const OrderInfoList = memo(function OrderInfoList({ 
  orders, 
  selectedOrderId, 
  onOrderSelect, 
  loading, 
  error, 
  onRetry 
}: OrderInfoListProps) {
  
  // Show loading state
  if (loading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return (
      <div className="w-[40%] h-full border flex flex-col p-4">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    )
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="w-[40%] h-full border flex flex-col p-4">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="w-[40%] h-full flex flex-col p-4 overflow-y-auto"> 
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderInfoCard
            key={order.id}
            status={order.status}
            time={order.time}
            date={order.date}
            orderId={order.orderId}
            customerName={order.customerName}
            customer={order.customer}
            items={order.items}
            totalAmount={order.totalAmount}
            isSelected={selectedOrderId === order.id}
            onClick={() => onOrderSelect(order.id)}
          />
        ))}
      </div>
    </div>
  )
})

export default OrderInfoList
