import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/queries/useNotificationsQuery'
import { NotificationSheet } from './NotificationSheet'

/**
 * Notification Bell Button with unread count badge
 * Displays in the header and opens the notification sheet when clicked
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useNotifications({ limit: 50, is_read: false })

  const unreadCount = data?.notifications?.length || 0

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setIsOpen(true)}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
