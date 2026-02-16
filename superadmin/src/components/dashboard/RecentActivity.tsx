import { useState } from 'react'
import { useDashboardActivityQuery } from '@/hooks/queries/useDashboardQuery'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  UserPlus,
  Building2,
  CreditCard,
  Settings,
  AlertCircle
} from 'lucide-react'

export function RecentActivity() {
  const [page] = useState(1)
  const [limit] = useState(10)
  const { data, isLoading, isError } = useDashboardActivityQuery(page, limit)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created':
      case 'user_updated':
        return UserPlus
      case 'restaurant_created':
      case 'restaurant_updated':
        return Building2
      case 'subscription_created':
      case 'subscription_updated':
        return CreditCard
      case 'settings_updated':
        return Settings
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    if (type.includes('created')) return 'success'
    if (type.includes('updated')) return 'default'
    if (type.includes('deleted') || type.includes('deactivated')) return 'destructive'
    return 'secondary'
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Error loading activity</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.data?.data || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities and changes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any, index: number) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <Badge variant={getActivityColor(activity.type) as any} className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {activity.restaurant_name && (
                      <p className="text-xs text-muted-foreground">
                        {activity.restaurant_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
