import { User } from '@/types/user.types'
import { formatDateTime, formatTimeNew } from '@/utils/dateUtils'

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
  restaurant_id?: number
  special_instructions: string | null
  table_no: number
  table_number?: number
  total_amount: number
  variant_id: number
  customer_phone: string
  customer_email?: string
  delivery_fee?: number
  grand_total?: number
  table_zone?: string
  delivery_address?: string
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
  dateAndTime: string
  startDate: string
  endDate: string
  customerName: string
  customerPhone: string
  customer?: CustomerInfo
  items: TransformedOrderItem[]
  totalAmount: number // This is the subtotal (pre-tax)
  discountAmount?: number
  rid?: number // Restaurant ID
  createdAt: Date
  updatedAt: Date
  paymentMethod: string
  deliveryType: string
  specialInstructions?: string
  preparationTime: number
  tableNo: number | string
  tableZone?: string
  paymentStatus: string
  deliveryFee?: number
  grandTotal?: number
  customerEmail?: string
  deliveryAddress?: string
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

// review

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
          dateAndTime: formatDateTime(order.created_at),
          startDate: formatTimeNew(order.created_at),
          endDate: formatTimeNew(order.updated_at),
          customerId: order.customer_id,
          customerName:
            order.customer_name || generateCustomerName(order.customer_id),
          customerPhone: order.customer_phone || order.customer?.phone || 'N/A',
          items: transformedItems,
          totalAmount: parseFloat(order.total_amount) || 0,
          rid: order.rid || order.restaurant_id,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
          paymentMethod: order.payment_method,
          deliveryType: order.delivery_type,
          specialInstructions: items[0]?.special_instructions || undefined,
          preparationTime: 0, // Not available in grouped structure
          tableNo: order.table_number || order.table_no,
          paymentStatus: order.payment_status,
          discountAmount: parseFloat(order.discount_amount) || 0,
          tableZone: order.table_zone,
          deliveryFee: parseFloat(order.delivery_fee) || 0,
          grandTotal: parseFloat(order.grand_total) || 0,
          customerEmail:
            order.customer_email || order.customer?.email || undefined,
          deliveryAddress: order.delivery_address,
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
          dateAndTime: formatDateTime(firstItem.created_at),
          startDate: formatTimeNew(firstItem.created_at),
          endDate: formatTimeNew(firstItem.updated_at),
          customerId: firstItem.customer_id,
          customerName: generateCustomerName(firstItem.customer_id),
          customerPhone: firstItem.customer_phone || 'N/A',
          items: aggregateOrderItems(orderItems),
          totalAmount: calculateOrderTotal(orderItems),
          rid: firstItem.rid || firstItem.restaurant_id,
          createdAt: new Date(firstItem.created_at),
          updatedAt: new Date(firstItem.updated_at),
          paymentMethod: firstItem.payment_method,
          deliveryType: firstItem.delivery_type,
          specialInstructions: firstItem.special_instructions || undefined,
          preparationTime: firstItem.preparation_time,
          tableNo: firstItem.table_number || firstItem.table_no,
          tableZone: firstItem.table_zone,
          paymentStatus: firstItem.payment_status,
          discountAmount: firstItem.discount_amount || 0,
          deliveryFee: firstItem.delivery_fee || 0,
          grandTotal: firstItem.grand_total || 0,
          customerEmail: firstItem.customer_email || 'No email provided',
          deliveryAddress: firstItem.delivery_address,
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
      time: order.startDate,
      completed: true,
    },
  ]

  if (order.status === 'DELIVERED') {
    timeline.push({
      label: 'Delivered',
      time: order.endDate,
      completed: true,
    })
  } else if (order.status === 'CANCELLED') {
    timeline.push({
      label: 'Cancelled',
      time: order.endDate,
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
