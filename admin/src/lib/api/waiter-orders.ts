import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'
import signatureService from '../crypto/signatureService'
import cryptoConfig from '../crypto/config'
import logger from '../logger'

// Validation schemas
const orderItemSchema = z.object({
  rid: z.string(),
  id: z.string(),
  variantId: z.string().or(z.number()).optional(),
  quantity: z.number(),
  totalPrice: z.number(),
})

const customerDetailsSchema = z.object({
  name: z.string().optional(),
  phone_number: z.string().optional(),
  rid: z.string().optional(),
})

const tableSchema = z.object({
  id: z.string(),
  table_number: z.number(),
  zone: z.string(),
  capacity: z.number(),
})

const waiterOrderSchema = z.object({
  customerDetails: customerDetailsSchema,
  specialInstructions: z.string().optional(),
  orderItems: z.array(orderItemSchema),
  token: z.string(),
  table: tableSchema.optional(),
})

// Server Function
export const createWaiterOrder = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof waiterOrderSchema> }) => {
  const validated = waiterOrderSchema.parse(data)
  const { customerDetails, specialInstructions, orderItems, token, table } =
    validated

  let customer_id: string | undefined

  // Validate order items
  if (!orderItems || orderItems.length === 0) {
    throw new Error('Invalid order items: must be a non-empty array')
  }

  // Authenticate customer
  if (customerDetails) {
    try {
      const authResponse = await axiosInstance.post(
        '/admin/auth/waiter-auth',
        customerDetails,
      )
      customer_id = authResponse.data.id
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
      variant_id: item?.variantId || 0,
      quantity: item.quantity.toString(),
      payment_method: 'cash',
      delivery_type: 'dine-in',
      discount_amount: 0,
      special_instructions: specialInstructions || '',
      total_amount: item.totalPrice,
      table_no: table?.table_number || 0,
    }))

    // Generate signature
    const signature = signatureService.generateOrderSignature(
      transformedOrderItems,
    )

    // Create order
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

    // Update table status if order successful
    if (table && ordersResponse.status === 201) {
      const tableData = {
        id: table.id,
        zone: table.zone,
        status: 'occupied',
        capacity: table.capacity,
      }
      try {
        await axiosInstance.patch(`/admin/tables/`, tableData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Error updating table:', error)
      }
    }

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
