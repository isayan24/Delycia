import { format } from 'date-fns'
import { User } from '@/types/user.types'

// API Order interface based on the console data structure
export interface ApiOrder {
  id: number
  cart_id: string
  created_at: string
  updated_at: string
  customer_id: number
  delivery_type: string
  discount_amount: number
  display_name: string
  item_id: number
  order_status: 'completed' | 'cancelled' | 'settled'
  payment_method: string
  payment_status: string
  preparation_time: number
  quantity: number
  rid: number
  special_instructions: string | null
  table_no: number
  total_amount: number
  variant_id: number
  customer_phone: string
}

// Transformed order interface for UI
export interface TransformedOrderItem {
  name: string
  quantity: number
  price: number
  addons?: any[]
  variant_name?: string | null
  item_name?: string
}

export interface CustomerInfo {
  id: number
  name: string
  phone: string
  initials: string
}

export interface TransformedOrder {
  id: string
  orderId: string
  status: 'DELIVERED' | 'CANCELLED'
  time: string
  date: string
  customerId: number
  customerName: string
  customer?: CustomerInfo
  items: TransformedOrderItem[]
  totalAmount: number
  discountAmount?: number | any
  createdAt: Date
  updatedAt: Date
  paymentMethod: string
  deliveryType: string
  specialInstructions?: string
  preparationTime: number
  tableNo: number
  paymentStatus: string
}

/**
 * Maps API order status to UI display status
 */
export const mapOrderStatus = (
  apiStatus: string,
): 'DELIVERED' | 'CANCELLED' => {
  switch (apiStatus.toLowerCase()) {
    case 'completed':
      return 'DELIVERED'
    case 'settled':
      return 'DELIVERED'
    case 'cancelled':
      return 'CANCELLED'
    default:
      return 'DELIVERED' // Default fallback
  }
}

/**
 * Converts UTC timestamp to local time string
 */
export const formatTimeFromUTC = (utcTimestamp: string): string => {
  try {
    const date = new Date(utcTimestamp)
    return format(date, 'h:mm a') // e.g., "9:22 PM"
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Invalid time'
  }
}

/**
 * Converts UTC timestamp to local date string
 */
export const formatDateFromUTC = (utcTimestamp: string): string => {
  try {
    const date = new Date(utcTimestamp)
    return format(date, 'd MMMM') // e.g., "2 November"
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Groups array of items by a specific key
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
 * Aggregates order items by display name and sums quantities
 */
export const aggregateOrderItems = (
  orderItems: ApiOrder[],
): TransformedOrderItem[] => {
  const itemMap = new Map<string, TransformedOrderItem>()

  orderItems.forEach((item) => {
    const itemName = item.display_name || `Item #${item.item_id}`

    if (itemMap.has(itemName)) {
      const existingItem = itemMap.get(itemName)!
      existingItem.quantity += item.quantity
      existingItem.price += item.total_amount
    } else {
      itemMap.set(itemName, {
        name: itemName,
        quantity: item.quantity,
        price: item.total_amount,
      })
    }
  })

  return Array.from(itemMap.values())
}

/**
 * Calculates total amount for grouped order items
 */
export const calculateOrderTotal = (orderItems: ApiOrder[]): number => {
  return orderItems.reduce((total, item) => total + item.total_amount, 0)
}

/**
 * Generates customer name with fallback
 */
export const generateCustomerName = (customerId: number): string => {
  return `Customer #${customerId}`
}

/**
 * Generates customer initials from name
 */
export const generateCustomerInitials = (name: string): string => {
  if (!name) return 'U'

  const nameParts = name.trim().split(' ')
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase()
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase()
}

/**
 * Transforms user data to customer info
 */
export const transformUserToCustomer = (user: User): CustomerInfo => {
  const fullPhone =
    user.country_code && user.phone_number
      ? `${user.country_code} ${user.phone_number}`
      : user.phone_number || ''

  return {
    id: user.id,
    name: user.name || user.username || `User #${user.id}`,
    phone: fullPhone,
    initials: generateCustomerInitials(user.name || user.username || ''),
  }
}

/**
 * Parse order items from string or return as-is if already an array
 * Handles JSON_ARRAYAGG string format from MySQL
 */
export const parseOrderItems = (items: any): any[] => {
  // If items is undefined or null, return empty array
  if (!items) {
    return []
  }

  // If it's already an array, return it
  if (Array.isArray(items)) {
    return items
  }

  // If it's a string, try to parse it
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.error('Failed to parse items JSON:', e)
      return []
    }
  }

  // If it's some other type, return empty array
  return []
}

/**
 * Transforms API order data to UI format
 * Handles both old flat structure and new grouped cart_id structure
 */
