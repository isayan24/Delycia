import { memo, useState, useCallback } from 'react'
import OrderInfoCard from './OrderInfoCard'
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
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'

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
  <div className="w-full h-full border flex flex-col p-4 overflow-y-auto">
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <OrderInfoSkeleton key={index} />
      ))}
    </div>
  </div>
))
LoadingState.displayName = 'LoadingState'

// Order card wrapper with tax calculation
const OrderCardWithTax = memo(
  ({
    order,
    index,
    selectedOrderId,
    onOrderSelect,
    onPrintBill,
  }: {
    order: any
    index: number
    selectedOrderId: string | null
    onOrderSelect: (orderId: string) => void
    onPrintBill: (order: any) => void
  }) => {
    // Calculate subtotal from items (prices already include quantity)
    const subtotal = order.items.reduce(
      (sum: number, item: any) => sum + item.price,
      0,
    )
    const discountAmount = parseFloat(order.discountAmount || 0)

    // Use the tax calculation hook for consistent calculations
    const { grandTotal } = useOrderTaxCalculation({
      subtotal,
      discountAmount,
      rid: order.rid,
    })

    return (
      <OrderInfoCard
        key={`${order.cartId}-${index}`}
        status={order.status}
        orderDate={order.updatedAt}
        orderId={order.orderId}
        customerName={order.customerName}
        customer={order.customer}
        items={order.items}
        totalAmount={grandTotal}
        discountAmount={discountAmount}
        isSelected={selectedOrderId === order.id}
        onClick={() => onOrderSelect(order.id)}
        onPrint={() => onPrintBill(order)}
      />
    )
  },
)
OrderCardWithTax.displayName = 'OrderCardWithTax'

const OrderInfoList = memo(function OrderInfoList({
  orders,
  selectedOrderId,
  onOrderSelect,
  loading,
  error,
  onRetry,
  pagination,
  currentPage,
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
  const { selectedRestaurant } = useRestaurantSelector()
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any>(null)

  const totalPages = pagination?.total_pages || 1
  const hasNextPage = pagination?.has_next_page || false
  const hasPrevPage = pagination?.has_prev_page || false

  // Print bill handler
  const handlePrintBill = useCallback((order: any) => {
    // console.log(order.customer) // Removed debug log
    const billItems = order.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      variant_name: item.variant_name,
      addons: item.addons,
    }))

    const billData = {
      orderId: order.orderId || order.id,
      restaurantName: selectedRestaurant?.name || 'RESTAURANT BILL',
      tableNo: order.tableNo || 'N/A',
      tableZone: order.tableZone || '',
      customerName: order.customerName || order.customer?.name || 'Guest',
      customerId: order.customerId || 'N/A',
      customerPhone:
        order.customer_phone ||
        order.customerPhone ||
        order.customer?.phone ||
        'N/A',
      items: billItems,
      discountAmount: parseFloat(
        order.discountAmount || order.discount_amount || 0,
      ),
      totalAmount: order.totalAmount,
      taxPercent: order.taxPercent || 0,
      taxAmount: order.taxAmount || 0,
      orderDate: formatDateTime(order.createdAt),
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
      <div className="w-full h-full border flex flex-col p-4">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    )
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="w-full h-full border flex flex-col p-4">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Compact Header with Search and Filters */}
      <div className="p-2.5 border-b border-gray-100/80 flex flex-col gap-2">
        <div className="flex gap-1.5">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              placeholder="Search ID, name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8.5 text-xs bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-orange-500/10 transition-all rounded-xl"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8.5 text-[10px] font-bold uppercase tracking-tight px-2.5 rounded-xl transition-all ${
              showFilters
                ? 'bg-orange-50 text-orange-600 border-orange-100'
                : 'bg-white text-gray-500 border-gray-100'
            }`}
          >
            <Filter className="w-3 h-3 mr-1" />
            {showFilters ? 'Hide' : 'Filter'}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Start Date */}
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 text-[10px] font-medium justify-start px-2 rounded-lg border-gray-100"
                >
                  <CalendarIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                  {startDate ? format(startDate, 'dd MMM') : 'From'}
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
                  className="h-8 text-[10px] font-medium justify-start px-2 rounded-lg border-gray-100"
                >
                  <CalendarIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                  {endDate ? format(endDate, 'dd MMM') : 'To'}
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

            <div className="flex gap-1 ml-auto">
              <Button
                size="sm"
                onClick={handleApplyDateRange}
                className="h-8 text-[10px] font-bold px-3 rounded-lg bg-orange-600 hover:bg-orange-500"
              >
                Apply
              </Button>
              {(startDate || endDate) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  className="h-8 text-[10px] font-bold px-2 rounded-lg text-rose-600 hover:bg-rose-50"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto bg-gray-50/20 scrollbar-none">
        <div className="p-2.5 space-y-2">
          {orders.map((order, index) => (
            <OrderCardWithTax
              key={`${order.cartId}-${index}`}
              order={order}
              index={index}
              selectedOrderId={selectedOrderId}
              onOrderSelect={onOrderSelect}
              onPrintBill={handlePrintBill}
            />
          ))}
        </div>
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevPage}
              disabled={!hasPrevPage || loading}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-orange-600"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-xs">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onNextPage}
              disabled={!hasNextPage || loading}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-orange-600"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
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
