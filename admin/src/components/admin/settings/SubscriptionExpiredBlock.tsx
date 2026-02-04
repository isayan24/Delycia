import { Link } from '@tanstack/react-router'
import { ShieldX, CreditCard } from 'lucide-react'

interface SubscriptionExpiredBlockProps {
  hasSubscription: boolean
}

/**
 * Full-page block when subscription has expired and grace period is over
 * Only allows navigation to subscription page
 */
export function SubscriptionExpiredBlock({
  hasSubscription,
}: SubscriptionExpiredBlockProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-red-500 to-rose-600 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldX className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {hasSubscription
                ? 'Subscription Expired'
                : 'No Active Subscription'}
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 py-6 text-center">
            <p className="text-gray-600 mb-6">
              {hasSubscription
                ? 'Your subscription has expired and the grace period has ended. Please renew your subscription to continue using the platform.'
                : "You don't have an active subscription. Please subscribe to access the admin panel."}
            </p>

            <div className="space-y-3">
              <Link
                to="/settings/subscription"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200"
              >
                <CreditCard className="w-5 h-5" />
                {hasSubscription ? 'Renew Subscription' : 'View Plans'}
              </Link>

              <p className="text-xs text-gray-500">
                For subscription renewal, call{' '}
                <a
                  href="tel:9083928843"
                  className="text-violet-600 font-medium hover:underline"
                >
                  9083928843
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} Delycia. All rights reserved.
        </p>
      </div>
    </div>
  )
}
