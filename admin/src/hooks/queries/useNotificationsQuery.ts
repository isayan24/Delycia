import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAdminAuthQuery } from './useAdminAuthQuery'
import { useEffect } from 'react'
import WebSocketManager from '../../services/WebSocketManager'

// ============================================
// Types
// ============================================
export interface Notification {
  id: number
  restaurant_id: number
  user_id: number | null
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  is_read: boolean
  read_at: string | null
  action_url: string | null
  action_label: string | null
  created_at: string
  data: any
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// ============================================
// Query Key Factory
// ============================================
export const notificationKeys = {
  all: ['notifications'] as const,
  byRestaurant: (rid: number) =>
    [...notificationKeys.all, 'restaurant', rid] as const,
  byType: (type: string) => [...notificationKeys.all, 'type', type] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch notifications for the current restaurant
 */
export const useNotifications = (
  params: {
    page?: number
    limit?: number
    type?: string
    is_read?: boolean | 'all'
  } = {},
) => {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  const queryClient = useQueryClient()

  // Real-time updates via WebSocket
  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }

    wsManager.subscribe('new_notification', handleNewNotification)

    return () => {
      wsManager.unsubscribe('new_notification', handleNewNotification)
    }
  }, [queryClient])

  return useQuery({
    queryKey: rid
      ? [...notificationKeys.byRestaurant(rid), params]
      : notificationKeys.all,
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID not found')

      // Call local TanStack API route (NOT backend directly)
      const response = await axios.get('/api/notifications', {
        params: { ...params, rid },
      })

      return response.data as NotificationsResponse
    },
    enabled: !!rid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Polling fallback
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Mark a single notification as read
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAdminAuthQuery()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.patch(`/api/notifications/${id}`, {
        rid: user?.selected_rid,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAdminAuthQuery()

  return useMutation({
    mutationFn: async () => {
      const response = await axios.patch('/api/notifications', {
        rid: user?.selected_rid,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  const { user } = useAdminAuthQuery()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/notifications/${id}`, {
        data: { rid: user?.selected_rid },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
