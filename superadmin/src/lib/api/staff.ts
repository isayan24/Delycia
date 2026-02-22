import { createServerFn } from '@tanstack/react-start'
import { withAuth } from '@/lib/withAuth'

export interface StaffMember {
  id: number
  name: string
  email: string
  phone_number: string
  role: number
  role_name: string
  restaurant_id: number
  restaurant_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffFilters {
  page?: number
  limit?: number
  search?: string
  restaurant_id?: string
  role?: string
  status?: string
}

export const getStaff = createServerFn({ method: 'GET' })
  .inputValidator((data: { data: StaffFilters }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      const params = new URLSearchParams()

      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())
      if (data.search) params.append('search', data.search)
      if (data.restaurant_id) params.append('restaurant_id', data.restaurant_id)
      if (data.role) params.append('role', data.role)
      if (data.status) params.append('status', data.status)

      return axios.get(`/superadmin/staff?${params.toString()}`)
    })
  })

export const getStaffMember = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.get(`/superadmin/staff/${data.id}`)
    })
  })

export const createStaff = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.post('/superadmin/staff', data)
    })
  })

export const updateStaff = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; updates: any }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.patch(`/superadmin/staff/${data.id}`, data.updates)
    })
  })

export const deactivateStaff = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.delete(`/superadmin/staff/${data.id}`)
    })
  })

export const getStaffActivity = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string; page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      const params = new URLSearchParams()
      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())

      return axios.get(
        `/superadmin/staff/${data.id}/activity?${params.toString()}`,
      )
    })
  })
