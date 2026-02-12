import {
  WebSocketOrder,
  ProcessedOrder,
  ProcessedOrderItem,
  OrderGrouping,
  OrderProcessingResult,
  PaymentStatus,
  DeliveryType,
  OrderStatus,
} from '@/types/WebSocketOrder'
import { formatDateTime, formatTimeNew } from '@/utils/dateUtils'

/**
 * Groups orders by customer_id (needed for processWebSocketOrders)
 */
function groupOrdersByCustomer(orders: WebSocketOrder[]): OrderGrouping {
  const groupedOrders = orders.reduce((groups: OrderGrouping, order) => {
    const customerId = order.customer_id
    if (!groups[customerId]) {
      groups[customerId] = []
    }
    groups[customerId].push(order)
    return groups
  }, {})
  return groupedOrders
}

/**
 * Calculates total amount from processed order items (needed for processWebSocketOrders)
 */
function calculateOrderTotals(items: ProcessedOrderItem[]): number {
  return items.reduce((total, item) => total + item.total_amount, 0)
}

/**
 * Calculates aggregated discount amount from processed order items
 */
function calculateTotalDiscount(items: ProcessedOrderItem[]): number {
  return items.reduce((total, item) => {
    const discount = parseFloat(String(item.discount_amount || 0))
    return total + discount
  }, 0)
}

/**
 * Calculates aggregated tax amount and average tax percent from processed order items
 */
// function calculateTaxTotals(items: ProcessedOrderItem[]): {
//   tax_amount: number
//   tax_percent: number
// } {
//   const totalTaxAmount = items.reduce((total, item) => {
//     const tax = parseFloat(String(item.tax_amount || 0))
//     return total + tax
//   }, 0)

//   // Calculate average tax percent (weighted by tax amount)
//   const itemsWithTax = items.filter(
//     (item) => item.tax_percent && item.tax_amount,
//   )
//   const avgTaxPercent =
//     itemsWithTax.length > 0
//       ? itemsWithTax.reduce(
//           (sum, item) => sum + (parseFloat(String(item.tax_percent)) || 0),
//           0,
//         ) / itemsWithTax.length
//       : 0

//   return {
//     tax_amount: totalTaxAmount,
//     tax_percent: avgTaxPercent,
//   }
// }

/**
 * Masks phone number for privacy (needed for processWebSocketOrders)
 */
function formatPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return phone

  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return phone

  const start = digits.slice(0, 2)
  const end = digits.slice(-2)
  const middle = '*'.repeat(Math.max(0, digits.length - 4))

  return `${start}${middle}${end}`
}

/**
 * Determines the overall payment status for grouped orders (needed for processWebSocketOrders)
 */
function getGroupPaymentStatus(items: ProcessedOrderItem[]): string {
  if (!items.length) return PaymentStatus.PENDING

  const statuses = items.map((item) => item.payment_status.toLowerCase())

  if (statuses.every((status) => status === PaymentStatus.COMPLETED)) {
    return PaymentStatus.COMPLETED
  }

  return PaymentStatus.PENDING
}

/**
 * Determines delivery type based on table number (needed for processWebSocketOrders)
 */
function getDeliveryType(table_no: number): string {
  if (!table_no || table_no === 0) {
    return DeliveryType.DELIVERY
  }
  return DeliveryType.DINE_IN
}

/**
 * Calculates order preparation time from individual items (needed for processWebSocketOrders)
 */
function calculateOrderPreparationTime(items: ProcessedOrderItem[]): number {
  const preparationTimes = items
    .map((item) => item.preparation_time)
    .filter((time): time is number => time !== undefined && time > 0)

  return preparationTimes.length > 0 ? Math.max(...preparationTimes) : 30
}

/**
 * Gets unique table numbers from order items (needed for processWebSocketOrders)
 */

/**
 * Groups items by their created_at timestamp (needed for processWebSocketOrders)
 */
function groupItemsByOrderTime(items: any[]): {
  [timestamp: string]: any[]
} {
  return items.reduce((groups: { [timestamp: string]: any[] }, item) => {
    const timestamp = item.created_at
    if (!groups[timestamp]) {
      groups[timestamp] = []
    }
    groups[timestamp].push(item)
    return groups
  }, {})
}

