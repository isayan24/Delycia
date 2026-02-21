import { User } from './User'
import { FoodItem } from './FoodItem'

export interface OrderItem {
  id?: string
  item_id: string | number
  name: string
  price: number
  quantity: number
  estimateTime?: string
  image?: string
  foodDetails?: FoodItem
}

export interface Order {
  id: number | string
  cart_id?: string
  customer_id: number | string
  item_id: number | string
  quantity: number
  order_status: string
  payment_status: string
  ordered_on: string
  total_amount: number
  created_at: string
  updated_at: string
  tableNumber?: string
  items?: OrderItem[]
  rid?: number | string
  // Formatted time fields
  ordered_on_ist?: string
  created_at_ist?: string
  updated_at_ist?: string
  // Customer info
  customer?: User
  // Food details
  foodDetails?: Partial<FoodItem>
  // Addons
  addons?: {
    name: string
    price: number
    quantity: number
  }[]
  payment_method?: string
  delivery_type?: string
}

/**
 * Represents a group of orders that share the same cart_id
 * Used for displaying consolidated orders to users
 */
export interface GroupedUserOrder {
  cart_id: string
  orders: Order[]
  totalAmount: number
  orderCount: number
  createdAt: Date
  // The most "urgent" status in the group (pending > processing > ready > completed/cancelled)
  aggregatedStatus: string
  // Count of orders by status within this group
  statusCounts: Record<string, number>
}

export interface GroupedOrder {
  date: string
  customer_id: string | number
  orders: Order[]
  totalAmount: number
  orderCount: number
  latestOrderTime: string
  customer?: User
  // Timestamp for more precise sorting/identification
  timestamp?: number
}
