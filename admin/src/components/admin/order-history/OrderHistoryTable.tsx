import React, { useState, useMemo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  Filter,
  Search,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { format, subDays, subMonths, isWithinInterval } from 'date-fns'
import {
  convertToIST,
  getISTDateKey,
  formatISTDateTime,
} from './utils/historyDateUtils'
import ThermalBill from './ThermalBill' // Adjust path as needed

interface OrderHistoryTableProps {
  items: any[]
  loading: boolean
  error: string | null
  refreshHistory: () => void
}

interface FilterState {
  dateRange: string
  customStartDate: Date | null
  customEndDate: Date | null
  searchTerm: string
  status: string
  paymentMethod: string
}

const ITEMS_PER_PAGE = 6
const MAX_ITEMS_PREVIEW = 1 // Show only first 2 items before "Show All"

export default function OrderHistoryTable({
  items = [],
  loading,
  error,
  refreshHistory,
}: OrderHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    customStartDate: null,
    customEndDate: null,
    searchTerm: '',
    status: 'all',
    paymentMethod: 'all',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

  // Toggle expanded state for a specific row
  const toggleRowExpansion = useCallback((orderId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }, [])

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!items?.length) return []

    return items.filter((order) => {
      // Date filtering
      if (filters.dateRange !== 'all' && filters.dateRange !== 'custom') {
        const orderDate = new Date(order.created_at || order.createdAt)
        const now = new Date()
        let startDate: Date

        switch (filters.dateRange) {
          case '1day':
            startDate = subDays(now, 1)
            break
          case '10days':
            startDate = subDays(now, 10)
            break
          case '1month':
            startDate = subMonths(now, 1)
            break
          default:
            startDate = new Date(0)
        }

        if (!isWithinInterval(orderDate, { start: startDate, end: now })) {
          return false
        }
      }

      // Custom date range filtering
      if (
        filters.dateRange === 'custom' &&
        filters.customStartDate &&
        filters.customEndDate
      ) {
        const orderDate = new Date(order.created_at || order.createdAt)
        if (
          !isWithinInterval(orderDate, {
            start: filters.customStartDate,
            end: filters.customEndDate,
          })
        ) {
          return false
        }
      }

      // Search term filtering
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch =
          (order.orderId || order.order_id || order.id || order.cart_id || '')
            .toString()
            .toLowerCase()
            .includes(searchLower) ||
          (
            order.customer?.name ||
            order.customer_name ||
            order.display_name ||
            ''
          )
            .toLowerCase()
            .includes(searchLower) ||
          (
            order.customer?.phone ||
            order.customer_phone ||
            order.customer_id ||
            ''
          )
            .toString()
            .toLowerCase()
            .includes(searchLower)

        if (!matchesSearch) return false
      }

      // Status filtering
      if (
        filters.status !== 'all' &&
        (order.status || order.order_status) !== filters.status
      ) {
        return false
      }

      // Payment method filtering
      if (
        filters.paymentMethod !== 'all' &&
        (order.paymentMethod || order.payment_method) !== filters.paymentMethod
      ) {
        return false
      }

      return true
    })
  }, [items, filters])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  // Reset page when filters change
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!filteredData.length) return

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

    const csvData = filteredData.map((order) => [
      order.orderId || order.id || '',
      order.cart_id || '',
      order.display_name || order.customer?.name || '',
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
  }, [filteredData])

  // Print bill handler (placeholder)
  const handlePrintBill = useCallback((order: any) => {
    // Transform order data to match BillData interface
    const billData = {
      orderId: order.orderId || order.id || order.cart_id || 'N/A',
      tableNo: order.table_no || order.tableNo || 'N/A',
      customerName: order.display_name || order.customer?.name || 'N/A',
      customerId: order.customer_id || order.customer?.phone || 'N/A',
      items:
        order.items?.map((item: any) => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: item.price || 0,
        })) || [],
      totalAmount: parseFloat(order.total_amount || order.totalAmount || 0),
      orderDate: getISTDateKey(order.created_at || order.createdAt),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  console.log(items, 'order.items')
  // Render items ordered with expand/collapse functionality
  const renderItemsOrdered = useCallback(
    (order: any) => {
      if (!order.items || order.items.length === 0) {
        return <div className="text-gray-500">N/A</div>
      }

      const orderId = order.id || order.cart_id || order.orderId || 'unknown'
      const isExpanded = expandedRows.has(orderId)
      const hasMoreItems = order.items.length > MAX_ITEMS_PREVIEW

      const itemsToShow = isExpanded
        ? order.items
        : order.items.slice(0, MAX_ITEMS_PREVIEW)

      return (
        <div className="max-w-xs">
          <div className="space-y-1">
            {itemsToShow.map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="text-sm">
                <span className="">
                  {item.item_name || item.name}
                  {item.variant_name ? ` (${item.variant_name})` : ''}
                </span>
                {item.quantity > 1 && (
                  <span className="text-gray-600 ml-1">(x{item.quantity})</span>
                )}
                {/* Render Addons */}
                {item.addons && item.addons.length > 0 && (
                  <div className="ml-2 flex flex-col gap-0.5 mt-0.5">
                    {item.addons.map((addon: any, addonIndex: number) => (
                      <span
                        key={addonIndex}
                        className="text-[0.7rem] text-gray-500 block"
                      >
                        + {addon.quantity > 1 ? `${addon.quantity} x ` : ''}
                        {addon.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasMoreItems && (
            <button
              onClick={() => toggleRowExpansion(orderId)}
              className="flex items-center text-[.7rem] text-blue-600 hover:text-blue-800 mt-0 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show All ({order.items.length - MAX_ITEMS_PREVIEW} more)
                </>
              )}
            </button>
          )}
        </div>
      )
    },
    [expandedRows, toggleRowExpansion],
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
                disabled={!filteredData.length}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    handleFilterChange({ dateRange: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1day">Last 1 Day</SelectItem>
                    <SelectItem value="10days">Last 10 Days</SelectItem>
                    <SelectItem value="1month">Last 1 Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover
                      open={isStartDateOpen}
                      onOpenChange={setIsStartDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {filters.customStartDate
                            ? format(filters.customStartDate, 'dd/MM/yyyy')
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.customStartDate || undefined}
                          onSelect={(date) => {
                            handleFilterChange({
                              customStartDate: date || null,
                            })
                            setIsStartDateOpen(false)
                          }}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover
                      open={isEndDateOpen}
                      onOpenChange={setIsEndDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {filters.customEndDate
                            ? format(filters.customEndDate, 'dd/MM/yyyy')
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.customEndDate || undefined}
                          onSelect={(date) => {
                            handleFilterChange({ customEndDate: date || null })
                            setIsEndDateOpen(false)
                          }}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Customer Id, Name..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      handleFilterChange({ searchTerm: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) =>
                    handleFilterChange({ paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results summary */}
      <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {paginatedData.length} of {filteredData.length} orders
        </div>
        <div>
          Page {currentPage} of {totalPages || 1}
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
                {/* <TableHead>Qty</TableHead> */}
                <TableHead>Date & Time (IST)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-gray-500">
                      {loading ? 'Loading orders...' : 'No orders found'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((order, index) => (
                  <TableRow key={order.id || order.cart_id || index}>
                    <TableCell className="">
                      {renderItemsOrdered(order)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="">
                          {order.display_name || order.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {order.customer_id || order.customer?.phone || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${order.status === 'DELIVERED' ? 'bg-green-200 hover:!bg-green-300' : 'bg-red-200 hover:!bg-red-300'} text-gray-800`}
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
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
                      onClick={() => setCurrentPage(pageNum)}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
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