/**
 * Converts UTC time to Indian Standard Time (IST)
 * IST is UTC+5:30
 */
export function convertUTCToIST(dateString: string): Date {
  try {
    // Parse the UTC date
    const utcDate = new Date(dateString)

    // Add 5 hours and 30 minutes to convert UTC to IST
    const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds
    const istDate = new Date(utcDate.getTime() + istOffset)

    return istDate
  } catch (error) {
    console.error('Error converting UTC to IST:', error)
    return new Date(dateString) // Fallback to original date
  }
}

/**
 * Formats date/time for order display in IST
 */
export function formatOrderTime(dateString: string): string {
  try {
    // Convert UTC to IST first
    const istDate = convertUTCToIST(dateString)

    // Format the IST time
    return istDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    console.error('Error formatting order time:', error)
    return dateString
  }
}
export function formatOrderDateTime(dateString: string): string {
  try {
    // Convert UTC to IST first
    const istDate = convertUTCToIST(dateString)

    // Format the IST time
    return istDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    console.error('Error formatting order time:', error)
    return dateString
  }
}

/**
 * Formats date for order display in IST
 */

/**
 * Calculates remaining time for order acceptance (5 minutes from order placement)
 */
export function calculateAcceptanceCountdown(orderTime: string): {
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
} {
  try {
    const orderDate = convertUTCToIST(orderTime)
    const now = new Date()

    // Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor(
      (now.getTime() - orderDate.getTime()) / 1000,
    )
    const acceptanceTimeLimit = 5 * 60 // 5 minutes in seconds
    const remainingSeconds = Math.max(0, acceptanceTimeLimit - elapsedSeconds)

    return {
      minutes: Math.floor(remainingSeconds / 60),
      seconds: remainingSeconds % 60,
      totalSeconds: remainingSeconds,
      isExpired: remainingSeconds <= 0,
    }
  } catch (error) {
    console.error('Error calculating acceptance countdown:', error)
    return { minutes: 5, seconds: 0, totalSeconds: 300, isExpired: false }
  }
}

/**
 * Formats acceptance countdown as MM:SS
 */
