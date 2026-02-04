import { AlertTriangle, Clock, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

interface SubscriptionBannerProps {
  displayStatus: 'expiring_soon' | 'grace_period'
  daysRemaining?: number
  gracePeriodDaysRemaining?: number
}

/**
 * Warning banner for expiring or in grace period subscriptions
 * Shows dismissible warning at the top of the page
 */
export function SubscriptionBanner({
  displayStatus,
  daysRemaining = 0,
  gracePeriodDaysRemaining = 0,
}: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const isGracePeriod = displayStatus === 'grace_period'

  return (
    <div
      className={`relative flex items-center justify-between px-4 py-2.5 text-sm ${
        isGracePeriod
          ? 'bg-red-50 border-b border-red-200 text-red-800'
          : 'bg-amber-50 border-b border-amber-200 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {isGracePeriod ? (
          <AlertTriangle className="w-4 h-4 text-red-600" />
        ) : (
          <Clock className="w-4 h-4 text-amber-600" />
        )}
        <span className="font-medium">
          {isGracePeriod ? (
            <>
              Your subscription has expired!{' '}
              <span className="font-bold">
                {gracePeriodDaysRemaining} day
                {gracePeriodDaysRemaining !== 1 ? 's' : ''} left
              </span>{' '}
              before access is blocked.
            </>
          ) : (
            <>
              Your subscription expires in{' '}
              <span className="font-bold">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </span>
        <Link
          to="/settings/subscription"
          className={`ml-2 underline font-semibold hover:no-underline ${
            isGracePeriod ? 'text-red-700' : 'text-amber-700'
          }`}
        >
          Renew Now
        </Link>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className={`p-1 rounded hover:bg-white/50 transition-colors ${
          isGracePeriod ? 'text-red-600' : 'text-amber-600'
        }`}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
