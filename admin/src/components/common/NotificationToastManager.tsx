import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  useNotifications,
  Notification,
} from '@/hooks/queries/useNotificationsQuery'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import WebSocketManager from '@/services/WebSocketManager'

// Track which notifications have been shown to avoid duplicates
const shownNotificationIds = new Set<number>()

// Session storage key to track if initial toasts have been shown
const SESSION_KEY = 'notifications_toasts_shown'

/**
 * NotificationToastManager - Shows toast pop-ups for unread notifications
 *
 * Features:
 * - Shows all unread notifications as toasts on initial page load
 * - Shows new notifications in real-time via WebSocket
 * - Prevents duplicate toasts using session storage and in-memory tracking
 */
export function NotificationToastManager() {
  const { data, isSuccess } = useNotifications({ limit: 10, is_read: false })
  const hasShownInitial = useRef(false)

  // Get appropriate icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'payment_failed':
      case 'plan_expired':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'new_order':
      case 'payment_received':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Get toast type based on notification priority
  const getToastType = (notification: Notification) => {
    if (notification.priority === 'critical') return 'error'
    if (notification.priority === 'high') return 'warning'
    return 'info'
  }

  // Show a notification as a toast
  const showNotificationToast = (notification: Notification) => {
    // Skip if already shown
    if (shownNotificationIds.has(notification.id)) return
    shownNotificationIds.add(notification.id)

    const toastType = getToastType(notification)

    const toastContent = (
      <div className="flex items-start gap-2 w-full">
        {getIcon(notification.type)}
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="font-semibold text-gray-900">{notification.title}</span>
          <p className="text-sm text-gray-600">{notification.message}</p>
          {notification.action_url && (
            <Link
              to={notification.action_url}
              className="text-sm text-blue-600 font-medium hover:underline mt-0.5"
            >
              {notification.action_label || 'View Details'} →
            </Link>
          )}
        </div>
      </div>
    )

    // Get duration based on priority
    const duration = toastType === 'error' ? 8000 : toastType === 'warning' ? 6000 : 5000

    // Use toast() with custom styling to avoid default icons
    toast(toastContent, {
      duration,
      id: `notification-${notification.id}`,
      unstyled: false,
    })
  }

  // Show initial unread notifications on mount
  useEffect(() => {
    if (!isSuccess || !data?.notifications || hasShownInitial.current) return

    // Check if we've already shown toasts this session
    const sessionShown = sessionStorage.getItem(SESSION_KEY)
    if (sessionShown === 'true') {
      // Still track the IDs to prevent showing them again
      data.notifications.forEach((n) => shownNotificationIds.add(n.id))
      hasShownInitial.current = true
      return
    }

    // Show toasts for unread notifications (limit to 3 to avoid overwhelming)
    const notificationsToShow = data.notifications.slice(0, 3)

    // Use setTimeout to stagger the toasts slightly
    notificationsToShow.forEach((notification, index) => {
      setTimeout(() => {
        showNotificationToast(notification)
      }, index * 300) // 300ms delay between each toast
    })

    // If there are more notifications, show a summary toast
    if (data.notifications.length > 3) {
      setTimeout(
        () => {
          toast.info(`+${data.notifications.length - 3} more notifications`, {
            duration: 4000,
          })
        },
        notificationsToShow.length * 300 + 500,
      )
    }

    // Mark as shown for this session
    sessionStorage.setItem(SESSION_KEY, 'true')
    hasShownInitial.current = true
  }, [isSuccess, data])

  // Listen for real-time new notifications via WebSocket
  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()

    const handleNewNotification = (notification: Notification) => {
      // Show toast for new notification
      if (notification && notification.id) {
        showNotificationToast(notification)
      }
    }

    wsManager.subscribe('new_notification', handleNewNotification)

    return () => {
      wsManager.unsubscribe('new_notification', handleNewNotification)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
