import { Check, Star } from 'lucide-react'
import {
  usePlansQuery,
  type SubscriptionPlan,
} from '@/hooks/queries/useSubscriptionQuery'

interface PlanComparisonProps {
  currentPlanType: string | undefined
}

/**
 * Format currency
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function PlanComparison({ currentPlanType }: PlanComparisonProps) {
  const { data, isLoading, error } = usePlansQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error || !data?.plans?.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          Failed to load plans. Please try again later.
        </p>
      </div>
    )
  }

  const plans = data.plans

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan: SubscriptionPlan) => {
        const isCurrentPlan = currentPlanType === plan.plan_type

        return (
          <div
            key={plan.id}
            className={`relative bg-white border-2 rounded-xl overflow-hidden transition-all ${
              isCurrentPlan
                ? 'border-violet-500 shadow-lg shadow-violet-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {plan.is_popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Best Value
                </div>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
              <div className="absolute top-0 left-0">
                <div className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-br-lg">
                  Current Plan
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="p-6 pb-4">
              <h3 className="text-xl font-bold text-gray-800 mt-4">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(plan.price, plan.currency)}
                </span>
                <span className="text-gray-500 text-sm">
                  / {plan.billing_period}
                </span>
              </div>
              {plan.savings > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save {formatCurrency(plan.savings, plan.currency)} per year
                </p>
              )}
              {plan.max_restaurants > 1 && (
                <p className="text-xs text-violet-600 font-medium mt-1">
                  Up to {plan.max_restaurants} restaurants
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
                All Features Included
              </p>
              <ul className="space-y-2.5">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6">
              {isCurrentPlan ? (
                <div className="w-full py-2.5 text-center text-sm font-medium text-violet-700 bg-violet-50 rounded-lg border border-violet-200">
                  Your Current Plan
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-200 cursor-not-allowed"
                >
                  Contact Support to Change Plan
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
