'use client'
import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { Order } from '@/types/Order'
import { groupOrdersByCartId } from '@/helpers/orderGroupingUtils'
import GroupedOrderCard from './GroupedOrderCard'
import { useLoadMore } from '@/hooks/useLoadMore'

interface UserOrdersListProps {
  orders: Order[]
}

export default function UserOrdersList({ orders }: UserOrdersListProps) {
  // Group orders by cart_id using memoization to prevent unnecessary recalculation
  const groupedOrders = useMemo(() => {
    return groupOrdersByCartId(orders)
  }, [orders])

  // Progressive rendering — show 10 groups initially, load more on scroll
  const { visibleItems, hasMore, sentinelRef } = useLoadMore(groupedOrders, 10)

  if (groupedOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No orders to display</div>
    )
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {visibleItems.map((group) => (
        <GroupedOrderCard key={group.cart_id} group={group} />
      ))}
      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4 text-sm text-gray-400 gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more orders...
        </div>
      )}
    </div>
  )
}
