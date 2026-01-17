import axios from 'axios'

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
   * Uses httpOnly cookies for authentication via server route
   */
  acceptOrder: async (request: AcceptOrderRequest) => {
    try {
      const response = await axios.post(
        '/api/orders/actions?action=accept',
        {
          orderId: request.orderId,
          preparationTime: request.preparationTime,
          restaurantId: request.restaurantId,
        },
        {
          withCredentials: true,
        },
      )

      return response.data
    } catch (error) {
      console.error('Failed to accept order:', error)
      throw error
    }
  },

  /**
   * Reject an order
   * Uses httpOnly cookies for authentication via server route
   */
  rejectOrder: async (request: RejectOrderRequest) => {
    try {
      const response = await axios.post(
        '/api/orders/actions?action=reject',
        {
          orderId: request.orderId,
          reason: request.reason || 'Order rejected by admin',
          restaurantId: request.restaurantId,
        },
        {
          withCredentials: true,
        },
      )

      return response.data
    } catch (error) {
      console.error('Failed to reject order:', error)
      throw error
    }
  },

  /**
   * Update order preparation time
   * Uses httpOnly cookies for authentication via server route
   */
  updatePreparationTime: async (
    orderId: string | number,
    preparationTime: number,
  ) => {
    try {
      const response = await axios.post(
        '/api/orders/actions?action=update-time',
        {
          orderId,
          preparationTime,
        },
        {
          withCredentials: true,
        },
      )

      return response.data
    } catch (error) {
      console.error('Failed to update preparation time:', error)
      throw error
    }
  },
}
