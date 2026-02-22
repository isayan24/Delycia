import { createServerFn } from '@tanstack/react-start'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { z } from 'zod'

export interface DashboardStats {
  total_restaurants: number
  active_restaurants: number
  total_subscriptions: number
  active_subscriptions: number
  total_users: number
  total_staff: number
  total_revenue: number
  monthly_revenue: number
}

export interface DashboardActivity {
  id: number
  type: string
  description: string
  timestamp: string
  restaurant_name?: string
  user_name?: string
}

export interface DashboardFilters {
  start_date?: string
  end_date?: string
  restaurant_id?: string
}

const dashboardFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  restaurant_id: z.string().optional(),
})

export const getDashboardStats = createServerFn({ method: 'GET' })
  .inputValidator((data: DashboardFilters) =>
    dashboardFiltersSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      const params = new URLSearchParams()
      if (data.start_date) params.append('start_date', data.start_date)
      if (data.end_date) params.append('end_date', data.end_date)
      if (data.restaurant_id) params.append('restaurant_id', data.restaurant_id)

      const response = await axios.get(
        `/superadmin/dashboard/stats?${params.toString()}`,
      )
      return jsonResponse(response.data, 200, headers)
    })
  })

export const getDashboardActivity = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; limit?: number }) =>
    z
      .object({ page: z.number().optional(), limit: z.number().optional() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      const params = new URLSearchParams()
      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())

      const response = await axios.get(
        `/superadmin/dashboard/activity?${params.toString()}`,
      )
      return jsonResponse(response.data, 200, headers)
    })
  })

export const getDashboardAnalytics = createServerFn({ method: 'GET' })
  .inputValidator((data: DashboardFilters) =>
    dashboardFiltersSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      const params = new URLSearchParams()
      if (data.start_date) params.append('start_date', data.start_date)
      if (data.end_date) params.append('end_date', data.end_date)

      const response = await axios.get(
        `/superadmin/dashboard/analytics?${params.toString()}`,
      )
      return jsonResponse(response.data, 200, headers)
    })
  })

export const getRestaurantMetrics = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) =>
    z.object({ id: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      const response = await axios.get(
        `/superadmin/dashboard/restaurants/${data.id}/metrics`,
      )
      return jsonResponse(response.data, 200, headers)
    })
  })
