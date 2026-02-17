'use client'

import { Switch } from '@/components/ui/switch'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import {
  useRestaurantSettingsQuery,
  useUpdateRestaurantMutation,
} from '@/hooks/queries/useRestaurantSettingsQueries'
import { Loader2 } from 'lucide-react'

/**
 * Compact active/inactive toggle for the global header bar.
 * Reads the current restaurant's is_active status and toggles it
 * via the existing mutation hook.
 */
export function RestaurantActiveToggle() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid?.toString()

  const { data: settingsData, isLoading } = useRestaurantSettingsQuery(rid)
  const restaurant = settingsData?.restaurant_info
  const isActive = restaurant?.is_active === 1

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
      <span
        className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}
      >
        {isActive ? 'Open' : 'Closed'}
      </span>
      <Switch
        checked={isActive}
        disabled={toggleMutation.isPending}
        onCheckedChange={(checked) => {
          toggleMutation.mutate({
            id: restaurant.id,
            is_active: checked ? 1 : 0,
          })
        }}
        className="data-[state=checked]:bg-green-500 scale-[0.7]"
      />
    </div>
  )
}
