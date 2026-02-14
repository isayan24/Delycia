import { createFileRoute } from '@tanstack/react-router'
import { DashboardWrapper } from '@/components/admin/dashboard'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { requireAuth } from '@/middleware/auth'
import LoadingScreen from '@/components/common/LoadingScreen'
import { useEffect } from 'react'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading, updateSelectedRestaurant, logout } =
    useAdminAuthQuery()

  // Auto-select first restaurant if selected_rid is null
  useEffect(() => {
    if (user && user.selected_rid == null && user.restaurant_rids?.length > 0) {
      updateSelectedRestaurant(user.restaurant_rids[0])
    }
  }, [user, updateSelectedRestaurant])

  // Show loading while session is being established
  if (isLoading || !user) {
    return <LoadingScreen message="Loading restaurant information..." />
  }

  // No restaurants assigned — show a clear message instead of infinite loading
  if (
    !user.selected_rid &&
    (!user.restaurant_rids || user.restaurant_rids.length === 0)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-xl font-semibold mb-2">No Restaurant Assigned</h2>
          <p className="text-gray-600">
            Your account doesn't have any restaurants assigned yet. Please
            contact your administrator.
          </p>
          <p className="text-gray-500 text-sm">
            If you believe this is an error, try logging in again to refresh
            your session.
          </p>
          <button
            onClick={() => logout()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Waiting for auto-select to complete
  if (!user.selected_rid) {
    return <LoadingScreen message="Loading restaurant information..." />
  }

  return (
    <DashboardWrapper
      rid={user.selected_rid.toString()}
      onError={(error) => {
        console.error('Dashboard error:', error)
      }}
    />
  )
}
