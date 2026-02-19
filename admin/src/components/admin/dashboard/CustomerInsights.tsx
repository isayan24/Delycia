import React, { useMemo } from 'react'
import { ShoppingBag, ExternalLink, Phone, Calendar } from 'lucide-react'
import { useCustomerOrdersQuery } from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { Link } from '@tanstack/react-router'
import { formatDateTime } from '@/utils/dateUtils'
import { useLoadMore } from '@/hooks/useLoadMore'

interface CustomerActivityProps {
  rid: string
}

const CustomerActivityCard: React.FC<{ row: any }> = ({ row }) => (
  <div className="group bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="size-11 md:size-12 rounded-full bg-slate-50 dark:bg-[#3a291d] text-slate-400 flex items-center justify-center font-bold text-lg md:text-xl border border-slate-100 dark:border-primary/5 overflow-hidden">
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
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-white text-[15px] md:text-lg leading-tight group-hover:text-orange-600 transition-colors">
            {row.customerName || 'Guest'}
          </span>
          <span className="text-[11px] md:text-sm text-slate-400 flex items-center gap-1 font-medium mt-1">
            <Phone className="size-2.5 md:size-3" />
            {row.phoneNumber || 'N/A'}
          </span>
        </div>
      </div>
      <Link
        to="/reports/crm"
        search={{ customerId: row.userId.toString() }}
        className="size-8 rounded-lg text-slate-300 group-hover:text-orange-500 flex items-center justify-center transition-colors"
      >
        <ExternalLink className="size-4 md:size-4.5" />
      </Link>
    </div>

    <div className="grid grid-cols-2 gap-4 py-1">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Recent Orders
        </span>
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-3.5 md:size-4 text-orange-500" />
          <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
            {row.totalOrders}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Total Invested
        </span>
        <div className="flex items-center">
          <span className="font-black text-slate-900 dark:text-white text-sm md:text-base">
            ₹
            {row.totalSpent.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </div>

    <div className="space-y-4 pt-1">
      <div className="flex items-center justify-between text-[11px] md:text-[13px]">
        <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="size-3 md:size-3.5" />
          Last Visit
        </span>
        <span className="font-bold text-slate-600 dark:text-slate-300">
          {formatDateTime(row.lastOrderDate)}
        </span>
      </div>
      <div className="space-y-1.5">
        <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
          Core Interest
        </span>
        <p className="text-[12px] md:text-[14px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">
          "{row.topItems}"
        </p>
      </div>
    </div>
  </div>
)

const CustomerActivityTable: React.FC<CustomerActivityProps> = ({ rid }) => {
  const { currentDateRange } = useDateFilterStore()

  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const { data = [], isLoading } = useCustomerOrdersQuery(queryParams)

  const { visibleItems, hasMore, sentinelRef } = useLoadMore(data, 9)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10"
          ></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Insights
          </h3>
          <p className="text-sm text-[#a16b45] font-[500] mt-1">
            Analyzing purchase patterns and loyalty
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-[#2d1e14] rounded-2xl border border-dashed border-[#ead9cd] dark:border-primary/20 p-20 text-center">
          <ShoppingBag className="size-12 text-[#ead9cd] mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            No customer activity found for this period
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleItems.map((row) => (
              <CustomerActivityCard key={row.userId} row={row} />
            ))}
          </div>

          {/* Load More Sentinel */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex justify-center py-10 mt-4 opacity-0 h-10"
            >
              <div className="flex items-center gap-2 text-[#a16b45] font-bold animate-pulse">
                <div className="size-2 bg-[#a16b45] rounded-full"></div>
                <span>Loading more...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CustomerActivityTable
