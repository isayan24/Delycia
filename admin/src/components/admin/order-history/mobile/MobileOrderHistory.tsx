import { memo, useState, useCallback, useEffect } from 'react'
import MobileOrderCard from './MobileOrderCard'
import { OrderInfoSkeleton } from '../LoadingSkeleton'
import { TransformedOrder } from '../utils/orderHistoryUtils'
import { PrintBillDialog } from '../shared/PrintBillDialog'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { formatDateTime } from '@/utils/dateUtils'
import { OrderHistoryDateFilter } from '../shared/OrderHistoryDateFilter'
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  CheckCircle,
  XCircle,
  Filter,
  ArrowUp,
  Loader2,
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
import { useLoadMore } from '@/hooks/useLoadMore'

interface MobileOrderHistoryProps {
  orders: TransformedOrder[]
  loading: boolean
  isFetching?: boolean
  error: string | null
  onRetry: () => void
  pagination?: any
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange?: (start_date?: string, end_date?: string, filter_type?: string) => void
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
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Progressive rendering with useLoadMore - natural page scroll
  const { visibleItems, hasMore, sentinelRef } = useLoadMore(orders, 10)

  // Sync server-side loading with local progressive rendering
  useEffect(() => {
    // Trigger server fetch only when local cache is exhausted and no fetch is currently active
    if (
      hasNextPage &&
      !isFetching &&
      visibleItems.length >= orders.length &&
      orders.length > 0
    ) {
      onNextPage?.()
    }
  }, [visibleItems.length, orders.length, hasNextPage, isFetching, onNextPage])

  const handleApplyFilters = (start_date?: string, end_date?: string, filter_type?: string) => {
    onDateRangeChange?.(start_date, end_date, filter_type)
    setIsFilterOpen(false)
  }

  const handleClearAll = () => {
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
        onCall: (order as any).customer?.id,
        restaurantName: selectedRestaurant?.name || '',
        tableNo: order.tableNo,
        customerName: order.customerName || order.customer?.name || 'Guest',
        customerId: (order as any).customer?.id || 'N/A',
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

  // Show/hide scroll to top button based on window scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const total = pagination?.total_orders || 0
  const delivered = pagination?.total_delivered || 0
  const cancelled = pagination?.total_cancelled || 0

  const deliveredPercent = total > 0 ? Math.round((delivered / total) * 100) : 0
  const cancelledPercent = total > 0 ? Math.round((cancelled / total) * 100) : 0

  return (
    <div className="flex flex-col bg-slate-50/30 dark:bg-background-dark/30">
      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-3 p-4">
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-[#fffbf6] dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
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
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-[#fffbf6] dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
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
        <div className="flex flex-col gap-1 rounded-2xl p-4 py-2 bg-[#fffbf6] dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm">
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
      <section className="px-4 py-3 sticky top-0 z-40 bg-slate-50/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#ead9cd]/20 dark:border-primary/5 flex gap-2">
        <div className="flex flex-1 items-stretch rounded-2xl h-10 bg-[#fffbf6] dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden focus-within:border-primary transition-all">
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
              className={`flex size-10 items-center justify-center rounded-2xl border shadow-sm active:scale-95 transition-all bg-[#fffbf6] dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10 text-[#a16b45]`}
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
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  className="text-rose-600 font-bold text-xs h-8 px-2 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  Clear All
                </Button>
              </div>
            </DrawerHeader>

            <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              {/* Date Range Section */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-widest">
                  Date Range
                </p>
                <OrderHistoryDateFilter
                  onFilterChange={handleApplyFilters}
                  className="w-full"
                />
              </div>
            </div>

            <DrawerFooter className="p-6 border-t border-[#ead9cd]/50 dark:border-primary/5">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-[#ead9cd] font-bold text-slate-600 dark:border-primary/10 dark:text-slate-300"
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>

      {/* Orders List - Progressive rendering with natural page scroll */}
      <main className="flex flex-col gap-4 px-4 pb-20">
        {loading && orders.length === 0 ? (
          <LoadingState />
        ) : error && orders.length === 0 ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : orders.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <>
            {visibleItems.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                onPrintBill={() => handlePrintBill(order)}
              />
            ))}

            {/* Intersection Observer Sentinel for Progressive Loading */}
            {(hasNextPage || hasMore) && (
              <div
                ref={sentinelRef}
                className="flex flex-col items-center justify-center py-12 gap-3"
              >
                {isFetching || (hasNextPage && !hasMore) ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-6 text-primary animate-spin" />
                    <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest">
                      Loading more...
                    </p>
                  </div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[#ead9cd] animate-pulse" />
                )}
              </div>
            )}

            {!hasNextPage && !hasMore && orders.length > 0 && (
              <div className="py-12 text-center">
                <p className="text-[10px] font-bold text-[#a16b45]/40 uppercase tracking-widest">
                  End of Order History
                </p>
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-50 size-12 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 active:scale-95 transition-all duration-300 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </div>
  )
})

export default MobileOrderHistory
