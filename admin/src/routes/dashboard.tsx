import { createFileRoute } from '@tanstack/react-router'
import { DashboardWrapper } from '@/components/admin/dashboard'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { requireAuth } from '@/middleware/auth'
import LoadingScreen from '@/components/common/LoadingScreen'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAdminAuthQuery()

  // Middleware ensures we're authenticated, so just check for user data
  if (!user || !user.selected_rid) {
    return <LoadingScreen message="Loading restaurant information..." />
  }

  return (
    <DashboardWrapper
      rid={user.selected_rid?.toString() || ''}
      onError={(error) => {
        console.error('Dashboard error:', error)
      }}
    />
  )
}
