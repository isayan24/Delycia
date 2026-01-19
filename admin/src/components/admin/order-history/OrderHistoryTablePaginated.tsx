import React, { useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  Printer,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getISTDateKey,
  formatISTDateTime,
  convertToIST,
} from './utils/historyDateUtils'
import ThermalBill from './ThermalBill'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface OrderHistoryTablePaginatedProps {
  items: any[]
  loading: boolean
  error: string | null
  refreshHistory: () => void
  // Pagination props
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
  // Search props
  search: string
  onSearchChange: (search: string) => void
  // Filter props
  onDateRangeChange: (start_date?: string, end_date?: string) => void
  onClearFilters: () => void
}

export default function OrderHistoryTablePaginated({
  items = [],
  loading,
  error,
  refreshHistory,
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
  const [showFilters, setShowFilters] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

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

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!items.length) return

    const headers = [
      'Order ID',
      'Cart ID',
      'Customer Name',
      'Customer ID',
      'Status',
      'Payment Method',
      'Payment Status',
      'Total Amount',
      'Table No',
      'Delivery Type',
      'Date & Time (IST)',
      'Quantity',
    ]

    const csvData = items.map((order) => [
      order.orderId || order.id || '',
      order.cart_id || '',
      order.customer_name || order.customer?.name || '',
      order.customer_id || '',
      order.order_status || order.status || '',
      order.payment_method || order.paymentMethod || '',
      order.payment_status || order.paymentStatus || '',
      `₹${order.total_amount || order.totalAmount || 0}`,
      order.table_no || order.tableNo || '',
      order.delivery_type || order.deliveryType || '',
      formatISTDateTime(order.created_at || order.createdAt),
      order.quantity || 1,
    ])

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `order-history-${format(new Date(), 'yyyy-MM-dd')}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [items])

  // Print bill handler
  const handlePrintBill = useCallback((order: any) => {
    // Parse items if they're a JSON string
    const items = order.items
      ? typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
      : []

    // Transform items to the format expected by ThermalBill
    const billItems = items.map((item: any) => ({
      name: item.name || item.item_name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: item.price || 0,
    }))

    const billData = {
      orderId: order.orderId || order.id || order.cart_id || 'N/A',
      tableNo: order.table_no || order.tableNo || 'N/A',
      customerName: order.customer_name || order.customer?.name || 'N/A',
      customerId: order.customer_id || order.customer?.phone || 'N/A',
      items: billItems,
      totalAmount: parseFloat(order.total_amount || order.totalAmount || 0),
      orderDate: getISTDateKey(order.created_at || order.createdAt),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  // Handle date range change
  const handleDateRangeApply = () => {
    const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined
    const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
    onDateRangeChange(start, end)
  }

  // Clear date filters
  const handleClearDateFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onDateRangeChange(undefined, undefined)
  }

  // Render order items with collapse/expand
  const renderOrderItems = useCallback(
    (order: any) => {
      const items = order.items
        ? typeof order.items === 'string'
          ? JSON.parse(order.items)
          : order.items
        : []

      if (!items || items.length === 0) {
        return <div className="text-gray-500 text-sm">No items</div>
      }

      const cartId = order.cart_id || order.id
      const isExpanded = expandedOrders.has(cartId)
      const itemsToShow = isExpanded ? items : items.slice(0, 1)

      return (
        <div className="space-y-1">
          {itemsToShow.map((item: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">
                {item.name || item.item_name || 'Unknown Item'}
              </span>
              {item.quantity > 1 && (
                <span className="text-gray-600 ml-1">× {item.quantity}</span>
              )}
            </div>
          ))}

          {items.length > 1 && (
            <button
              onClick={() => toggleOrderItems(cartId)}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show {items.length - 1} more
                </>
              )}
            </button>
          )}
        </div>
      )
    },
    [expandedOrders, toggleOrderItems],
  )

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600 mb-4">
              Error loading order history
            </p>
            <Button onClick={refreshHistory} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPages = pagination?.total_pages || 1
  const totalOrders = pagination?.total_orders || 0
  const hasNextPage = pagination?.has_next_page || false
  const hasPrevPage = pagination?.has_prev_page || false

  return (
    <div className="w-full space-y-2">
      {/* Header with controls */}
      <Card>
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md">Order History</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={!items.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Customer name, mobile, item..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover
                  open={isStartDateOpen}
                  onOpenChange={setIsStartDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {startDate
                        ? format(startDate, 'dd/MM/yyyy')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        setIsStartDateOpen(false)
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {endDate ? format(endDate, 'dd/MM/yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        setIsEndDateOpen(false)
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleDateRangeApply}>
                Apply Filters
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  handleClearDateFilters()
                  onSearchChange('')
                  onClearFilters()
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results summary */}
      <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {items.length} of {totalOrders} orders
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Items Ordered</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Date & Time (IST)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      {loading ? 'Loading orders...' : 'No orders found'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((order, index) => (
                  <TableRow key={order.id || `${order.cart_id}-${index}`}>
                    <TableCell className="max-w-xs">
                      {renderOrderItems(order)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="">
                          {order.customerName ||
                            order.customer_name ||
                            order.customer?.name ||
                            'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID:{' '}
                          {order.customerId ||
                            order.customer_id ||
                            order.customer?.phone ||
                            ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${order.order_status === 'completed' || order.status === 'DELIVERED' ? 'bg-green-200 hover:!bg-green-300' : 'bg-red-200 hover:!bg-red-300'} text-gray-800`}
                      >
                        {order.order_status || order.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="capitalize">
                          {order.payment_method || order.paymentMethod || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {order.payment_status || order.paymentStatus || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="">
                      ₹{order.total_amount || order.totalAmount || 0}
                    </TableCell>
                    <TableCell>
                      {order.table_no || order.tableNo || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {getISTDateKey(order.created_at || order.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {convertToIST(order.created_at || order.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        disabled={order.status === 'CANCELLED'}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintBill(order)}
                        className="flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={!hasPrevPage || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className="min-w-[32px] h-8"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={!hasNextPage || loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showBillDialog && selectedOrderForBill && (
        <ThermalBill
          isOpen={showBillDialog}
          onClose={() => {
            setShowBillDialog(false)
            setSelectedOrderForBill(null)
          }}
          billData={selectedOrderForBill}
        />
      )}
    </div>
  )
}
