import { ProcessedOrder } from '@/types/WebSocketOrder'

export interface BillItem {
  name: string
  quantity: number
  price: number
  variant_name?: string | null
  addons?: any[]
}

export interface BillData {
  orderId: string
  tableNo: string | number
  customerName: string
  customerPhone: string
  items: BillItem[]
  totalAmount: number
  discountAmount?: number
  orderDate: string
  paymentMethod: string
  paymentStatus: string
}

/**
 * Convert ProcessedOrder to BillData format for thermal printer
 */
export function orderToBillData(order: ProcessedOrder): BillData {
  const items: BillItem[] = order.items.map((item) => ({
    name: item.display_name || 'Unknown Item',
    quantity: item.quantity,
    price: item.total_amount,
    variant_name: null, // variant_name not available in ProcessedOrderItem
    addons: item.addons,
  }))

  // Format date to readable string
  const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Get table number(s)
  const tableNo =
    order.unique_table_numbers.length > 0
      ? order.unique_table_numbers.join(', ')
      : order.is_delivery
        ? 'Delivery'
        : 'Takeaway'

  return {
    orderId: order.id?.toString() || order.customer_id?.toString() || 'N/A',
    tableNo,
    customerName: order.customer_name || 'Guest',
    customerPhone: order.customer_phone || order.customer_phone_masked || 'N/A',
    items,
    totalAmount: order.total_amount,
    discountAmount: order.discount_amount,
    orderDate,
    paymentMethod: order.payment_method || 'N/A',
    paymentStatus: order.payment_status || 'Pending',
  }
}

/**
 * Placeholder function to share bill to customer's mobile number
 * Currently just logs the mobile number - will be implemented with actual sharing logic later
 */
export function handleShareToMobile(phoneNumber: string): void {
  console.log('📱 Share to Mobile - Phone Number:', phoneNumber)
  // TODO: Implement actual sharing logic (WhatsApp, SMS, etc.)
}
