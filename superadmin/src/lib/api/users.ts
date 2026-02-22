import { createServerFn } from '@tanstack/react-start'
import { withAuth } from '@/lib/withAuth'

export interface User {
  id: number
  uid: string
  name: string
  email: string | null
  username: string
  country_code: string
  phone_number: string
  profile_pic: string | null
  role: number
  register_at: string
  restaurant_ids: number[]
  restaurant_names: string[]
  status: 'active' | 'inactive'
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  restaurant_id?: string
  role?: string
  status?: string
  start_date?: string
  end_date?: string
}

export const getUsers = createServerFn({ method: 'GET' })
  .inputValidator((data: { data: UserFilters }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      const params = new URLSearchParams()

      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())
      if (data.search) params.append('search', data.search)
      if (data.restaurant_id) params.append('restaurant_id', data.restaurant_id)
      if (data.role) params.append('role', data.role)
      if (data.status) params.append('status', data.status)
      if (data.start_date) params.append('start_date', data.start_date)
      if (data.end_date) params.append('end_date', data.end_date)

      return axios.get(`/superadmin/users?${params.toString()}`)
    })
  })

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.post('/superadmin/users', data)
    })
  })

export const updateUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; updates: any }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.patch(`/superadmin/users/${data.id}`, data.updates)
    })
  })

export const deactivateUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.delete(`/superadmin/users/${data.id}`)
    })
  })

export const resetUserPassword = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.post(`/superadmin/users/${data.id}/reset-password`)
    })
  })

export const getUser = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.get(`/superadmin/users/${data.id}`)
    })
  })

export const getUserActivity = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string; page?: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      const params = new URLSearchParams()
      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())

      return axios.get(
        `/superadmin/users/${data.id}/activity?${params.toString()}`,
      )
    })
  })
