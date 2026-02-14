import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import MobileOrderCard from './MobileOrderCard'
import { OrderInfoSkeleton } from '../LoadingSkeleton'
import { TransformedOrder } from '../utils/orderHistoryUtils'
import { PrintBillDialog } from '../shared/PrintBillDialog'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { formatDateTime } from '@/utils/dateUtils'
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

import { useLoadMore } from '@/hooks/useLoadMore'
import { Loader2 } from 'lucide-react'

interface MobileOrderHistoryProps {
  orders: TransformedOrder[]
  loading: boolean
  isFetching?: boolean
  error: string | null
  onRetry: () => void
  pagination?: any
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange?: (start_date?: string, end_date?: string) => void
  onClearFilters?: () => void
  hasNextPage?: boolean
  onNextPage?: () => void
}

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
    <div className="text-4xl mb-3">📋</div>
    <h3 className="text-base font-medium mb-2">No Orders Found</h3>
    <p className="text-sm text-center">
      There are no orders in the history yet.
    </p>
  </div>
))
EmptyState.displayName = 'EmptyState'

// Error state component
const ErrorState = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-base font-medium mb-2">Error Loading Orders</h3>
      <p className="text-sm text-center mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm"
      >
        Try Again
      </button>
    </div>
  ),
)
ErrorState.displayName = 'ErrorState'

// Loading state component
const LoadingState = memo(() => (
  <div className="space-y-4 px-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <OrderInfoSkeleton />
      </div>
    ))}
  </div>
))
LoadingState.displayName = 'LoadingState'

