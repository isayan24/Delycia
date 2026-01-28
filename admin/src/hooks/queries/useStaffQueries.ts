import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import useToast from '@/hooks/UseToast'

export interface StaffMember {
  id: number
  uid: string
  name: string
  username?: string
  phone_number?: string
  role: number
  profile_pic?: string
  is_active?: number
  password?: string
}

// Fetch staff for a specific restaurant
export const useStaffQuery = () => {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  return useQuery({
    queryKey: ['staff', rid],
    queryFn: async () => {
      if (!rid) return []

      // Since we now have a direct server route that proxies to backend,
      // we can try using the proxy if available, or fall back to direct backend call
      // For now, let's assume direct backend call as per existing patterns in queries
      const response = await axios.get(`/api/users?rid=${rid}&exclude_role=1`)

      if (response.data?.statusCode === 200) {
        return response.data.message.users as StaffMember[]
      }
      return []
    },
    enabled: !!rid,
  })
}

// Create new staff
export const useCreateStaffMutation = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`/api/auth/create-admin`, {
        ...data,
        rid,
      })
      return response.data
    },
    onSuccess: () => {
      showSuccess('Success', 'Staff member created successfully')
      queryClient.invalidateQueries({ queryKey: ['staff', rid] })
    },
    onError: (error: any) => {
      console.error('Create staff error:', error)
      showError(
        'Error',
        error.response?.data?.message || 'Failed to create staff member',
      )
    },
  })
}

// Update staff details
export const useUpdateStaffMutation = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.patch(`/api/users`, data)
      return response.data
    },
    onSuccess: () => {
      showSuccess('Success', 'Staff member updated successfully')
      queryClient.invalidateQueries({ queryKey: ['staff', rid] })
    },
    onError: (error: any) => {
      console.error('Update staff error:', error)
      showError(
        'Error',
        error.response?.data?.message || 'Failed to update staff member',
      )
    },
  })
}

export const useDeleteStaffMutation = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  return useMutation({
    mutationFn: async (uid: string) => {
      const response = await axios.delete(`/api/users?uid=${uid}`)
      return response.data
    },
    onSuccess: () => {
      showSuccess('Success', 'Staff member deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['staff', rid] })
    },
    onError: (error: any) => {
      console.error('Delete staff error:', error)
      showError(
        'Error',
        error.response?.data?.message || 'Failed to delete staff member',
      )
    },
  })
}
