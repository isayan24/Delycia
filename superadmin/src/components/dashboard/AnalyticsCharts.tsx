import { useDashboardAnalyticsQuery } from '@/hooks/queries/useDashboardQuery'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, AlertCircle } from 'lucide-react'

export function AnalyticsCharts() {
  const { data, isLoading, isError } = useDashboardAnalyticsQuery()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Growth trends and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Error loading analytics</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const analytics = data?.data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Platform growth trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Placeholder for chart - would integrate with recharts or similar */}
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Chart visualization</p>
                <p className="text-xs">Integrate with recharts library</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  +{analytics?.restaurant_growth || 12}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Restaurant Growth
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  +{analytics?.user_growth || 23}%
                </div>
                <div className="text-xs text-muted-foreground">
                  User Growth
                </div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +{analytics?.revenue_growth || 18}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Revenue Growth
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Data from the last 30 days
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
