import { memo, useMemo } from 'react'
import OrderDetailsCard from './OrderDetailsCard'
import {
  TransformedOrder,
  generateOrderTimeline,
  calculateDeliveryTime,
} from '../utils/orderHistoryUtils'
import { OrderDetailsSkeleton } from '../LoadingSkeleton'

interface OrderDetailsListProps {
  selectedOrder: TransformedOrder | null
  loading: boolean
}

// Default state when no order is selected
const DefaultState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <div className="text-6xl mb-4">📄</div>
    <h3 className="text-lg font-medium mb-2">Select an Order</h3>
    <p className="text-sm text-center">
      Choose an order from the list to view its details
    </p>
  </div>
))
DefaultState.displayName = 'DefaultState'

const OrderDetailsList = memo(function OrderDetailsList({
  selectedOrder,
  loading,
}: OrderDetailsListProps) {
  // Memoize timeline and delivery time calculations to prevent unnecessary recalculations
  // These hooks must be called before any conditional returns
  const timeline = useMemo(
    () => (selectedOrder ? generateOrderTimeline(selectedOrder) : []),
    [selectedOrder],
  )
  const deliveryTime = useMemo(
    () => (selectedOrder ? calculateDeliveryTime(selectedOrder) : ''),
    [selectedOrder],
  )

  // Show loading state
  if (loading) {
    return (
      <div className="w-[60%] h-full border flex flex-col">
        <OrderDetailsSkeleton />
      </div>
    )
  }

  // Show default state when no order is selected
  if (!selectedOrder) {
    return (
      <div className="w-[60%] h-full border flex flex-col">
        <DefaultState />
      </div>
    )
  }

  return (
    <div className="w-[60%] h-full flex flex-col">
      <OrderDetailsCard
        orderId={selectedOrder.orderId}
        orderDate={selectedOrder.updatedAt}
        status={selectedOrder.status}
        customerName={selectedOrder.customerName}
        customer={selectedOrder.customer}
        deliveryTime={deliveryTime}
        timeline={timeline}
        items={selectedOrder.items}
        paymentMethod={selectedOrder.paymentMethod}
        deliveryType={selectedOrder.deliveryType}
        specialInstructions={selectedOrder.specialInstructions}
        tableNo={selectedOrder.tableNo}
        paymentStatus={selectedOrder.paymentStatus}
        discountAmount={selectedOrder.discountAmount}
        rid={selectedOrder.rid}
      />
    </div>
  )
})

export default OrderDetailsList
