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
   */
  acceptOrder: async (request: AcceptOrderRequest, accessToken: string) => {
    try {
      const response = await axiosInstance.post('/admin/orders/accept', {
        order_id: request.orderId,
        preparation_time: request.preparationTime,
        rid: request.restaurantId
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Failed to accept order:', error)
      throw error
    }
  },

  /**
   * Reject an order
   */
  rejectOrder: async (request: RejectOrderRequest, accessToken: string) => {
    try {
      const response = await axiosInstance.post('/admin/orders/reject', {
        order_id: request.orderId,
        reason: request.reason || 'Order rejected by admin',
        rid: request.restaurantId
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Failed to reject order:', error)
      throw error
    }
  },

  /**
   * Update order preparation time
   */
  updatePreparationTime: async (orderId: string | number, preparationTime: number, accessToken: string) => {
    try {
      const response = await axiosInstance.put(`/admin/orders/${orderId}/preparation-time`, {
        preparation_time: preparationTime
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Failed to update preparation time:', error)
      throw error
    }
  }
}