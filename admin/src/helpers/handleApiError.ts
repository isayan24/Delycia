import { ApiResponse } from '@/types/apiResponse.types'
import { AxiosError } from 'axios'

export const handleApiError = (
  error: unknown,
  operation: string,
): ApiResponse => {
  console.error(`Error ${operation} inventory item:`, error)

  // Type guard for Axios errors
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 500
    const message =
      error.response?.data?.message || `Error ${operation} food item`

    return {
      status: statusCode,
      message,
      error: true,
    }
  }

  // Handle other types of errors
  const message =
    error instanceof Error ? error.message : `Error ${operation} food item`
  return {
    status: 500,
    message,
    error: true,
  }
}
