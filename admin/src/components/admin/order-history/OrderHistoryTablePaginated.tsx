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
import { formatISTDateTime, getISTDateKey } from './utils/historyDateUtils'
import { TableFilters } from './table/components/TableFilters'
import { TablePagination } from './table/components/TablePagination'
import { OrderItemsCell } from './table/components/OrderItemsCell'
import { PrintBillDialog } from './shared/PrintBillDialog'
import { Checkbox } from '@/components/ui/checkbox'

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

  const { showError, showSuccess } = useToast()

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
      tableNo: order.tableNo || order.table_no || 'N/A',
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
      orderDate: getISTDateKey(order.createdAt || order.created_at),
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
            <TableHead className="py-3 text-sm font-semibold w-[100px]">
              ID
            </TableHead>
            <TableHead className="py-3 text-sm font-semibold">Items</TableHead>
            <TableHead className="py-3 text-sm font-semibold">
              Customer
            </TableHead>
            <TableHead className="py-3 text-sm font-semibold">Status</TableHead>
            <TableHead className="py-3 text-sm font-semibold">
              Discount
            </TableHead>
            <TableHead className="py-3 text-sm font-semibold">Amount</TableHead>
            <TableHead className="py-3 text-sm font-semibold">Table</TableHead>
            <TableHead className="py-3 text-sm font-semibold">
              Date & Time
            </TableHead>
            <TableHead className="py-3 text-sm font-semibold">
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
                <TableCell className="py-3 px-3">
                  <div className="font-mono text-xs text-gray-500">
                    #{order.orderId || order.id || 'N/A'}
                  </div>
                </TableCell>

                {/* Items */}
                <TableCell className="py-3 px-3 max-w-[200px]">
                  <OrderItemsCell
                    order={order}
                    expandedOrders={expandedOrders}
                    onToggleExpand={toggleOrderItems}
                  />
                </TableCell>

                {/* Customer */}
                <TableCell className="py-3 px-3">
                  <div className="text-sm">
                    <div className="font-medium">
                      {order.customerName ||
                        order.customer_name ||
                        order.customer?.name ||
                        'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customerId ||
                        order.customer_id ||
                        order.customer?.phone ||
                        ''}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3 px-3">
                  <Badge
                    className={`px-2.5 py-1 text-xs ${
                      order.order_status === 'completed' ||
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {order.order_status === 'completed' ||
                    order.status === 'DELIVERED'
                      ? 'DELIVERED'
                      : 'CANCELLED'}
                  </Badge>
                </TableCell>

                {/* Discount */}
                <TableCell className="py-3 px-3">
                  {(() => {
                    const discountValue = parseFloat(
                      order.discountAmount || order.discount_amount || 0,
                    )
                    return discountValue > 0 ? (
                      <div className="text-sm text-green-600 font-medium">
                        -₹{discountValue.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">---</div>
                    )
                  })()}
                </TableCell>

                {/* Amount */}
                <TableCell className="py-3 px-3">
                  <div className="text-sm font-semibold">
                    ₹{order.totalAmount || order.total_amount || 0}
                  </div>
                </TableCell>

                {/* Table */}
                <TableCell className="py-3 px-3 text-sm">
                  {order.tableNo || order.table_no || 'N/A'}
                </TableCell>

                {/* Date & Time */}
                <TableCell className="py-3 px-3">
                  <div className="text-xs text-gray-600">
                    {formatISTDateTime(
                      order.createdAt || order.created_at || '',
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrintBill(order)}
                    className="h-8 px-3 text-sm gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Print
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
