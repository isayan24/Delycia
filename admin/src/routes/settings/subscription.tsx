import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { requireAuth } from '@/middleware/auth'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useSubscriptionQuery } from '@/hooks/queries/useSubscriptionQuery'
import { SubscriptionCard } from '@/components/admin/settings/SubscriptionCard'
import { PlanComparison } from '@/components/admin/settings/PlanComparison'
import { ArrowLeft } from 'lucide-react'
import { LoadingOverlay } from '@/components/smallComponents/LoadingOverlay'

export const Route = createFileRoute('/settings/subscription')({
  beforeLoad: requireAuth,
  component: SubscriptionPage,
})

function SubscriptionPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString()

  const { data, isLoading, error } = useSubscriptionQuery(rid)

  if (!user || !rid) {
    return (
      <LoadingOverlay isVisible={true} message="Loading user information" />
    )
  }

  if (isLoading) {
    return (
      <LoadingOverlay isVisible={true} message="Loading subscription details" />
    )
  }

  if (error) {
    return (
      <div className="max-w-[60rem]">
        <div className="mb-6">
          <Link
            to="/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Billing & Subscription
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Failed to load subscription details. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const [showPlans, setShowPlans] = useState(false)
  const subscription = data?.subscription
  const hasActiveSubscription =
    !!subscription && subscription.status === 'active'

  // Initialize showPlans based on subscription status when data loads
  useEffect(() => {
    if (data && !hasActiveSubscription) {
      setShowPlans(true)
    }
  }, [data, hasActiveSubscription])

  // If no subscription data yet (but not loading/error), don't render content yet
  if (!data) return null

  return (
    <div className="max-w-[60rem] mx-auto space-y-6 p-2 py-3">
      {/* Header */}
      <div>
        <h1 className="text-md sm:text-xl font-semibold text-gray-800 mb-1">
          Billing & Subscription
        </h1>
        <p className="text-sm text-gray-600">
          View and manage your subscription plan
        </p>
      </div>

      {/* Current Subscription */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
          Current Plan
        </h2>
        <SubscriptionCard subscription={subscription} />
      </div>

      {/* Plan Comparison */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Available Plans
          </h2>
          {hasActiveSubscription && (
            <button
              onClick={() => setShowPlans(!showPlans)}
              className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              {showPlans ? 'Hide Plans' : 'View All Plans'}
            </button>
          )}
        </div>

        {showPlans && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <PlanComparison
              currentPlanType={
                subscription?.plan?.code || subscription?.plan_type
              }
            />
          </div>
        )}
      </div>

      {/* Contact for Renewal */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 sm:p-4 text-center">
        <p className="text-sm text-gray-700">
          For subscription renewal, contact us at{' '}
          <a
            href="tel:9083928843"
            className="font-semibold text-violet-700 hover:underline"
          >
            9083928843
          </a>
        </p>
      </div>
    </div>
  )
}
