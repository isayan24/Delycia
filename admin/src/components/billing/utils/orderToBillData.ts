import { ProcessedOrder } from '@/types/WebSocketOrder'
import { BillData, BillItem } from '../types'
import { formatOrderDateTime } from '@/components/admin/orders/utils/orderProcessing'

/**
 * Convert ProcessedOrder to BillData format for thermal printer
 */
export function orderToBillData(
  order: ProcessedOrder,
  restaurantName: string,
): BillData {
  const items: BillItem[] = order.items.map((item) => ({
    name: item.display_name || 'Unknown Item',
    quantity: item.quantity,
    price: item.total_amount,
    variant_name: null,
    addons: item.addons,
  }))

  // Format date to readable string
  const orderDate = order.dateAndTime || formatOrderDateTime(order.created_at)

  // Get table number(s)
  const tableNo =
    order.unique_table_numbers.length > 0
      ? order.unique_table_numbers.join(', ')
      : order.is_delivery
        ? 'N/A'
        : 'Takeaway'

  return {
    orderId: order.id?.toString() || order.customer_id?.toString() || 'N/A',
    restaurantName,
    tableNo,
    tableZone: order.table_zone,
    customerName: order.customer_name || 'Guest',
    customerPhone: order.customer_phone || order.customer_phone_masked || 'N/A',
    items,
    totalAmount: order.total_amount,
    discountAmount: order.discount_amount,
    orderDate,
    paymentMethod: order.payment_method || 'N/A',
    paymentStatus: order.payment_status || 'Pending',
    specialInstructions: order.items[0]?.special_instructions || undefined,
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
