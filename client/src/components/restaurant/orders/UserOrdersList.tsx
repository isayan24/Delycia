'use client'
import { useMemo } from 'react'
import { Order } from '@/types/Order'
import { groupOrdersByCartId } from '@/helpers/orderGroupingUtils'
import GroupedOrderCard from './GroupedOrderCard'

interface UserOrdersListProps {
  orders: Order[]
}

export default function UserOrdersList({ orders }: UserOrdersListProps) {
  // Group orders by cart_id using memoization to prevent unnecessary recalculation
  const groupedOrders = useMemo(() => {
    return groupOrdersByCartId(orders)
  }, [orders])

  if (groupedOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No orders to display</div>
    )
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {groupedOrders.map((group) => (
        <GroupedOrderCard key={group.cart_id} group={group} />
      ))}
    </div>
  )
}
