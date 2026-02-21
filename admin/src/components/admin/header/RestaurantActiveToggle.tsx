'use client'

import { Switch } from '@/components/ui/switch'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import {
  useRestaurantSettingsQuery,
  useUpdateRestaurantMutation,
} from '@/hooks/queries/useRestaurantSettingsQueries'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Compact active/inactive toggle for the global header bar.
 * Shows computed is_open_now status (based on schedule + override).
 * Toggling ON on a non-scheduled day auto-sets a daily override.
 */
export function RestaurantActiveToggle() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString()

  const { data: settingsData, isLoading } = useRestaurantSettingsQuery(rid)
  const restaurant = settingsData?.restaurant_info
  const isActive = restaurant?.is_active === 1
  const isOpenNow = restaurant?.is_open_now === 1
  const statusMessage = restaurant?.status_message || ''
  const hasOverride = !!restaurant?.manual_override_date

  const toggleMutation = useUpdateRestaurantMutation()

  if (isLoading || !restaurant) {
    return (
      <div className="flex items-center gap-1.5 px-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end">
        <span
          className={`text-xs font-medium leading-tight ${
            isOpenNow
              ? 'text-green-600'
              : isActive
                ? 'text-amber-500'
                : 'text-red-500'
          }`}
        >
          {isOpenNow ? 'Open' : isActive ? 'Scheduled' : 'Closed'}
        </span>
        {hasOverride && isActive && (
          <span className="text-[9px] text-amber-500 font-medium leading-tight">
            Today only
          </span>
        )}
      </div>
      <Switch
        checked={isActive}
        disabled={toggleMutation.isPending}
        onCheckedChange={(checked) => {
          toggleMutation.mutate(
            {
              id: restaurant.id,
              is_active: checked ? 1 : 0,
            },
            {
              onSuccess: () => {
                if (checked) {
                  toast.success('Restaurant opened')
                } else {
                  toast.info('Restaurant closed')
                }
              },
            },
          )
        }}
        className="data-[state=checked]:bg-green-500 scale-[0.7]"
      />
    </div>
  )
}
