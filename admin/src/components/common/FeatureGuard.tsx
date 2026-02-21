/**
 * FeatureGuard Component
 *
 * Wraps route content to enforce feature flag access control.
 * If the feature is disabled for the current restaurant, redirects to dashboard
 * and shows a toast notification.
 *
 * Usage:
 *   <FeatureGuard feature="staff_management">
 *     <StaffPage />
 *   </FeatureGuard>
 */

import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  useFeatureFlagsQuery,
  isFeatureEnabled,
  FEATURE_FLAGS_META,
  type FeatureKey,
} from '@/hooks/queries/useFeatureFlagsQuery'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface FeatureGuardProps {
  feature: FeatureKey
  children: React.ReactNode
  fallbackUrl?: string
}

export function FeatureGuard({
  feature,
  children,
  fallbackUrl = '/dashboard',
}: FeatureGuardProps) {
  const { selectedRid } = useRestaurantSelector()
  const { data: flags, isLoading } = useFeatureFlagsQuery(selectedRid)
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  const enabled = isFeatureEnabled(flags, feature)

  useEffect(() => {
    // Only redirect when we have loaded data and the feature is disabled
    if (!isLoading && !enabled && !hasRedirected.current) {
      hasRedirected.current = true

      const meta = FEATURE_FLAGS_META.find((m) => m.key === feature)
      const featureLabel = meta?.label || feature

      toast.error(`${featureLabel} is disabled`, {
        description:
          'This feature has been turned off for your restaurant. Enable it from Settings → Feature Toggles.',
        duration: 5000,
      })

      navigate({ to: fallbackUrl })
    }
  }, [isLoading, enabled, feature, navigate, fallbackUrl])

  // While loading, show nothing to prevent flash
  if (isLoading) return null

  // If disabled, return null (redirect is happening)
  if (!enabled) return null

  return <>{children}</>
}
