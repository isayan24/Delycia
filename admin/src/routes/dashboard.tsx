import { createFileRoute } from '@tanstack/react-router'
import { DashboardWrapper } from '@/components/admin/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

const LoadingScreen = ({
  message = 'Authenticating and preparing your dashboard...',
}: {
  message?: string
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Loading Dashboard
      </h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

function DashboardPage() {
  const { user } = useAuth()

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
