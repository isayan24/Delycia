import axiosInstance from '@/lib/axios'

export interface AcceptOrderRequest {
  orderId: string | number
  preparationTime: number
  restaurantId?: string | number
}

export interface RejectOrderRequest {
  orderId: string | number
  reason?: string
  restaurantId?: string | number
}

export const orderPopupService = {
  /**
   * Accept an order with preparation time
   * Uses httpOnly cookies for authentication
   */
  acceptOrder: async (request: AcceptOrderRequest) => {
    try {
      const response = await axiosInstance.post('/admin/orders/accept', {
        order_id: request.orderId,
        preparation_time: request.preparationTime,
        rid: request.restaurantId,
      })

      return response.data
    } catch (error) {
      console.error('Failed to accept order:', error)
      throw error
    }
  },

  /**
   * Reject an order
   * Uses httpOnly cookies for authentication
   */
  rejectOrder: async (request: RejectOrderRequest) => {
    try {
      const response = await axiosInstance.post('/admin/orders/reject', {
        order_id: request.orderId,
        reason: request.reason || 'Order rejected by admin',
        rid: request.restaurantId,
      })

      return response.data
    } catch (error) {
      console.error('Failed to reject order:', error)
      throw error
    }
  },

  /**
   * Update order preparation time
   * Uses httpOnly cookies for authentication
   */
  updatePreparationTime: async (
    orderId: string | number,
    preparationTime: number,
  ) => {
    try {
      const response = await axiosInstance.put(
        `/admin/orders/${orderId}/preparation-time`,
        {
          preparation_time: preparationTime,
        },
      )

      return response.data
    } catch (error) {
      console.error('Failed to update preparation time:', error)
      throw error
    }
  },
}
