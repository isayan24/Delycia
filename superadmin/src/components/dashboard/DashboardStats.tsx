import { useDashboardStatsQuery } from '@/hooks/queries/useDashboardQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  Users, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  UserCheck
} from 'lucide-react'

export function DashboardStats() {
  const { data, isLoading, isError } = useDashboardStatsQuery()

  if (isError) {
    return (
      <div className="text-center p-4 text-destructive">
        Error loading dashboard stats
      </div>
    )
  }

  const stats = data?.data

  const statCards = [
    {
      title: 'Total Restaurants',
      value: stats?.total_restaurants || 0,
      subtitle: `${stats?.active_restaurants || 0} active`,
      icon: Building2,
      trend: '+12%',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions || 0,
      subtitle: `${stats?.total_subscriptions || 0} total`,
      icon: CreditCard,
      trend: '+8%',
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      subtitle: 'Platform users',
      icon: Users,
      trend: '+23%',
    },
    {
      title: 'Total Staff',
      value: stats?.total_staff || 0,
      subtitle: 'Across all restaurants',
      icon: UserCheck,
      trend: '+15%',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
      subtitle: 'All time',
      icon: DollarSign,
      trend: '+18%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.monthly_revenue || 0).toLocaleString()}`,
      subtitle: 'This month',
      icon: TrendingUp,
      trend: '+25%',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{stat.subtitle}</span>
                  <span className="text-green-600 font-medium">{stat.trend}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
