import { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintBillDialog } from './shared/PrintBillDialog'
import { formatDateTime } from '@/utils/dateUtils'
import { OrderHistoryStatsCards } from './large/components/OrderHistoryStatsCards'
import { LargeOrderFilters } from './large/components/LargeOrderFilters'
import { LargeOrderCard } from './large/components/LargeOrderCard'
import { useMergeOrders } from '@/hooks/mutations/useMergeOrders'
import useToast from '@/hooks/UseToast'

interface OrderHistoryTablePaginatedProps {
  items: any[]
  loading: boolean
  error: string | null
  pagination: any | null
  currentPage: number
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPrevPage: () => void
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
}

export default function OrderHistoryTablePaginated({
  items = [],
  loading,
  error,
  pagination,
  currentPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
}: OrderHistoryTablePaginatedProps) {
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const mergeMutation = useMergeOrders()
  const { showError } = useToast()

  // Get currently selected customer ID to restrict selection
  const activeCustomerId = useMemo(() => {
    if (selectedCartIds.size === 0) return null
    const firstSelectedId = selectedCartIds.values().next().value
    const order = items.find((o) => o.id === firstSelectedId)
    return order?.customerId || order?.customer_id
  }, [selectedCartIds, items])

  const totalPages = pagination?.total_pages || 1
  const totalOrders = pagination?.total_orders || 0
  const hasNextPage = pagination?.has_next_page || false
  const hasPrevPage = pagination?.has_prev_page || false

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

  // Toggle selection for merging
  const toggleSelection = useCallback((cartId: string) => {
    setSelectedCartIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cartId)) {
        newSet.delete(cartId)
      } else {
        newSet.add(cartId)
      }
      return newSet
    })
  }, [])

  // Handle Merge Orders
  const handleMerge = async () => {
    if (selectedCartIds.size < 2) {
      showError('Error', 'Select at least 2 orders to merge')
      return
    }

    const cartIdsArray = Array.from(selectedCartIds)
    const targetCartId = cartIdsArray[0]

    mergeMutation.mutate(
      { cartIds: cartIdsArray, targetCartId },
      {
        onSuccess: (data) => {
          if (data.statusCode === 200) {
            setSelectedCartIds(new Set())
            setIsSelectionMode(false)
          }
        },
      },
    )
  }

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev)
    setSelectedCartIds(new Set())
  }, [])

  return (
    <div className="relative p-4 lg:p-10 space-y-8 bg-slate-50/30">
      {/* Stats Cards */}
      <OrderHistoryStatsCards stats={pagination} />

      {/* Filters Section */}
      <LargeOrderFilters
        search={search}
        onSearchChange={onSearchChange}
        onDateRangeChange={onDateRangeChange}
        onClearFilters={onClearFilters}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={toggleSelectionMode}
        selectedCount={selectedCartIds.size}
        onMerge={handleMerge}
        isMergePending={mergeMutation.isPending}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-[#a16b45] font-medium">Loading orders...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#ead9cd] border-dashed">
            <p className="text-[#a16b45] font-medium">
              No orders found matching your search
            </p>
          </div>
        ) : (
          items.map((order, index) => (
            <LargeOrderCard
              key={`${order.id}-${index}`}
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
          ))
        )}
      </div>

      {/* Pagination Style matched to mockup */}
      <div className="pt-6 border-t border-[#ead9cd] dark:border-primary/10 flex items-center justify-between">
        <p className="text-sm text-[#a16b45]">
          Showing{' '}
          <span className="font-bold text-[#1d130c] dark:text-white">
            {items.length}
          </span>{' '}
          of {totalOrders} orders
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevPage}
            disabled={!hasPrevPage || loading}
            className="size-10 rounded-xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 text-[#a16b45] hover:text-primary transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Simple Page Numbers */}
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
            <Button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`size-10 rounded-xl font-bold transition-all ${
                currentPage === i + 1
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary'
                  : 'bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 text-[#a16b45] hover:text-primary'
              }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={onNextPage}
            disabled={!hasNextPage || loading}
            className="size-10 rounded-xl bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 text-[#a16b45] hover:text-primary transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Print Bill Dialog */}
      <PrintBillDialog
        open={showBillDialog}
        onOpenChange={setShowBillDialog}
        billData={selectedOrderForBill}
      />
    </div>
  )
}
