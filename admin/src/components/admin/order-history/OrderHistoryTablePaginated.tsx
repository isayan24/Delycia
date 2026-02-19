import { useState, useCallback, useEffect } from 'react'
import { Loader2, ArrowUp } from 'lucide-react'
import { PrintBillDialog } from './shared/PrintBillDialog'
import { formatDateTime } from '@/utils/dateUtils'
import { OrderHistoryStatsCards } from './large/components/OrderHistoryStatsCards'
import { LargeOrderFilters } from './large/components/LargeOrderFilters'
import { useLoadMore } from '@/hooks/useLoadMore'
import LargeOrderCard from './large/components/LargeOrderCard'
import { LargeOrderCardSkeleton } from './LoadingSkeleton'

interface OrderHistoryTablePaginatedProps {
  items: any[]
  loading: boolean
  isFetching?: boolean
  error: string | null
  pagination: any | null
  hasNextPage?: boolean
  onNextPage: () => void
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange: (
    start_date?: string,
    end_date?: string,
    filter_type?: string,
  ) => void
  onClearFilters: () => void
  // Selection Props
  selectedCartIds: Set<string>
  isSelectionMode: boolean
  activeCustomerId: string | null
  toggleSelection: (cartId: string) => void
  toggleSelectionMode: () => void
  onMerge: () => void
  isMergePending: boolean
}

export default function OrderHistoryTablePaginated({
  items = [],
  loading,
  isFetching,
  error,
  pagination,
  hasNextPage,
  onNextPage,
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
  // Selection Props
  selectedCartIds,
  isSelectionMode,
  activeCustomerId,
  toggleSelection,
  toggleSelectionMode,
  onMerge,
  isMergePending,
}: OrderHistoryTablePaginatedProps) {
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Progressive rendering with useLoadMore - natural page scroll
  const { visibleItems, hasMore, sentinelRef } = useLoadMore(items, 10)

  // Sync server-side loading with local progressive rendering
  useEffect(() => {
    // Trigger server fetch only when local cache is exhausted and no fetch is currently active
    if (
      hasNextPage &&
      !isFetching &&
      visibleItems.length >= items.length &&
      items.length > 0
    ) {
      onNextPage()
    }
  }, [visibleItems.length, items.length, hasNextPage, isFetching, onNextPage])

  // Show/hide scroll to top button based on window scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const totalOrders = pagination?.total_orders || 0

  // Print bill handler
  const handlePrintBill = useCallback((order: any) => {
    const items = order.items || []

    const billItems = items.map((item: any) => ({
      name: item.name || item.item_name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: item.price || 0,
      variant_name: item.variant_name,
      addons:
        typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons,
    }))

    const billData = {
      orderId: order.orderId || order.cart_id || order.id || 'N/A',
      tableNo: order.tableNo || order.table_no || order.table_number || 'N/A',
      tableZone: order.tableZone || order.table_zone || '',
      customerName: order.customerName || order.customer_name || 'Guest',
      customerPhone: order.customer_phone || order.customerPhone || 'N/A',
      items: billItems,
      totalAmount: parseFloat(order.totalAmount || 0),
      discountAmount: parseFloat(order.discountAmount || 0),
      rid: order.rid || order.restaurant_id,
      orderDate: formatDateTime(order.createdAt || order.created_at),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  return (
    <div className="relative bg-slate-50/30">
      <div className="p-4 lg:p-10 pb-4">
        <OrderHistoryStatsCards stats={pagination} loading={loading} />
      </div>

      {/* Filters Section - Sticky */}
      <LargeOrderFilters
        search={search}
        onSearchChange={onSearchChange}
        onDateRangeChange={onDateRangeChange}
        onClearFilters={onClearFilters}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={toggleSelectionMode}
        selectedCount={selectedCartIds.size}
        onMerge={onMerge}
        isMergePending={isMergePending}
      />

      {/* Error State */}
      {error && (
        <div className="px-4 lg:px-10 pb-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Orders List - Progressive rendering with natural page scroll */}
      <div className="px-4 lg:px-10 space-y-6 pb-8">
        {loading && items.length === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <LargeOrderCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#ead9cd] border-dashed">
            <p className="text-[#a16b45] font-medium">
              No orders found matching your search
            </p>
          </div>
        ) : (
          <>
            {visibleItems.map((order) => (
              <LargeOrderCard
                key={order.id}
                order={order}
                onPrintBill={handlePrintBill}
                isSelectionMode={isSelectionMode}
                isSelected={selectedCartIds.has(order.id)}
                onSelect={() => toggleSelection(order.id)}
                isSelectionDisabled={
                  activeCustomerId !== null &&
                  activeCustomerId !== (order.customerId || order.customer_id)
                }
              />
            ))}

            {/* Intersection Observer Sentinel for Progressive Loading */}
            {(hasNextPage || hasMore) && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-8 text-sm text-slate-400 gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading more orders...
              </div>
            )}

            {!hasNextPage && !hasMore && items.length > 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-[#a16b45]/40 uppercase tracking-widest">
                  End of Order History
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Summary */}
      {items.length > 0 && (
        <div className="px-4 lg:px-10 py-6 border-t border-[#ead9cd] dark:border-primary/10 flex items-center justify-between bg-white dark:bg-slate-900/10">
          <p className="text-sm text-[#a16b45]">
            Showing{' '}
            <span className="font-bold text-[#1d130c] dark:text-white">
              {visibleItems.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-[#1d130c] dark:text-white">
              {totalOrders}
            </span>{' '}
            orders
          </p>
          {(hasNextPage || hasMore) && (
            <p className="text-xs text-[#a16b45] italic">Scroll to load more</p>
          )}
        </div>
      )}

      {/* Print Bill Dialog */}
      <PrintBillDialog
        open={showBillDialog}
        onOpenChange={setShowBillDialog}
        billData={selectedOrderForBill}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 size-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </button>
      )}
    </div>
  )
}
