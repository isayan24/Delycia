import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useSubscriptionQuery } from '@/hooks/queries/useSubscriptionQuery'
import LoadingScreen from '@/components/common/LoadingScreen'
import { SubscriptionCard } from '@/components/admin/settings/SubscriptionCard'
import { PlanComparison } from '@/components/admin/settings/PlanComparison'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/settings/subscription')({
  beforeLoad: requireAuth,
  component: SubscriptionPage,
})

function SubscriptionPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString()

  const { data, isLoading, error } = useSubscriptionQuery(rid)

  if (!user || !rid) {
    return <LoadingScreen message="Loading user information..." />
  }

  if (isLoading) {
    return <LoadingScreen message="Loading subscription details..." />
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

  const subscription = data?.subscription

  return (
    <div className="max-w-[60rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">View and manage your subscription plan</p>
      </div>

      {/* Current Subscription */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Current Plan
        </h2>
        <SubscriptionCard subscription={subscription} />
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Available Plans
        </h2>
        <PlanComparison currentPlanType={subscription?.plan_type} />
      </div>
    </div>
  )
}
