import { Subscription } from '@/hooks/queries/useSubscriptionQuery'
import {
  Calendar,
  Clock,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CreditCard,
} from 'lucide-react'

interface SubscriptionCardProps {
  subscription: Subscription | null | undefined
}

/**
 * Get status badge styling and label
 */
function getStatusBadge(displayStatus: string | undefined) {
  switch (displayStatus) {
    case 'active':
      return {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Active',
      }
    case 'expiring_soon':
      return {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: AlertTriangle,
        label: 'Expiring Soon',
      }
    case 'expired':
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Expired',
      }
    case 'cancelled':
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: XCircle,
        label: 'Cancelled',
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Clock,
        label: 'Unknown',
      }
  }
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No Active Subscription</p>
            <p className="text-sm text-gray-500 mt-1">
              Choose a plan below to get started
            </p>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(subscription.display_status)
  const StatusIcon = statusBadge.icon

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header with Plan Name and Status */}
      <div className="bg-linear-to-r from-violet-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm font-medium">Current Plan</p>
            <h3 className="text-2xl font-bold text-white capitalize">
              {subscription.plan_type}
            </h3>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusBadge.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{statusBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Billing Period */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Billing Period
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {formatDate(subscription.start_date)}
              </p>
              <p className="text-xs text-gray-500">
                to {formatDate(subscription.end_date)}
              </p>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Days Remaining
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {subscription.days_remaining}{' '}
                {subscription.days_remaining === 1 ? 'day' : 'days'}
              </p>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    subscription.days_remaining <= 7
                      ? 'bg-red-500'
                      : subscription.days_remaining <= 14
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (subscription.days_remaining / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Plan Price
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {formatCurrency(subscription.amount, subscription.currency)}
              </p>
              <p className="text-xs text-gray-500">
                per {subscription.plan_type === 'yearly' ? 'year' : 'month'}
              </p>
            </div>
          </div>

          {/* Auto Renewal */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Auto Renewal
              </p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {subscription.auto_renew ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-xs text-gray-500">
                {subscription.auto_renew
                  ? 'Renews automatically'
                  : 'Manual renewal required'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
