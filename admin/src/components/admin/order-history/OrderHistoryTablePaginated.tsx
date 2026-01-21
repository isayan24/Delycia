import { useState, useCallback } from 'react'
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

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
    }))

    const billData = {
      orderId: order.orderId || order.cart_id || order.id || 'N/A',
      tableNo: order.tableNo || order.table_no || 'N/A',
      customerName:
        order.customerName ||
        order.customer_name ||
        order.customer?.name ||
        'Guest',
      customerId:
        order.customer_phone ||
        order.customerId ||
        order.customer_id ||
        order.customer?.phone ||
        'N/A',
      items: billItems,
      totalAmount: parseFloat(order.totalAmount || order.total_amount || 0),
      orderDate: getISTDateKey(order.createdAt || order.created_at),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filters Section */}
      <div className="shrink-0">
        <TableFilters
          search={search}
          onSearchChange={onSearchChange}
          onDateRangeChange={onDateRangeChange}
          onClearFilters={onClearFilters}
          totalOrders={totalOrders}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mx-4 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="border rounded-lg mx-4 mt-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-3 text-sm font-semibold">
                  Items
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold">
                  Customer
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold">
                  Status
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold">
                  Amount
                </TableHead>
                <TableHead className="py-3 text-sm font-semibold">
                  Table
                </TableHead>
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
                  <TableCell colSpan={7} className="text-center py-8">
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
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="flex-shrink-0">
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
