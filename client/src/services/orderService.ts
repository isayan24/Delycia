import axiosInstance from '@/lib/axios'
import { Order } from '@/types/Order'

// cleaned up unused functions

// Function to fetch orders for a customer
export const fetchOrders = async (
  customerId: string,
  token: string,
): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        customer_id: customerId,
      },
    })

    if (response.data?.statusCode === 200 && response.data?.orders) {
      return response.data.orders
    }
    return []
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}
