import React, { useEffect, useState } from 'react'
import DashboardErrorBoundary from './DashboardErrorBoundary'
import EnhancedAdminDashboard from './EnhancedAdminDashboard'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import {
  performanceMonitor,
  WebVitalsMonitor,
} from '@/utils/performanceMonitor'
import { AlertCircle, Loader2 } from 'lucide-react'

interface DashboardWrapperProps {
  rid: string
  // accessToken removed - using httpOnly cookies
  onError?: (error: Error) => void
}

const InitializationLoader: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Loading Dashboard
      </h2>
      <p className="text-gray-600">Initializing your dashboard experience...</p>
    </div>
  </div>
)

const MissingCredentialsError: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-orange-200 p-8 text-center">
      <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-orange-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Authentication Required
      </h2>
      <p className="text-gray-600 mb-6">
        Please log in to access the dashboard. Your session may have expired.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => (window.location.href = '/login')}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Login
        </button>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
)

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  rid,
  onError,
}) => {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const { loadFromStorage } = useDateFilterStore()

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        performanceMonitor.start('dashboard-initialization')

        // Initialize Web Vitals monitoring
        WebVitalsMonitor.init()

        // Load saved date filter state
        await new Promise((resolve) => {
          try {
            loadFromStorage()
            resolve(void 0)
          } catch (error) {
            console.warn('Failed to load date filter from storage:', error)
            resolve(void 0) // Continue even if loading fails
          }
        })

        // Props are guaranteed to be valid by parent component and TypeScript

        performanceMonitor.end('dashboard-initialization')
        setIsInitializing(false)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to initialize dashboard'
        setInitError(errorMessage)
        setIsInitializing(false)

        if (onError && error instanceof Error) {
          onError(error)
        }

        performanceMonitor.end('dashboard-initialization')
      }
    }

    // Initialize dashboard immediately since props are guaranteed to be valid
    initializeDashboard()
  }, [rid, loadFromStorage, onError])

  // Authentication is handled by the parent component

  // Performance monitoring cleanup
  useEffect(() => {
    return () => {
      // Log performance insights on unmount
      if (process.env.NODE_ENV === 'development') {
        const insights = performanceMonitor.getInsights()
        if (insights.recommendations.length > 0) {
          console.log('Dashboard Performance Insights:', insights)
        }
      }
    }
  }, [])

  // Handle page visibility changes for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        performanceMonitor.start('page-hidden')
      } else {
        performanceMonitor.end('page-hidden')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Show loading state during initialization
  if (isInitializing) {
    return <InitializationLoader />
  }

  // Show error state for initialization errors
  if (initError) {
    return (
      <MissingCredentialsError
        onRetry={() => {
          setInitError(null)
          setIsInitializing(true)
        }}
      />
    )
  }

  // Props are guaranteed to be valid by TypeScript and parent component

  // Render the main dashboard with error boundary
  return (
    <DashboardErrorBoundary
      onError={(error, errorInfo) => {
        // Log error for debugging
        console.error('Dashboard Error Boundary:', error, errorInfo)

        // Call custom error handler if provided
        if (onError) {
          onError(error)
        }

        // Log to performance monitor
        performanceMonitor.start('error-recovery')
      }}
    >
      <EnhancedAdminDashboard rid={rid} />
    </DashboardErrorBoundary>
  )
}

export default DashboardWrapper
