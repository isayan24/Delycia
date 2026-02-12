import { useState, useCallback, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer } from 'lucide-react'
import { formatISTDateTime } from './utils/historyDateUtils'
import { formatDateTime } from '@/utils/dateUtils'
import { TableFilters } from './table/components/TableFilters'
import { TablePagination } from './table/components/TablePagination'
import { OrderItemsCell } from './table/components/OrderItemsCell'
import { PrintBillDialog } from './shared/PrintBillDialog'
import { Checkbox } from '@/components/ui/checkbox'
import OrderTotalWithTooltip from './shared/OrderTotalWithTooltip'

import { useMergeOrders } from '@/hooks/mutations/useMergeOrders'
import useToast from '@/hooks/UseToast'

interface OrderHistoryTablePaginatedProps {
  items: any[]
  loading: boolean
  error: string | null
  pagination: {
    total_orders: number
    total_pages: number
    current_page: number
    per_page: number
    has_next_page: boolean
    has_prev_page: boolean
  } | null
  currentPage: number
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPrevPage: () => void
  search: string
  onSearchChange: (search: string) => void
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
  onRefresh?: () => void
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
  onRefresh,
}: OrderHistoryTablePaginatedProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const mergeMutation = useMergeOrders()
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

  const { showError } = useToast()

  // Get currently selected customer ID to restrict selection
  const activeCustomerId = useMemo(() => {
    if (selectedCartIds.size === 0) return null
    // Find the first selected order to get its customer ID
    // We convert Set to Array and take the first one
    const firstSelectedId = selectedCartIds.values().next().value
    const order = items.find((o) => o.id === firstSelectedId)
    return order?.customerId
  }, [selectedCartIds, items])

  const totalPages = pagination?.total_pages || 1
  const totalOrders = pagination?.total_orders || 0
  const hasNextPage = pagination?.has_next_page || false
  const hasPrevPage = pagination?.has_prev_page || false

  // Toggle expanded state for order items
  const toggleOrderItems = useCallback((cartId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cartId)) {
        newSet.delete(cartId)
      } else {
        newSet.add(cartId)
      }
      return newSet
    })
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

    const selectedOrders = items.filter((order) =>
      selectedCartIds.has(order.id),
    )
    const firstCustomerId = selectedOrders[0]?.customerId

    const isSameCustomer = selectedOrders.every(
      (order) => order.customerId === firstCustomerId,
    )

    if (!isSameCustomer) {
      showError('Error', 'All selected orders must belong to the same customer')
      return
    }

    const cartIdsArray = Array.from(selectedCartIds)
    const targetCartId = cartIdsArray[0]

    mergeMutation.mutate(
      { cartIds: cartIdsArray, targetCartId },
      {
        onSuccess: () => {
          setSelectedCartIds(new Set())
          setIsSelectionMode(false)
          if (onRefresh) onRefresh()
        },
      },
    )
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedCartIds(new Set())
  }

  // Print bill handler
  const handlePrintBill = useCallback((order: any) => {
    const items = order.items
      ? typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
      : []

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
      customerName:
        order.customerName ||
        order.customer_name ||
        order.customer?.name ||
        'Guest',
      customerPhone:
        order.customer_phone ||
        order.customerPhone ||
        order.customer?.phone ||
        'N/A',
      items: billItems,
      totalAmount: parseFloat(order.totalAmount || order.total_amount || 0),
      discountAmount: parseFloat(
        order.discountAmount || order.discount_amount || 0,
      ),
      rid: order.rid || order.restaurant_id,
      orderDate: formatDateTime(order.createdAt || order.created_at),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  return (
    <div className="w-full h-[calc(100vh-10rem)] flex flex-col relative">
      {/* Filters Section */}
      <div className="mb-3">
        <TableFilters
          search={search}
          onSearchChange={onSearchChange}
          onDateRangeChange={onDateRangeChange}
          onClearFilters={onClearFilters}
          // Merge Props
          isSelectionMode={isSelectionMode}
          toggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedCartIds.size}
          onMerge={handleMerge}
          isMergePending={mergeMutation.isPending}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mx-4 mt-2">
            {error}
          </div>
        )}

        {/* Merge Actions Bar */}
      </div>

      {/* Table - Scrollable */}
      <Table className="overflow-auto mb-12">
        <TableHeader>
          <TableRow className="bg-gray-50">
            {isSelectionMode && <TableHead className="w-[50px]"></TableHead>}
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold w-[80px]">
              ID
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold">
              Items
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold">
              Customer
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold">
              Status
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold hidden lg:table-cell">
              Discount
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold">
              Amount
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold hidden md:table-cell">
              Table
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold hidden sm:table-cell">
              Date & Time
            </TableHead>
            <TableHead className="py-2 px-2 text-xs sm:text-sm font-semibold text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isSelectionMode ? 10 : 9}
                className="text-center py-8"
              >
                <div className="text-gray-500 text-sm">
                  {loading ? 'Loading orders...' : 'No orders found'}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((order, index) => (
              <TableRow
                key={`${order.cartId}-${index}`}
                className="hover:bg-gray-50"
              >
                {/* Checkbox */}
                {isSelectionMode && (
                  <TableCell className="py-3 px-3">
                    <Checkbox
                      checked={selectedCartIds.has(order.id)}
                      onCheckedChange={() => toggleSelection(order.id)}
                      disabled={
                        activeCustomerId !== null &&
                        activeCustomerId !== order.customerId
                      }
                    />
                  </TableCell>
                )}

                {/* ID */}
                <TableCell className="py-2 px-2">
                  <div className="font-mono text-[10px] sm:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-none">
                    #{order.orderId || order.id || 'N/A'}
                  </div>
                </TableCell>

                {/* Items */}
                <TableCell className="py-2 px-2 max-w-[150px] sm:max-w-[200px]">
                  <OrderItemsCell
                    order={order}
                    expandedOrders={expandedOrders}
                    onToggleExpand={toggleOrderItems}
                  />
                </TableCell>

                {/* Customer */}
                <TableCell className="py-2 px-2">
                  <div className="text-xs sm:text-sm">
                    <div className="truncate max-w-[80px] sm:max-w-none">
                      {order.customerName ||
                        order.customer_name ||
                        order.customer?.name ||
                        'N/A'}
                    </div>
                    <div className="text-[10px] text-gray-500 hidden sm:block">
                      {order.customerId ||
                        order.customer_id ||
                        order.customer?.phone ||
                        ''}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2 px-2">
                  <Badge
                    variant="outline"
                    className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-[500] uppercase tracking-wider ${
                      order.order_status === 'completed' ||
                      order.status === 'DELIVERED'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {order.order_status === 'completed' ||
                    order.status === 'DELIVERED'
                      ? 'DELIVERED'
                      : 'CANCELLED'}
                  </Badge>
                </TableCell>

                {/* Discount */}
                <TableCell className="py-2 px-2 hidden lg:table-cell">
                  {(() => {
                    const discountValue = parseFloat(
                      order.discountAmount || order.discount_amount || 0,
                    )
                    return discountValue > 0 ? (
                      <div className="text-xs sm:text-sm text-green-600 font-medium">
                        -₹{discountValue.toFixed(0)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400">---</div>
                    )
                  })()}
                </TableCell>

                {/* Amount */}
                <TableCell className="py-2 px-2">
                  <div className="scale-90 origin-left sm:scale-100">
                    <OrderTotalWithTooltip
                      subtotal={parseFloat(order.totalAmount || 0)}
                      discountAmount={parseFloat(
                        order.discountAmount || order.discount_amount || 0,
                      )}
                      rid={order.rid || order.restaurant_id}
                    />
                  </div>
                </TableCell>

                {/* Table */}
                <TableCell className="py-2 px-2 hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm">
                      {order.tableZone || ''}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {order.tableNo ? `Table ${order.tableNo}` : 'N/A'}
                    </span>
                  </div>
                </TableCell>

                {/* Date & Time */}
                <TableCell className="py-2 px-2 hidden sm:table-cell">
                  <div className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                    {formatDateTime(order.createdAt || order.created_at)}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-2 px-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrintBill(order)}
                    className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 p-0 sm:gap-1.5"
                    title="Print Bill"
                  >
                    <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-xs">Print</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination - Fixed at bottom */}
      <div className="absolute bottom-0 w-full">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          loading={loading}
          totalOrders={totalOrders}
          perPage={pagination?.per_page}
        />
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
