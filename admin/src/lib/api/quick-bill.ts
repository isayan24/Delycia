import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'
import cryptoConfig from '../crypto/config'
import signatureService from '../crypto/signatureService'
import logger from '../logger-dynamic'

// Validation schemas
const orderItemSchema = z.object({
  rid: z.string(),
  id: z.string(),
  quantity: z.number(),
  order_status: z.string().optional(),
  variantId: z.string().or(z.number()).optional(),
  payment_method: z.string().optional(),
  special_instructions: z.string().optional(),
  delivery_type: z.string().optional(),
  discount_amount: z.number().optional(),
  totalItemAmount: z.number(),
  table_no: z.number().optional(),
})

const customerDetailsSchema = z.object({
  name: z.string().optional(),
  phone_number: z.string().optional(),
  rid: z.string().optional(),
})

const quickBillSchema = z.object({
  customerDetails: customerDetailsSchema.optional(),
  orderItems: z.array(orderItemSchema),
  token: z.string(),
})

// Server Function
export const createQuickBill = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof quickBillSchema> }) => {
  const validated = quickBillSchema.parse(data)
  const { customerDetails, orderItems, token } = validated

  let customer_id: string | undefined

  // Validate order items
  if (!orderItems || orderItems.length === 0) {
    throw new Error('Invalid order items: must be a non-empty array')
  }

  // Authenticate/Create customer
  if (customerDetails) {
    try {
      const authResponse = await axiosInstance.post(
        '/admin/auth/waiter-auth',
        customerDetails,
      )
      customer_id = authResponse.data.id || authResponse.data.data?.id
    } catch (error) {
      logger.error('Customer authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new Error('Customer authentication failed')
    }
  }

  if (!customer_id) {
    throw new Error('Customer authentication required')
  }

  try {
    const transformedOrderItems = orderItems.map((item: any) => ({
      rid: item.rid,
      customer_id: customer_id,
      item_id: item.id,
      order_status: item.order_status || 'completed',
      variant_id: item?.variantId || 0,
      quantity: item.quantity.toString(),
      payment_method: item.payment_method || 'cash',
      special_instructions: item.special_instructions || '',
      delivery_type: item.delivery_type || 'takeaway',
      discount_amount: item.discount_amount || 0,
      total_amount: item.totalItemAmount,
      table_no: item.table_no || 0,
    }))

    // Generate signature
    const signature = signatureService.generateOrderSignature(
      transformedOrderItems,
    )

    // Make signed API call
    const ordersResponse = await axiosInstance.post(
      cryptoConfig.getOrdersEndpoint(),
      transformedOrderItems,
      {
        headers: {
          [cryptoConfig.getSignatureHeader()]: signature,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return {
      success: true,
      alive: true,
      order_id: ordersResponse.data?.order_id,
      customer_id,
      signature: signature.substring(0, 20) + '...',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Pushing order to db failed: ${errorMessage}`)
  }
})