export function formatAcceptanceCountdown(countdown: {
  minutes: number
  seconds: number
}): string {
  const { minutes, seconds } = countdown
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Checks if an order is from the past 24 hours
 */
export function isOrderFromPast24Hours(orderTime: string): boolean {
  try {
    const orderDate = convertUTCToIST(orderTime)
    const now = new Date()

    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - orderDate.getTime()

    // Convert to hours (24 hours = 24 * 60 * 60 * 1000 milliseconds)
    const diffInHours = diffInMs / (1000 * 60 * 60)

    return diffInHours <= 24
  } catch (error) {
    console.error('Error checking if order is from past 24 hours:', error)
    return false
  }
}

/**
 * Processes raw WebSocket orders into component-ready format
 * Groups by customer first, then by order time to create separate orders for different timestamps
 */
export function processWebSocketOrders(
  orders: WebSocketOrder[],
): OrderProcessingResult {
  const errors: string[] = []
  const processedOrders: ProcessedOrder[] = []

  try {
    // Group orders by customer
    const groupedOrders = groupOrdersByCustomer(orders)

    // Process each customer group
    Object.entries(groupedOrders).forEach(([customerIdStr, customerOrders]) => {
      try {
        const customerId = parseInt(customerIdStr)

        // Use the first order for customer info (should be same across all orders)
        const firstOrder = customerOrders[0]

        // Collect all items from all orders for this customer
        const allItems: any[] = []

        customerOrders.forEach((order: WebSocketOrder) => {
          // Handle both string and array formats for items
          const items =
            typeof order.items === 'string'
              ? JSON.parse(order.items)
              : order.items
          items.forEach((item: any) => {
            allItems.push({
              ...item,
              formattedTime: formatOrderTime(item.created_at),
              dateAndTime: formatOrderDateTime(item.created_at),
            })
          })
        })
        // Group items by their created_at timestamp (order time)
        const itemsByOrderTime = groupItemsByOrderTime(allItems)

        // Create separate ProcessedOrder for each order time
        Object.entries(itemsByOrderTime).forEach(
          ([orderTime, timeGroupedItems]) => {
            const processedItems: ProcessedOrderItem[] = timeGroupedItems.map(
              (item: any) => ({
                id: item.id,
                item_id: item.item_id,
                display_name: item.display_name,
                quantity: item.quantity,
                total_amount: item.total_amount,
                order_status: item.order_status,
                payment_status: item.payment_status,
                created_at: item.created_at,
                updated_at: item.updated_at,
                table_id: item.table_id || item.table_no || 0,
                table_zone: item.table_zone,
                table_number: item.table_number,
                special_instructions: item.special_instructions || '',
                preparation_time: item.preparation_time,
                discount_amount: item.discount_amount,
                // tax_percent: item.tax_percent,
                // tax_amount: item.tax_amount,
                addons: item.addons,
                formattedTime: item.formattedTime,
                dateAndTime: item.dateAndTime,
              }),
            )

            // Calculate totals and metadata for this specific order time
            const totalAmount = calculateOrderTotals(processedItems)
            const totalDiscount = calculateTotalDiscount(processedItems)
            // const { tax_amount, tax_percent } =
            // calculateTaxTotals(processedItems)
            const paymentStatus = getGroupPaymentStatus(processedItems)
            // Get unique table IDs
            const uniqueTableIds = processedItems
              .map((item) => item.table_id)
              .filter((id) => id && id > 0)

            // Get visual table numbers for display
            const visualTableNumbers = processedItems
              .map((item) => item.table_number)
              .filter((num): num is number => !!num && num > 0)
            const uniqueVisualTableNumbers = [...new Set(visualTableNumbers)]
            const uniqueTableNumbers = [...new Set(uniqueTableIds)] // Fallback

            const hasTableAssignment = uniqueTableIds.length > 0
            const isDelivery = !hasTableAssignment

            // Get table ID from first item
            const tableId = processedItems[0]?.table_id || 0
            const deliveryType = getDeliveryType(tableId)
            const orderStatus =
              processedItems[0]?.order_status || OrderStatus.PENDING // Derive from the first item
            const preparationTime =
              calculateOrderPreparationTime(processedItems)

            const processedOrder: ProcessedOrder = {
              customer_id: customerId,
              customer_name: firstOrder.name,
              customer_phone: firstOrder.phone_number,
              customer_phone_masked: formatPhoneNumber(firstOrder.phone_number),
              customer_profile_pic: firstOrder.profile_pic,
              customer_username: firstOrder.username,
              customer_email: firstOrder.email,
              order_count: 1, // Each time-grouped order is counted as 1
              created_at: orderTime,
              latest_created_at: orderTime,
              items: processedItems,
              total_amount: totalAmount,
              discount_amount: totalDiscount > 0 ? totalDiscount : undefined,
              // tax_percent: tax_percent > 0 ? tax_percent : undefined,
              // tax_amount: tax_amount > 0 ? tax_amount : undefined,
              payment_status: paymentStatus,
              order_status: orderStatus, // Use the derived order status
              delivery_type: deliveryType,
              table_id: tableId > 0 ? tableId : undefined,
              has_table_assignment: hasTableAssignment,
              is_delivery: isDelivery,
              unique_table_numbers:
                uniqueVisualTableNumbers.length > 0
                  ? uniqueVisualTableNumbers
                  : uniqueTableNumbers,
              preparation_time: preparationTime,
              table_zone: processedItems[0]?.table_zone,
              formattedTime: processedItems[0]?.formattedTime,
              dateAndTime: processedItems[0]?.dateAndTime,
            }

            processedOrders.push(processedOrder)
          },
        )
      } catch (error) {
        const errorMsg = `Error processing customer ${customerIdStr}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg, error)
      }
    })

    // Sort by order time (most recent first)
    processedOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  } catch (error) {
    const errorMsg = `Error processing orders: ${error instanceof Error ? error.message : 'Unknown error'}`
    errors.push(errorMsg)
    console.error(errorMsg, error)
  }

  return {
    processedOrders,
    totalOrders: orders.length,
    totalCustomers: processedOrders.length,
    errors,
  }
}
