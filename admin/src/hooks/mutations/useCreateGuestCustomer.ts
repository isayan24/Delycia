import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface GuestCustomerResponse {
  success: boolean
  data: {
    id: number
    uid: string
    name: string
    username: string
    phone_number: string
  }
}

export const useCreateGuestCustomer = () => {
  return useMutation({
    mutationFn: async (): Promise<GuestCustomerResponse> => {
      const response = await axios.post<GuestCustomerResponse>(
        '/api/guest-customer',
      )
      return response.data
    },
    // Don't show toast here - let the calling component handle it
  })
}