const MobileOrderHistory = memo(function MobileOrderHistory({
  orders,
  loading,
  isFetching,
  error,
  onRetry,
  pagination,
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
  hasNextPage,
  onNextPage,
}: MobileOrderHistoryProps) {
  const { selectedRestaurant } = useRestaurantSelector()
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const handleApplyFilters = () => {
    const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined
    const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
    onDateRangeChange?.(start, end)
    setIsFilterOpen(false)
  }

  const handleClearAll = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onClearFilters?.()
    setIsFilterOpen(false)
  }

  const handlePrintBill = useCallback(
    (order: TransformedOrder) => {
      const billItems = order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant_name: item.variant_name,
        addons: item.addons,
      }))

      const billData = {
        orderId: order.orderId,
        restaurantName: selectedRestaurant?.name || '',
        tableNo: order.tableNo,
        customerName: order.customerName || order.customer?.name || 'Guest',
        customerId: String(order.customerId) || 'N/A',
        customerPhone: order.customer?.phone || 'N/A',
        items: billItems,
        discountAmount: parseFloat(String(order.discountAmount || 0)),
        totalAmount: order.totalAmount,
        orderDate: formatDateTime(order.createdAt),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      }

      setSelectedOrderForBill(billData)
      setShowBillDialog(true)
    },
    [selectedRestaurant],
  )

  const { visibleItems, sentinelRef } = useLoadMore(orders, 10)

  // Trigger onNextPage when we reach the end of visibleItems and there are more server-side
  useEffect(() => {
    if (hasNextPage && !isFetching && visibleItems.length >= orders.length) {
      onNextPage?.()
    }
  }, [visibleItems.length, orders.length, hasNextPage, isFetching, onNextPage])

  const filteredOrders = useMemo(() => {
    return visibleItems
  }, [visibleItems])

  const total = pagination?.total_orders || 0
  const delivered = pagination?.total_delivered || 0
  const cancelled = pagination?.total_cancelled || 0

  const deliveredPercent = total > 0 ? Math.round((delivered / total) * 100) : 0
  const cancelledPercent = total > 0 ? Math.round((cancelled / total) * 100) : 0

  return (
    <div className="flex flex-col gap-0 pb-20 bg-slate-50/30 dark:bg-background-dark/30 min-h-screen">
      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-3 p-4">
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
          <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-wider">
            Orders
          </p>
          <p className="text-md font-semibold leading-tight text-slate-900 dark:text-white">
            {pagination?.total_orders || 0}
          </p>
          <div className="flex items-center gap-1 text-primary text-[10px] font-bold">
            <TrendingUp className="size-3" />
            <span>Total</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Done
          </p>
          <p className="text-md font-semibold leading-tight text-slate-900 dark:text-white">
            {pagination?.total_delivered || 0}
          </p>
          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
            <CheckCircle className="size-3" />
            <span>{deliveredPercent}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Lost
          </p>
          <p className="text-md font-semibold leading-tight text-slate-900 dark:text-white">
            {pagination?.total_cancelled || 0}
          </p>
          <div className="flex items-center gap-1 text-rose-400 text-[10px] font-bold">
            <XCircle className="size-3" />
            <span>{cancelledPercent}%</span>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="px-4 py-3 sticky top-0 z-40 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#ead9cd]/20 dark:border-primary/5 flex gap-2">
        <div className="flex flex-1 items-stretch rounded-2xl h-10 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden focus-within:border-primary transition-all">
          <div className="text-[#a16b45] flex items-center justify-center pl-4">
            <Search className="size-5" />
          </div>
          <input
            className="w-full border-none bg-transparent focus:outline-none focus:border-0 px-3 text-sm font-normal text-slate-900 dark:text-white placeholder:text-[#a16b45]/50"
            placeholder="Search orders..."
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Functional Filter Drawer */}
        <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DrawerTrigger asChild>
            <button
              className={`flex size-10 items-center justify-center rounded-2xl border shadow-sm active:scale-95 transition-all ${
                startDate || endDate
                  ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200 dark:shadow-none'
                  : 'bg-white dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10 text-[#a16b45]'
              }`}
            >
              <SlidersHorizontal className="size-5" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-white dark:bg-[#1d130c] border-[#ead9cd] dark:border-primary/10">
            <DrawerHeader className="border-b border-[#ead9cd]/50 dark:border-primary/5 px-6 pb-4">
              <div className="flex items-center justify-between w-full">
                <DrawerTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="size-5 text-primary" />
                  Filter Orders
                </DrawerTitle>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    onClick={handleClearAll}
                    className="text-rose-600 font-bold text-xs h-8 px-2 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </DrawerHeader>

            <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              {/* Date Range Section */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-widest">
                  Date Range
                </p>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      From
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start font-bold text-sm rounded-xl border-[#ead9cd] dark:border-primary/10 dark:bg-[#2d1e14]"
                        >
                          <CalendarIcon className="mr-2 size-4 text-[#a16b45]" />
                          {startDate ? format(startDate, 'dd MMM') : 'Start'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-2xl border-[#ead9cd] shadow-2xl"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      To
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-start font-bold text-sm rounded-xl border-[#ead9cd] dark:border-primary/10 dark:bg-[#2d1e14]"
                        >
                          <CalendarIcon className="mr-2 size-4 text-[#a16b45]" />
                          {endDate ? format(endDate, 'dd MMM') : 'End'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-2xl border-[#ead9cd] shadow-2xl"
                        align="end"
                      >
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter className="p-6 border-t border-[#ead9cd]/50 dark:border-primary/5">
              <div className="flex gap-3">
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-[#ead9cd] font-bold text-slate-600 dark:border-primary/10 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-primary/90"
                >
                  Apply Filters
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>

      {/* Orders List */}
      <main className="flex flex-col gap-4 px-4 mt-2">
        {loading && orders.length === 0 ? (
          <LoadingState />
        ) : error && orders.length === 0 ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : orders.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <>
            {filteredOrders.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                onPrintBill={() => handlePrintBill(order)}
              />
            ))}

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            {(hasNextPage || isFetching || loading) && (
              <div ref={sentinelRef} className="flex justify-center p-6">
                {(isFetching || loading) && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-6 text-primary animate-spin" />
                    <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest">
                      Loading more...
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <PrintBillDialog
        open={showBillDialog}
        onOpenChange={setShowBillDialog}
        billData={selectedOrderForBill}
      />
    </div>
  )
})

export default MobileOrderHistory
