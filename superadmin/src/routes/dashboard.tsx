import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              Platform overview and key metrics
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats />

        {/* Charts and Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <AnalyticsCharts />
          <RecentActivity />
        </div>
      </div>
    </ProtectedLayout>
  )
}
