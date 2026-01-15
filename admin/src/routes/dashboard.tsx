import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DashboardWrapper } from '@/components/admin/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/dashboard')({
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

const AuthErrorScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: '/login' })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-orange-200 p-8 text-center">
        <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please log in to access the dashboard. Redirecting to login page...
        </p>
        <button
          onClick={() => navigate({ to: '/login' })}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Dashboard Page Auth State:', {
        isLoading,
        isAuthenticated,
        hasUser: !!user,
        userSelectedRid: user?.selected_rid,
      })
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <AuthErrorScreen />
  }

  // No need to check for accessToken - it's in httpOnly cookies
  // Server routes will handle authentication automatically

  if (!user) {
    return <LoadingScreen message="Loading user information..." />
  }

  if (!user.selected_rid) {
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
