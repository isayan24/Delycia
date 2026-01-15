// getUser.ts - Fetch current user data from backend
import axiosInstance from '@/lib/axios'

// User data structure returned from backend
export interface UserResponse {
  statusCode: number
  message?: string
  user?: {
    id: number
    uid: string
    username?: string
    phone_number?: string
    profile_pic?: string
    role?: number
    restaurant_rids?: number[]
    selected_rid?: number | null
  }
}

/**
 * Fetch current user data from backend
 * Uses httpOnly cookies automatically - no token needed!
 *
 * @returns User data or null if request fails
 */
export const getUser = async (): Promise<UserResponse | null> => {
  try {
    // No need for Authorization header - axios automatically includes httpOnly cookies
    const response = await axiosInstance.get<UserResponse>('/users', {
      // Ensure credentials are sent (httpOnly cookies)
      withCredentials: true,
    })

    return response.data
  } catch (error: any) {
    console.error(
      'Failed to fetch user data:',
      error?.response?.data || error.message,
    )

    // Return null for failed requests (e.g., 401, 403, 500)
    return null
  }
}
