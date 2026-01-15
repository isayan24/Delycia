import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'

// Validation schema
const updateOrderSchema = z.object({
  token: z.string(),
  order_item_ids: z.array(z.string()),
  order_status: z.string(),
  preparation_time: z.number().optional(),
})

// Server Function
export const updateOrders = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof updateOrderSchema> }) => {
  const validated = updateOrderSchema.parse(data)
  const { token, order_item_ids, order_status, preparation_time } = validated

  if (!token) {
    throw new Error('Access token is required')
  }

  if (!order_item_ids || order_item_ids.length === 0) {
    throw new Error('Order item IDs are required')
  }

  try {
    // Update each order item
    for (const order_id of order_item_ids) {
      const submitData = {
        id: order_id,
        order_status,
        preparation_time,
      }

      await axiosInstance.patch(`/admin/orders`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    return {
      status: 200,
      message: 'Order updated successfully',
      success: true,
    }
  } catch (error) {
    throw new Error(
      `Error updating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
})
