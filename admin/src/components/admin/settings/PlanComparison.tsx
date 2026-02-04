import { Check, Star } from 'lucide-react'

interface PlanComparisonProps {
  currentPlanType: 'monthly' | 'yearly' | undefined
}

interface Plan {
  id: string
  name: string
  plan_type: 'monthly' | 'yearly'
  price: number
  currency: string
  billing_period: string
  savings?: number
  is_popular: boolean
  features: string[]
}

// Static plans - same features, different pricing
const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    plan_type: 'monthly',
    price: 499,
    currency: 'INR',
    billing_period: 'month',
    is_popular: false,
    features: [
      'Unlimited Orders',
      'Real-time Order Tracking',
      'Staff Management',
      'Inventory Management',
      'Sales Reports & Analytics',
      'Customer Management (CRM)',
      'Table Management',
      'QR Code Ordering',
      'Priority Support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    plan_type: 'yearly',
    price: 4999,
    currency: 'INR',
    billing_period: 'year',
    savings: 989, // 499*12 - 4999
    is_popular: true,
    features: [
      'Unlimited Orders',
      'Real-time Order Tracking',
      'Staff Management',
      'Inventory Management',
      'Sales Reports & Analytics',
      'Customer Management (CRM)',
      'Table Management',
      'QR Code Ordering',
      'Priority Support',
    ],
  },
]

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => {
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
              {plan.savings && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save {formatCurrency(plan.savings, plan.currency)} per year
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
                All Features Included
              </p>
              <ul className="space-y-2.5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button - Disabled for now as upgrade flow is not implemented */}
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
