import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStaff } from '@/lib/api/staff'
import type { StaffFormData } from '@/schemas/staffSchema'

interface CreateStaffResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    id: number
    name: string
    email: string
    phone_number: string
    role: number
    restaurant_id: number
    is_active: boolean
    created_at: string
  }
}

async function createStaffFn(data: StaffFormData): Promise<CreateStaffResponse> {
  const response = await createStaff({ data })
  const result = await response.json()
  return result
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStaffFn,
    onSuccess: (response) => {
      // Invalidate all staff queries to refetch with the new staff member
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'staff'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to create staff:', error)
    },
  })
}
