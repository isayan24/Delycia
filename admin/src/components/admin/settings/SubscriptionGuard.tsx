import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useSubscriptionQuery } from '@/hooks/queries/useSubscriptionQuery'
import { SubscriptionBanner } from '@/components/admin/settings/SubscriptionBanner'
import { SubscriptionExpiredBlock } from '@/components/admin/settings/SubscriptionExpiredBlock'
import { useRouterState } from '@tanstack/react-router'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

// Routes that should always be accessible regardless of subscription status
const ALLOWED_ROUTES = ['/settings', '/settings/subscription', '/login', '/']

/**
 * SubscriptionGuard - Wraps the app to enforce subscription access
 *
 * - Active subscription: Full access
 * - Expiring soon (<=7 days): Warning banner + full access
 * - Grace period (expired <=3 days): Warning banner + full access
 * - Hard blocked (expired >3 days): Full page block, only settings accessible
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, isLoading: isAuthLoading } = useAdminAuthQuery()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const rid = user?.selected_rid?.toString()

  const { data, isLoading: isSubLoading } = useSubscriptionQuery(
    rid,
    !!user && !!rid,
  )

  // Don't block while loading or on allowed routes
  const isAllowedRoute = ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  )

  // Skip subscription check for non-authenticated users or during loading
  if (!user || isAuthLoading || isSubLoading) {
    return <>{children}</>
  }

  // Handle hard block (subscription expired and grace period over)
  if (data?.is_hard_blocked && !isAllowedRoute) {
    return (
      <>
        <SubscriptionExpiredBlock
          hasSubscription={data?.has_subscription ?? false}
        />
        {children}
      </>
    )
  }

  // Handle grace period or expiring soon - show banner
  const showBanner =
    data?.subscription?.display_status === 'grace_period' ||
    data?.subscription?.display_status === 'expiring_soon'

  return (
    <>
      {showBanner && data?.subscription?.display_status && (
        <SubscriptionBanner
          displayStatus={
            data.subscription.display_status as 'expiring_soon' | 'grace_period'
          }
          daysRemaining={data.subscription.days_remaining}
          gracePeriodDaysRemaining={data.grace_period_days_remaining}
        />
      )}
      {children}
    </>
  )
}
