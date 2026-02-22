import { useQuery } from '@tanstack/react-query'
import {
  getDashboardStats,
  getDashboardActivity,
  getDashboardAnalytics,
  type DashboardFilters,
} from '@/lib/api/dashboard'

export function useDashboardStatsQuery(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['dashboard', 'stats', filters],
    queryFn: async () => {
      const response = await getDashboardStats({ data: filters })
      return await response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useDashboardActivityQuery(
  page: number = 1,
  limit: number = 10,
) {
  return useQuery({
    queryKey: ['dashboard', 'activity', page, limit],
    queryFn: async () => {
      const response = await getDashboardActivity({ data: { page, limit } })
      return await response.json()
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useDashboardAnalyticsQuery(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['dashboard', 'analytics', filters],
    queryFn: async () => {
      const response = await getDashboardAnalytics({ data: filters })
      return await response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
