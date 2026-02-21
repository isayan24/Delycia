import React, { useMemo } from 'react'
import {
  ShoppingBag,
  ExternalLink,
  Phone,
  Calendar,
  TrendingUp,
  User2,
} from 'lucide-react'
import { useCustomerOrdersQuery } from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { Link } from '@tanstack/react-router'
import { formatDateTime } from '@/utils/dateUtils'
import { useLoadMore } from '@/hooks/useLoadMore'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'

interface CustomerActivityProps {
  rid: string
  isSidebarCollapsed: boolean
}

const CustomerActivityRow: React.FC<{
  row: any
  isSidebarCollapsed: boolean
}> = ({ row, isSidebarCollapsed }) => (
  <div className="group bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none p-5 md:p-6">
    <Link
      to="/reports/crm"
      search={{ customerId: row.userId.toString() }}
      className={cn(
        'grid grid-cols-12 gap-6 md:gap-8 lg:gap-4 items-center',
        isSidebarCollapsed
          ? 'max-[1024px]:block max-[1024px]:grid-cols-1'
          : 'max-[1200px]:grid-cols-1 max-[1200px]:block',
      )}
    >
      {/* Left Column: Customer Profile */}
      <div
        className={cn(
          'col-span-3 flex items-center gap-4 mb-1',
          isSidebarCollapsed ? '' : 'max-[1200px]:col-span-1 ',
        )}
      >
        <div className="size-12 md:size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-lg md:text-xl text-slate-400 border border-slate-100 dark:border-slate-700/50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
          {row.profilePic ? (
            <img
              src={row.profilePic}
              alt={row.customerName}
              className="size-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            (row.customerName || 'G').charAt(0).toUpperCase()
          )}
        </div>
        <div
          className={cn(
            'flex flex-col gap-1 min-w-0 ',
            isSidebarCollapsed ? '' : 'max-[1200px]:w-full',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 ',
              isSidebarCollapsed
                ? 'max-[1024px]:justify-between'
                : 'max-[1200px]:w-full max-[1200px]:justify-between',
            )}
          >
            <h4 className="font-bold text-slate-900 dark:text-white text-[16px] md:text-[17px] leading-tight truncate">
              {row.customerName || 'Guest User'}
            </h4>

            <ExternalLink
              className={cn(
                'size-3.5',
                isSidebarCollapsed ? '' : 'max-[1200px]:size-5',
              )}
            />
          </div>
          <p className="text-[12px] md:text-[13px] font-medium text-slate-500 flex items-center gap-2">
            <Phone className="size-3 lg:size-3.5 opacity-40 shrink-0" />
            <span className="truncate">{row.phoneNumber || 'N/A'}</span>
          </p>
          <p className="text-[10px] md:text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mt-0.5">
            ID: #{row.userId}
          </p>
        </div>
      </div>

      {/* Center Column: Core Interest */}
      <div
        className={cn(
          'md:col-span-2d col-span-4  gap-2 min-w-0  border-dotted  border-slate-400 dark:border-slate-800/50',
          isSidebarCollapsed
            ? 'max-[1024px]:my-3 max-[1024px]:border-y max-[1024px]:py-3'
            : 'max-[1200px]:col-span-2 max-[1200px]:my-3 max-[1200px]:border-y max-[1200px]:py-3',
        )}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="size-3.5 text-blue-600/60" /> Core Interest
        </span>
        <p className="text-[13px] md:text-[14px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed italic">
          "{row.topItems}"
        </p>
      </div>

      {/* Right Column: Statistics */}
      <div
        className={cn(
          'md:col-span-2 lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center  justify-end gap-6 xl:gap-12 dark:border-slate-800/50 pt-5 lg:pt-0 lg:pl-6 xl:pl-8',
          isSidebarCollapsed
            ? 'max-[1024px]:justify-between'
            : 'max-[1200px]:justify-between ',
        )}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Orders
          </span>
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-blue-600" />
            <span className="font-black text-slate-900 dark:text-white text-base md:text-lg">
              {row.totalOrders}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Invested
          </span>
          <span className="font-black text-slate-900 dark:text-white text-base md:text-lg block">
            ₹
            {row.totalSpent.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
            })}
          </span>
        </div>

        <div className="space-y-1 min-w-max">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="size-3.5 text-blue-600/60" /> Last Visit
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300 text-[13px] md:text-[14px] whitespace-nowrap block">
            {formatDateTime(row.lastOrderDate)}
          </span>
        </div>
      </div>
    </Link>
  </div>
)

const CustomerActivityTable: React.FC<CustomerActivityProps> = ({ rid }) => {
  const { currentDateRange } = useDateFilterStore()
  const { state } = useSidebar()
  const isSidebarCollapsed = state === 'collapsed'

  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const { data = [], isLoading } = useCustomerOrdersQuery(queryParams)

  const { visibleItems, hasMore, sentinelRef } = useLoadMore(data, 10)

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50"
          ></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Insights
          </h3>
          <p className="text-[14px] text-slate-500 font-medium mt-1">
            Analyzing purchase patterns and loyalty across your customer base
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
          <User2 className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            No customer activity found for this period
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {visibleItems.map((row) => (
              <CustomerActivityRow
                key={row.userId}
                row={row}
                isSidebarCollapsed={isSidebarCollapsed}
              />
            ))}
          </div>

          {/* Load More Sentinel */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex justify-center py-12 opacity-0 h-10"
            >
              <div className="flex items-center gap-3 text-blue-600 font-bold animate-pulse">
                <div className="size-2.5 bg-blue-600 rounded-full"></div>
                <span>Syncing more profiles...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CustomerActivityTable
