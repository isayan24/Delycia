// WebSocket Order Types - Based on actual data structure from WebSocket

export interface WebSocketOrderItem {
  id: number
  item_id: number
  display_name: string
  quantity: number
  order_status: string
  payment_status: string
  created_at: string
  updated_at?: string
  total_amount: number
  table_id: number
  table_display?: string // Zone-prefixed display (e.g., 'VIP-25')
  table_zone?: string
  table_number?: number
  special_instructions: string
  preparation_time?: number
  discount_amount?: number
  addons?: {
    name: string
    price: number
    quantity: number
  }[]
  formattedTime?: string
  dateAndTime?: string
}

export interface WebSocketOrder {
  customer_id: number
  name: string
  phone_number: string
  profile_pic: string
  username: string
  email: string
  created_at: string
  items: WebSocketOrderItem[]
  formattedTime?: string
  dateAndTime?: string
}

// Processed Order Types - For component consumption

export interface ProcessedOrderItem {
  id: number
  item_id: number
  display_name: string
  quantity: number
  total_amount: number
  order_status: string
  payment_status: string
  created_at: string
  updated_at?: string
  table_id: number
  table_display?: string // Zone-prefixed display (e.g., 'VIP-25')
  table_zone?: string
  table_number?: number
  special_instructions: string
  preparation_time?: number
  discount_amount?: number
  addons?: {
    name: string
    price: number
    quantity: number
  }[]
  formattedTime?: string
  dateAndTime?: string
}

export interface ProcessedOrder {
  id?: number // order id for API updates
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_phone_masked: string
  customer_profile_pic: string
  customer_username: string
  customer_email: string
  order_count: number
  created_at: string
  latest_created_at: string
  items: ProcessedOrderItem[]
  total_amount: number
  discount_amount?: number // Total discount applied to this order
  payment_status: string
  payment_method?: string
  order_status: string
  delivery_type: string
  table_id?: number
  table_display?: string // Zone-prefixed display (e.g., 'VIP-25')
  preparation_time: number // Make required
  original_preparation_time?: number // Store original for reference
  time_extended?: number // Track total time extensions
  preparation_started_at?: string // When order was accepted
  has_table_assignment: boolean
  is_delivery: boolean
  table_zone?: string // Zone name like 'Ground floor'
  unique_table_numbers: number[]
  formattedTime?: string
  dateAndTime?: string
}

// Utility Types

export interface OrderGrouping {
  [customer_id: number]: WebSocketOrder[]
}

export interface OrderProcessingResult {
  processedOrders: ProcessedOrder[]
  totalOrders: number
  totalCustomers: number
  errors: string[]
}

// Order Status Enums - matching your API
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  UPI = 'upi',
  CASH = 'cash',
  CARD = 'card',
  OTHERS = 'others',
}

export enum DeliveryType {
  DINE_IN = 'dine-in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}
