 
import axiosInstance from '@/lib/axios'

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

export const getDashboardStats = async (filters?: DashboardFilters) => {
  const params = new URLSearchParams()
  
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)
  if (filters?.restaurant_id) params.append('restaurant_id', filters.restaurant_id)

  const response = await axiosInstance.get(`/superadmin/dashboard/stats?${params.toString()}`)
  return response.data
}

export const getDashboardActivity = async (page?: number, limit?: number) => {
  const params = new URLSearchParams()
  
  if (page) params.append('page', page.toString())
  if (limit) params.append('limit', limit.toString())

  const response = await axiosInstance.get(`/superadmin/dashboard/activity?${params.toString()}`)
  return response.data
}

export const getDashboardAnalytics = async (filters?: DashboardFilters) => {
  const params = new URLSearchParams()
  
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)

  const response = await axiosInstance.get(`/superadmin/dashboard/analytics?${params.toString()}`)
  return response.data
}

export const getRestaurantMetrics = async (id: string) => {
  const response = await axiosInstance.get(`/superadmin/dashboard/restaurants/${id}/metrics`)
  return response.data
}
