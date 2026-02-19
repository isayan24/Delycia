import React from 'react'
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Bolt,
  Minus,
} from 'lucide-react'
import { StatsCardsSkeleton } from '../../LoadingSkeleton'

interface OrderHistoryStatsCardsProps {
  stats:
    | {
        total_orders: number
        total_delivered: number
        total_cancelled: number
      }
    | null
    | undefined
  loading?: boolean
}

export const OrderHistoryStatsCards = React.memo(
  ({ stats, loading }: OrderHistoryStatsCardsProps) => {
    if (loading && !stats) {
      return <StatsCardsSkeleton />
    }

    const total = stats?.total_orders || 0
    const delivered = stats?.total_delivered || 0
    const cancelled = stats?.total_cancelled || 0

    const deliveredPercent =
      total > 0 ? Math.round((delivered / total) * 100) : 0
    const cancelledPercent =
      total > 0 ? Math.round((cancelled / total) * 100) : 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Orders */}
        <div className="bg-white dark:bg-[#2d1e14] p-8 py-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a16b45] text-sm font-medium">
              Total Orders
            </span>
            <div className="bg-orange-50 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {total}
          </div>
          <div className="flex items-center gap-1 text-[#07880e] text-xs font-bold mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>+5% from last month</span>
          </div>
        </div>

        {/* Successful */}
        <div className="bg-white dark:bg-[#2d1e14] p-8 py-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a16b45] text-sm font-medium">
              Successful
            </span>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {delivered}{' '}
            <span className="text-sm font-normal text-[#a16b45]">
              ({deliveredPercent}%)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#07880e] text-xs font-bold mt-2">
            <Bolt className="w-4 h-4" />
            <span>Perfect delivery rate</span>
          </div>
        </div>

        {/* Lost/Cancelled */}
        <div className="bg-white dark:bg-[#2d1e14] p-8 py-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a16b45] text-sm font-medium">
              Lost/Cancelled
            </span>
            <div className="bg-rose-50 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {cancelled}{' '}
            <span className="text-sm font-normal text-[#a16b45]">
              ({cancelledPercent}%)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#a16b45] text-xs font-bold mt-2">
            <Minus className="w-4 h-4" />
            <span>No reported issues</span>
          </div>
        </div>
      </div>
    )
  },
)
