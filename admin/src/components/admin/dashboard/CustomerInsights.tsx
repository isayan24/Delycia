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
  <div className="group bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 p-4 md:p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-3 md:gap-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="size-10 md:size-12 rounded-full bg-orange-50 dark:bg-[#3a291d] text-orange-600 flex items-center justify-center font-bold text-base md:text-lg border border-orange-100 dark:border-primary/5 overflow-hidden">
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
          <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-tight">
            {row.customerName || 'Guest'}
          </span>
          <span className="text-[10px] md:text-xs text-[#a16b45] flex items-center gap-1 font-semibold mt-0.5">
            <Phone className="size-2.5 md:size-3" />
            {row.phoneNumber || 'N/A'}
          </span>
        </div>
      </div>
      <Link
        to="/reports/crm"
        search={{ customerId: row.userId.toString() }}
        className="size-8 md:size-9 rounded-xl bg-orange-50 dark:bg-[#3a291d] text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm"
      >
        <ExternalLink className="size-3.5 md:size-4" />
      </Link>
    </div>

    <div className="grid grid-cols-2 gap-2 md:gap-3 py-2 border-y border-dashed border-[#ead9cd] dark:border-primary/10">
      <div className="flex flex-col gap-0.5 md:gap-1">
        <span className="text-[9px] md:text-[10px] font-black text-[#a16b45] uppercase tracking-widest">
          Orders
        </span>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="size-6 md:size-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center scale-90 md:scale-100">
            <ShoppingBag className="size-3.5 md:size-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">
            {row.totalOrders}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 md:gap-1">
        <span className="text-[9px] md:text-[10px] font-black text-[#a16b45] uppercase tracking-widest">
          Total Spent
        </span>
        <div className="flex items-center gap-1 md:gap-1.5 mt-0.5 md:mt-0">
          <span className="font-black text-emerald-600 text-sm md:text-base">
            ₹
            {row.totalSpent.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </div>

    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between text-[10px] md:text-[11px]">
        <span className="font-bold text-[#a16b45] uppercase tracking-wider flex items-center gap-1 md:gap-1.5">
          <Calendar className="size-3 md:size-3.5" />
          Last Order
        </span>
        <span className="font-bold text-slate-600 dark:text-slate-300">
          {formatDateTime(row.lastOrderDate)}
        </span>
      </div>
      <div className="bg-slate-50 dark:bg-[#3a291d]/30 rounded-xl p-2 md:p-3 border border-slate-100 dark:border-primary/5">
        <span className="text-[9px] md:text-[10px] font-black text-[#a16b45] uppercase tracking-widest block mb-1 md:mb-1.5">
          Frequently Ordered
        </span>
        <p className="text-[11px] md:text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 md:line-clamp-2 italic leading-relaxed">
          {row.topItems}
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
          <p className="text-sm text-[#a16b45] font-bold mt-1">
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