export const transformOrderData = (apiOrders: any[]): TransformedOrder[] => {
  if (!apiOrders || apiOrders.length === 0) {
    return []
  }
  if (!apiOrders || apiOrders.length === 0) {
    return []
  }
  // Check if this is the new grouped structure (has cart_id and items field)
  // items can be either a string (JSON from MySQL) or already parsed array
  const isGroupedStructure =
    apiOrders[0]?.cart_id && apiOrders[0]?.items !== undefined

  if (isGroupedStructure) {
    // New structure: Already grouped by cart_id with items as JSON array
    return apiOrders
      .map((order) => {
        // Parse items if it's a string (JSON_ARRAYAGG returns string)
        let items = order.items

        if (typeof items === 'string') {
          try {
            items = JSON.parse(items)
          } catch (e) {
            console.error('Failed to parse items JSON:', e)
            items = []
          }
        }
        // Ensure items is an array
        if (!Array.isArray(items)) {
          items = []
        }

        // Transform items to TransformedOrderItem format
        const transformedItems: TransformedOrderItem[] = items.map(
          (item: any) => {
            let addons = item.addons

            // Safe parse addons if it's a string
            if (typeof addons === 'string') {
              try {
                addons = JSON.parse(addons)
              } catch (e) {
                console.error('Failed to parse addons JSON:', e)
                addons = []
              }
            }

            return {
              name: item.item_name || `Item #${item.item_id}`,
              item_name: item.item_name,
              quantity: item.quantity || 1,
              price: item.price || 0,
              variant_name: item.variant_name,
              addons: Array.isArray(addons) ? addons : [],
            }
          },
        )

        return {
          id: order.cart_id,
          orderId: order.cart_id.toUpperCase(),
          status: mapOrderStatus(order.order_status),
          time: formatTimeFromUTC(order.created_at),
          date: formatDateFromUTC(order.created_at),
          customerId: order.customer_id,
          customerName:
            order.customer_name || generateCustomerName(order.customer_id),
          customerPhone: order.customer_phone || order.customer?.phone || 'N/A',
          items: transformedItems,
          totalAmount: parseFloat(order.total_amount) || 0,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
          paymentMethod: order.payment_method,
          deliveryType: order.delivery_type,
          specialInstructions: items[0]?.special_instructions || undefined,
          preparationTime: 0, // Not available in grouped structure
          tableNo: order.table_no,
          paymentStatus: order.payment_status,
          discountAmount: order.discount_amount || 0,
        }
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } else {
    // Old structure: Flat array that needs grouping by cart_id
    const groupedOrders = groupBy(apiOrders as ApiOrder[], 'cart_id')

    return Object.entries(groupedOrders)
      .map(([cartId, orderItems]) => {
        // Use the first item for order-level information
        const firstItem = orderItems[0]

        return {
          id: cartId,
          orderId: cartId.toUpperCase(),
          status: mapOrderStatus(firstItem.order_status),
          time: formatTimeFromUTC(firstItem.created_at),
          date: formatDateFromUTC(firstItem.created_at),
          customerId: firstItem.customer_id,
          customerName: generateCustomerName(firstItem.customer_id),
          customerPhone: firstItem.customer_phone || 'N/A',
          items: aggregateOrderItems(orderItems),
          totalAmount: calculateOrderTotal(orderItems),
          createdAt: new Date(firstItem.created_at),
          updatedAt: new Date(firstItem.updated_at),
          paymentMethod: firstItem.payment_method,
          deliveryType: firstItem.delivery_type,
          specialInstructions: firstItem.special_instructions || undefined,
          preparationTime: firstItem.preparation_time,
          tableNo: firstItem.table_no,
          paymentStatus: firstItem.payment_status,
        }
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort by newest first
  }
}

/**
 * Generates timeline steps based on order status and timestamps
 */
export const generateOrderTimeline = (order: TransformedOrder) => {
  const timeline = [
    {
      label: 'Placed',
      time: order.time,
      completed: true,
    },
  ]

  if (order.status === 'DELIVERED') {
    timeline.push({
      label: 'Delivered',
      time: formatTimeFromUTC(order.updatedAt.toISOString()),
      completed: true,
    })
  } else if (order.status === 'CANCELLED') {
    timeline.push({
      label: 'Cancelled',
      time: formatTimeFromUTC(order.updatedAt.toISOString()),
      completed: true,
    })
  }

  return timeline
}

/**
 * Calculates delivery time duration
 */
export const calculateDeliveryTime = (order: TransformedOrder): string => {
  if (order.status !== 'DELIVERED') {
    return order.status === 'CANCELLED'
      ? 'Order was cancelled'
      : 'Order in progress'
  }

  const createdTime = order.createdAt.getTime()
  const updatedTime = order.updatedAt.getTime()
  const diffMinutes = Math.round((updatedTime - createdTime) / (1000 * 60))

  if (diffMinutes < 60) {
    return `Delivered in ${diffMinutes} minutes`
  } else {
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `Delivered in ${hours}h ${minutes}m`
  }
}
