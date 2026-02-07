// Crypto signature types and interfaces

/**
 * Full order item structure as received from frontend
 */
export interface FullOrderItem {
  id: number
  rid: number
  category_id: number
  cost: number
  created_at: string
  description: string
  images: string[]
  is_veg: number
  name: string
  price: number
  quantity: number
  status: string
  stock: number
  totalPrice: number
  updated_at: string
  discount_amount?: number
  addons?: any[]
  [key: string]: any // Allow additional properties
}

/**
 * Simplified order item structure for API submission
 */
export interface OrderItem {
  rid: number // restaurant id
  customer_id: any
  item_id: number
  variant_id?: number | string
  quantity: string
  payment_method: string
  delivery_type: string
  discount_amount: number
  special_instructions: string
  total_amount: number
  party_size?: number
  addons?: any[]
}

/**
 * Customer details structure for authentication
 */
export interface CustomerDetails {
  [key: string]: any // Customer authentication data
}

/**
 * Input data for signature generation
 */
export interface SignatureInput {
  orderItems: OrderItem[]
}

/**
 * Configuration for signature generation
 */
export interface SignatureConfig {
  secretKey: string
  algorithm: string
}

/**
 * Signature service interface
 */
export interface SignatureService {
  /**
   * Generate HMAC SHA256 signature for order items
   * @param orderItems Array of order items to sign
   * @returns HMAC SHA256 signature string
   */
  generateOrderSignature(orderItems: OrderItem[]): string

  /**
   * Validate a signature against data
   * @param data Original data string
   * @param signature Signature to validate
   * @returns True if signature is valid
   */
  validateSignature(data: string, signature: string): boolean
}

/**
 * Waiter order request structure (as received from frontend)
 */
export interface WaiterOrderRequest {
  customerDetails?: CustomerDetails
  specialInstructions: string
  orderItems: FullOrderItem[]
  totalAmount: number
  token: any
  variantId?: number | string
  table?: any
  partySize?: number
  order_status?: string
}

/**
 * Signed order payload for API calls
 */
export interface SignedOrderPayload {
  orderItems: OrderItem[]
  customer_id?: string
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string
  alive: boolean
  time: string | null
  details?: {
    step: 'authentication' | 'signature' | 'api_call'
    message: string
  }
}

/**
 * Crypto configuration constants
 */
export interface CryptoConfig {
  SECRET_KEY: string
  SIGNATURE_HEADER: 'x-signature'
  ORDERS_ENDPOINT: '/orders'
}
