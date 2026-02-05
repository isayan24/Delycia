import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Archive,
} from 'lucide-react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  Notification,
} from '@/hooks/queries/useNotificationsQuery'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'

interface NotificationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSheet({
  open,
  onOpenChange,
}: NotificationSheetProps) {
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
  const { data, isLoading, isError } = useNotifications({
    limit: 50,
    is_read: 'all',
  })
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead()
  const { mutate: deleteNotification } = useDeleteNotification()

  // Separate notifications into unread and read
  const unreadNotifications =
    data?.notifications.filter((n) => !n.is_read) || []
  const readNotifications = data?.notifications.filter((n) => n.is_read) || []

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

  const handleActionClick = (notificationId: number, isRead: boolean) => {
    // Mark as read if not already
    if (!isRead) {
      markRead(notificationId)
    }
    // Close the sheet
    onOpenChange(false)
  }

  const renderNotificationCard = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white p-4 transition-all hover:shadow-md',
        !notification.is_read &&
          'bg-blue-50/50 border-blue-100 ring-1 ring-blue-100',
      )}
      // onClick={() => !notification.is_read && markRead(notification.id)}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm',
            notification.priority === 'critical' && 'border-red-100 bg-red-50',
            notification.priority === 'high' &&
              'border-orange-100 bg-orange-50',
          )}
        >
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-semibold leading-none',
                !notification.is_read && 'text-blue-700',
              )}
            >
              {notification.title}
            </p>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {format(new Date(notification.created_at), 'MMM d, h:mm a')}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center justify-between pt-2">
            {notification.action_url && (
              <Link
                to={notification.action_url}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                {notification.action_label || 'View Details'} &rarr;
              </Link>
            )}
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    markRead(notification.id)
                  }}
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotification(notification.id)
                }}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmptyState = (type: 'unread' | 'read') => (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      {type === 'unread' ? (
        <>
          <Inbox className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No new notifications to show.</p>
        </>
      ) : (
        <>
          <Archive className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No read notifications</p>
          <p className="text-sm">Notifications you've seen will appear here.</p>
        </>
      )}
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 gap-0 flex flex-col h-full bg-gray-50/70"
      >
        <SheetHeader className="p-6 pb-0 bg-white ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle>Notifications</SheetTitle>
              {unreadNotifications.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-medium text-white">
                  {unreadNotifications.length}
                </span>
              )}
            </div>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
              >
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription />
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'unread' | 'read')}
          className="flex-1 flex flex-col overflow-hidden  "
        >
          <div className="px-6 py-4 bg-white border-b">
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="unread" className="gap-2">
                <Bell className="h-4 w-4" />
                New
                {unreadNotifications.length > 0 && (
                  <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="gap-2">
                <Archive className="h-4 w-4" />
                History
                {readNotifications.length > 0 && (
                  <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {readNotifications.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unread" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <div className="flex flex-col gap-4 py-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                    <p>Failed to load notifications</p>
                    <Button
                      variant="link"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  renderEmptyState('unread')
                ) : (
                  <>
                    {unreadNotifications.map(renderNotificationCard)}
                    <div className="text-center py-4">
                      <span className="text-xs text-muted-foreground">
                        End of new notifications
                      </span>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="read" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <div className="flex flex-col gap-4 py-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                    <p>Failed to load notifications</p>
                  </div>
                ) : readNotifications.length === 0 ? (
                  renderEmptyState('read')
                ) : (
                  <>
                    {readNotifications.map(renderNotificationCard)}
                    <div className="text-center py-4">
                      <span className="text-xs text-muted-foreground">
                        End of notification history
                      </span>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
