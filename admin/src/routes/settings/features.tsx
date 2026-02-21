import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { Switch } from '@/components/ui/switch'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import {
  useFeatureFlagsQuery,
  useUpdateFeatureFlagsMutation,
  FEATURE_FLAGS_META,
  type FeatureKey,
} from '@/hooks/queries/useFeatureFlagsQuery'
import { toast } from 'sonner'
import {
  Settings2,
  Users,
  Package,
  BarChart3,
  UserSearch,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/features')({
  beforeLoad: requireAuth,
  component: FeaturesPage,
})

/** Map feature keys to icons */
const FEATURE_ICONS: Record<FeatureKey, React.ElementType> = {
  table_management: Settings2,
  staff_management: Users,
  inventory_management: Package,
  reports: BarChart3,
  crm: UserSearch,
}

/** Map feature keys to colors for visual distinction */
const FEATURE_COLORS: Record<
  FeatureKey,
  { bg: string; border: string; icon: string; activeBg: string }
> = {
  table_management: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    activeBg: 'bg-blue-500',
  },
  staff_management: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    activeBg: 'bg-purple-500',
  },
  inventory_management: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    activeBg: 'bg-amber-500',
  },
  reports: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    activeBg: 'bg-emerald-500',
  },
  crm: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    activeBg: 'bg-teal-500',
  },
}

function FeaturesPage() {
  const { selectedRid, selectedRestaurant } = useRestaurantSelector()
  const { data: flags, isLoading, isError } = useFeatureFlagsQuery(selectedRid)
  const {
    mutate: updateFlags,
    isPending,
    variables: mutatingVariables,
  } = useUpdateFeatureFlagsMutation()

  /** Track which specific key is currently being mutated */
  const mutatingKey =
    isPending && mutatingVariables
      ? (Object.keys(mutatingVariables).find(
          (k) => k !== 'rid' && FEATURE_FLAGS_META.some((m) => m.key === k),
        ) as FeatureKey | undefined)
      : undefined

  const handleToggle = (key: FeatureKey, currentValue: number) => {
    if (!selectedRid || !flags || isPending) return

    const newValue = currentValue === 1 ? 0 : 1
    const meta = FEATURE_FLAGS_META.find((m) => m.key === key)

    updateFlags(
      { rid: Number(selectedRid), [key]: newValue },
      {
        onSuccess: () => {
          toast.success(
            `${meta?.label || key} ${newValue === 1 ? 'enabled' : 'disabled'}`,
          )
        },
        onError: () => {
          toast.error(`Failed to update ${meta?.label || key}`)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-[60rem] p-2">
        <div className="mb-6">
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">
            Feature Toggles
          </h1>
          <p className="text-xs sm:text-base text-gray-500">Loading...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !flags) {
    return (
      <div className="max-w-[60rem] p-2">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load feature settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[60rem] p-2 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1">
          Feature Toggles
        </h1>
        <p className="text-xs sm:text-base text-gray-500">
          Turn features on or off for{' '}
          <span className="font-medium text-gray-700">
            {selectedRestaurant?.name || 'your restaurant'}
          </span>
          . Disabled features will be hidden from the sidebar and inaccessible.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {FEATURE_FLAGS_META.map((meta) => {
          const Icon = FEATURE_ICONS[meta.key]
          const colors = FEATURE_COLORS[meta.key]
          const isEnabled = flags[meta.key] === 1

          return (
            <div
              key={meta.key}
              className={`
                relative rounded-xl border p-4 transition-all duration-200
                ${
                  isEnabled
                    ? `${colors.bg} ${colors.border}`
                    : 'bg-gray-50 border-gray-200 opacity-70'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Icon + Text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`
                      flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                      ${isEnabled ? `${colors.bg} ${colors.icon}` : 'bg-gray-100 text-gray-400'}
                    `}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isEnabled ? 'text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      {meta.label}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 line-clamp-2 ${
                        isEnabled ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {meta.description}
                    </p>
                  </div>
                </div>

                {/* Right: Switch */}
                <div className="flex-shrink-0 pt-0.5">
                  {mutatingKey === meta.key ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() =>
                        handleToggle(meta.key, flags[meta.key])
                      }
                    />
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-2.5">
                <span
                  className={`
                    inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${
                      isEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isEnabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-amber-800">
          <span className="font-semibold">Note:</span> Disabling a feature will
          hide it from the navigation and block access to its pages. Core
          features like Dashboard, Billing/Quick Bill, and Order management
          cannot be disabled.
        </p>
      </div>
    </div>
  )
}
