import { Order, GroupedUserOrder } from '@/types/Order'

/**
 * Order status priority for determining the "most urgent" status in a group.
 * Lower number = more urgent (should be shown first)
 */
const STATUS_PRIORITY: Record<string, number> = {
  pending: 1,
  processing: 2,
  ready: 3,
  completed: 4,
  cancelled: 5,
}

/**
 * Generic groupBy utility function
 */
const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

/**
 * Gets the status counts for a group of orders
 */
export const getStatusCounts = (orders: Order[]): Record<string, number> => {
  return orders.reduce(
    (counts, order) => {
      const status = order.order_status.toLowerCase()
      counts[status] = (counts[status] || 0) + 1
      return counts
    },
    {} as Record<string, number>,
  )
}

/**
 * Determines the aggregate status for a group based on priority.
 * Returns the most "urgent" (pending > processing > ready > completed > cancelled)
 */
export const getGroupedOrderStatus = (orders: Order[]): string => {
  if (!orders.length) return 'unknown'

  let mostUrgentStatus = orders[0].order_status.toLowerCase()
  let mostUrgentPriority = STATUS_PRIORITY[mostUrgentStatus] ?? 99

  for (const order of orders) {
    const status = order.order_status.toLowerCase()
    const priority = STATUS_PRIORITY[status] ?? 99

    if (priority < mostUrgentPriority) {
      mostUrgentStatus = status
      mostUrgentPriority = priority
    }
  }

  return mostUrgentStatus
}

/**
 * Calculates the total amount for a group of orders
 */
export const calculateGroupTotal = (orders: Order[]): number => {
  return orders.reduce((total, order) => total + (order.total_amount || 0), 0)
}

/**
 * Gets the earliest created_at timestamp from a group of orders
 */
export const getGroupCreatedAt = (orders: Order[]): Date => {
  if (!orders.length) return new Date()

  const timestamps = orders.map((o) => new Date(o.created_at).getTime())
  return new Date(Math.min(...timestamps))
}

/**
 * Groups flat orders array by cart_id into GroupedUserOrder[]
 * Orders without cart_id are grouped individually by their order id
 */
export const groupOrdersByCartId = (orders: Order[]): GroupedUserOrder[] => {
  if (!orders || orders.length === 0) return []

  // Separate orders with and without cart_id
  const ordersWithCartId = orders.filter((o) => o.cart_id)
  const ordersWithoutCartId = orders.filter((o) => !o.cart_id)

  // Group orders by cart_id
  const groupedByCartId = groupBy(ordersWithCartId, 'cart_id')

  // Transform grouped orders into GroupedUserOrder format
  const groupedOrders: GroupedUserOrder[] = Object.entries(groupedByCartId).map(
    ([cartId, cartOrders]) => {
      // Sort orders within group by created_at (newest first for display)
      const sortedOrders = [...cartOrders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      return {
        cart_id: cartId,
        orders: sortedOrders,
        totalAmount: calculateGroupTotal(sortedOrders),
        orderCount: sortedOrders.length,
        createdAt: getGroupCreatedAt(sortedOrders),
        aggregatedStatus: getGroupedOrderStatus(sortedOrders),
        statusCounts: getStatusCounts(sortedOrders),
      }
    },
  )

  // Handle orders without cart_id - create individual groups
  const individualGroups: GroupedUserOrder[] = ordersWithoutCartId.map(
    (order) => ({
      cart_id: `single-${order.id}`,
      orders: [order],
      totalAmount: order.total_amount || 0,
      orderCount: 1,
      createdAt: new Date(order.created_at),
      aggregatedStatus: order.order_status.toLowerCase(),
      statusCounts: { [order.order_status.toLowerCase()]: 1 },
    }),
  )

  // Combine all groups and sort by createdAt (newest first)
  const allGroups = [...groupedOrders, ...individualGroups].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )

  return allGroups
}

/**
 * Filters grouped orders by status.
 * A group matches if its aggregatedStatus matches the filter,
 * OR if any order in the group has the matching status.
 */
export const filterGroupedOrdersByStatus = (
  groups: GroupedUserOrder[],
  status: string,
): GroupedUserOrder[] => {
  const statusLower = status.toLowerCase()

  return groups.filter((group) => {
    // Check if the aggregated status matches
    if (group.aggregatedStatus === statusLower) return true

    // Or if any order in the group has this status
    return group.orders.some(
      (order) => order.order_status.toLowerCase() === statusLower,
    )
  })
}

/**
 * Gets unique order IDs from a GroupedUserOrder (for tab counting)
 */
export const getOrderCountByStatus = (
  groups: GroupedUserOrder[],
  status: string,
): number => {
  const statusLower = status.toLowerCase()

  // Count groups where any order has this status
  return groups.filter((group) =>
    group.orders.some(
      (order) => order.order_status.toLowerCase() === statusLower,
    ),
  ).length
}
