import axiosInstance from '@/lib/axios'
import axios from 'axios'

export interface UserCheckResponse {
  statusCode: number
  message: string
  user?: {
    id: number
    name?: string
    phone_number: string
    countryCode: string
  }
}

export interface UserExistenceResult {
  exists: boolean
  userData?: {
    id: string
    name?: string
    phone_number: string
  }
}

/**
 * Check if a user exists in the system by phone number
 * @param phoneNumber - Full phone number with country code (e.g., "917797655592")
 * @returns Promise<UserExistenceResult>
 */
export const checkUserExists = async (
  phoneNumber: string,
): Promise<UserExistenceResult> => {
  try {
    const phoneNumberFix = phoneNumber.replace('+', '')
    const response = await axiosInstance.get(
      `/users/check?phone_number=${phoneNumberFix}`,
      {
        timeout: 5000, // 5 second timeout
      },
    )

    const data: UserCheckResponse = response.data

    if (data.statusCode === 200 && data.user) {
      return {
        exists: true,
        userData: {
          id: data.user.id.toString(),
          name: data.user.name,
          phone_number: data.user.phone_number,
        },
      }
    } else {
      return {
        exists: false,
      }
    }
  } catch (error) {
    console.error('Error checking user existence:', error)

    // If it's a 400 status (user not found), treat as new user
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return {
        exists: false,
      }
    }

    // For other errors, throw to trigger fallback behavior
    throw new Error('Failed to check user existence')
  }
}
