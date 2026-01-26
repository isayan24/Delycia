import React, { memo, useState, useCallback } from 'react'
import OrderInfoCard from './OrderInfoCard'
import { TransformedOrder } from '../utils/orderHistoryUtils'
import { OrderInfoSkeleton } from '../LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { PrintBillDialog } from '../shared/PrintBillDialog'
import { getISTDateKey } from '../utils/historyDateUtils'

interface OrderInfoListProps {
  orders: any[]
  selectedOrderId: string | null
  onOrderSelect: (orderId: string) => void
  loading: boolean
  error: string | null
  onRetry: () => void
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

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <div className="text-6xl mb-4">📋</div>
    <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
    <p className="text-sm text-center">
      There are no orders in the history yet.
    </p>
  </div>
))
EmptyState.displayName = 'EmptyState'

// Error state component
const ErrorState = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium mb-2">Error Loading Orders</h3>
      <p className="text-sm text-center mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  ),
)
ErrorState.displayName = 'ErrorState'

// Loading state component
const LoadingState = memo(() => (
  <div className="w-[40%] h-full border flex flex-col p-4 overflow-y-auto">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <OrderInfoSkeleton key={index} />
      ))}
    </div>
  </div>
))
LoadingState.displayName = 'LoadingState'

const OrderInfoList = memo(function OrderInfoList({
  orders,
  selectedOrderId,
  onOrderSelect,
  loading,
  error,
  onRetry,
  pagination,
  currentPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  search,
  onSearchChange,
  onDateRangeChange,
  onClearFilters,
}: OrderInfoListProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

  const totalPages = pagination?.total_pages || 1
  const totalOrders = pagination?.total_orders || 0
  const hasNextPage = pagination?.has_next_page || false
  const hasPrevPage = pagination?.has_prev_page || false

  // Print bill handler
  const handlePrintBill = useCallback((order: any) => {
    console.log(order.customer)
    const billItems = order.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      variant_name: item.variant_name,
      addons: item.addons,
    }))

    const billData = {
      orderId: order.orderId || order.id,
      tableNo: order.tableNo || 'N/A',
      customerName: order.customerName || order.customer?.name || 'Guest',
      customerId: order.customerId || 'N/A',
      customerPhone: order.customer?.phone_number || 'N/A',
      items: billItems,
      discountAmount: parseFloat(
        order.discountAmount || order.discount_amount || 0,
      ),
      totalAmount: order.totalAmount,
      orderDate: getISTDateKey(order.createdAt),
    }

    setSelectedOrderForBill(billData)
    setShowBillDialog(true)
  }, [])

  // Apply date range
  const handleApplyDateRange = () => {
    const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined
    const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined
    onDateRangeChange(start, end)
  }

  // Clear all filters
  const handleClearAll = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onSearchChange('')
    onClearFilters()
  }

  // Show loading state
  if (loading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return (
      <div className="w-[40%] h-full border flex flex-col p-4">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    )
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="w-[40%] h-full border flex flex-col p-4">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="w-[40%] h-full flex flex-col">
      {/* Compact Header with Search and Filters */}
      <div className="p-3 py-0 pb-2 border-b flex gap-1">
        {/* Search */}
        <div className="relative flex-1 ">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>

          {showFilters && (
            <div className="flex gap-2">
              {/* Start Date */}
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 text-xs justify-start"
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {startDate ? format(startDate, 'dd/MM') : 'From'}
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

              {/* End Date */}
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 text-xs justify-start"
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {endDate ? format(endDate, 'dd/MM') : 'To'}
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

              <Button
                size="sm"
                onClick={handleApplyDateRange}
                className=" text-xs "
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                className=" text-xs "
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Date Filters (Collapsible) */}
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {orders.map((order, index) => (
            <OrderInfoCard
              key={`${order.cartId}-${index}`}
              status={order.status}
              time={order.time}
              date={order.date}
              orderId={order.orderId}
              customerName={order.customerName}
              customer={order.customer}
              items={order.items}
              totalAmount={order.totalAmount}
              discountAmount={order.discountAmount}
              isSelected={selectedOrderId === order.id}
              onClick={() => onOrderSelect(order.id)}
              onPrint={() => handlePrintBill(order)}
            />
          ))}
        </div>
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="p-2 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={!hasPrevPage || loading}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Prev
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 3) {
                  pageNum = i + 1
                } else if (currentPage <= 2) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i
                } else {
                  pageNum = currentPage - 1 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className="h-7 w-7 p-0 text-xs"
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
              className="h-7 px-2 text-xs"
            >
              Next
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="text-center text-xs text-gray-600 mt-1">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Print Bill Dialog */}
      <PrintBillDialog
        open={showBillDialog}
        onOpenChange={setShowBillDialog}
        billData={selectedOrderForBill}
      />
    </div>
  )
})

export default OrderInfoList
