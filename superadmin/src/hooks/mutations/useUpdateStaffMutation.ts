import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStaff } from '@/lib/api/staff'
import type { StaffResponse } from '@/hooks/queries/useStaffQuery'

interface UpdateStaffData {
  id: number
  name?: string
  email?: string
  phone_number?: string
  role?: number
  password?: string
}

interface UpdateStaffResponse {
  status: boolean
  statusCode: number
  message: string
  data: any
}

async function updateStaffFn(data: UpdateStaffData): Promise<UpdateStaffResponse> {
  const { id, ...updates } = data
  const response = await updateStaff({ data: { id, updates } })
  const result = await response.json()
  return result
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateStaffFn,
    onMutate: async (updatedStaff: UpdateStaffData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'staff'] 
      })

      // Snapshot the previous value
      const previousStaff = queryClient.getQueriesData<StaffResponse>({ 
        queryKey: ['superadmin', 'staff'] 
      })

      // Optimistically update all staff queries
      queryClient.setQueriesData<StaffResponse>(
        { queryKey: ['superadmin', 'staff'] },
        (old: StaffResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((staff: any) =>
                staff.id === updatedStaff.id
                  ? { 
                      ...staff, 
                      ...updatedStaff,
                    }
                  : staff
              ),
            },
          }
        }
      )

      return { previousStaff }
    },
    onError: (_error: any, _updatedStaff: UpdateStaffData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousStaff) {
        context.previousStaff.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update staff:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'staff'] 
      })
    },
  })
}
