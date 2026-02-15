import { useState, useMemo, memo } from 'react'
import {
  Printer,
  ChevronDown,
  Calendar,
  Layers,
  User2,
  XCircle,
  ScrollText,
  Utensils,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'

interface CancelledOrderCardProps {
  order: ProcessedOrder
}

const OrderHeader = memo(
  ({
    order,
    totalItems,
    finalGrandTotal,
    isExpanded,
    onToggleExpand,
    onPrintBill,
  }: {
    order: ProcessedOrder
    totalItems: number
    finalGrandTotal: number
    isExpanded: boolean
    onToggleExpand: () => void
    onPrintBill: () => void
  }) => {
    return (
      <div
        className="p-4 cursor-pointer select-none transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-[500px]:gap-2 items-start lg:items-center">
          {/* Status Icon */}
          <div className="max-[1024px]:hidden! size-14 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600 dark:bg-red-900/20">
            <XCircle className="w-6 h-6" />
          </div>

          {/* Order Brief Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-50 text-red-600 border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                Cancelled
              </Badge>
              {order.unique_table_numbers?.length > 0 ? (
                <Badge className="bg-red-50/50 text-red-700 border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 pointer-events-none">
                  <Utensils className="w-3 h-3" strokeWidth={3} />
                  {order.table_zone} Table:{' '}
                  {order.unique_table_numbers.join(', ')}
                </Badge>
              ) : (
                <Badge className="bg-orange-50 text-[#a16b45] border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                  {order.is_delivery ? 'Delivery' : 'Takeaway'}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#a16b45]">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4" />{' '}
                {formatDateTime(order.created_at)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-4 h-4" /> {totalItems} Items
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User2 className="w-4 h-4" /> {order.customer_name || 'Guest'}
              </span>
            </div>
          </div>

          {/* Total & Actions */}
          <div className="flex max-[1024px]:w-full items-center max-[1024px]:justify-between! gap-3 divide-x divide-[#ead9cd] dark:divide-primary/10">
            <div className="pr-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrintBill()
                }}
                className="h-10 w-10 p-0 rounded-xl border border-[#ead9cd] dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <Printer className="w-4 h-4 text-[#a16b45]" />
              </Button>
            </div>

            <div className="pl-6 flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-[#a16b45] font-medium mb-1">
                  Refundable
                </p>
                <p className="text-xl font-bold text-red-600 max-[500px]:text-lg!">
                  ₹
                  {finalGrandTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isExpanded ? 'rotate-180' : ''}`}
              >
                <ChevronDown className="w-5 h-5 text-[#a16b45] transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

const OrderItemsDetail = memo(
  ({
    items,
    order,
    taxAmount,
    grandTotal,
  }: {
    items: any[]
    order: ProcessedOrder
    taxAmount: number
    grandTotal: number
  }) => (
    <div className="space-y-3">
      <div className="bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 overflow-hidden shadow-sm">
        <div className="divide-[#ead9cd] dark:divide-primary/10">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="py-2 max-[500px]:py-1 px-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-400 text-sm">
                      x{item.quantity}
                    </span>{' '}
                    <span className="font-medium text-[15px] max-[500px]:text-[12px] line-through decoration-red-400/50">
                      {item.display_name}
                    </span>
                  </div>
                  {item.addons && (
                    <span className="text-[10px] italic font-medium leading-tight">
                      {item.addons
                        .map((a: any) => `+ ${a.quantity}x ${a.name}`)
                        .join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] max-[500px]:text-[11px] font-semibold text-slate-400">
                  ₹{item.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section inside the same card */}
        <div className="bg-slate-50/50 dark:bg-white/5 p-4 space-y-2.5 border-t border-[#ead9cd] dark:border-primary/10">
          <div className="flex justify-between text-xs font-bold text-[#a16b45]">
            <span>Subtotal</span>
            <span className="text-slate-900 dark:text-white">
              ₹{order.total_amount.toFixed(2)}
            </span>
          </div>
          {(order.discount_amount || 0) > 0 && (
            <div className="flex justify-between text-xs font-bold text-emerald-600">
              <span>Discount</span>
              <span>
                -₹{parseFloat(String(order.discount_amount)).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold text-[#a16b45]">
            <span>GST (5%)</span>
            <span className="text-slate-900 dark:text-white">
              ₹{taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base font-black border-t border-[#ead9cd] dark:border-primary/20 pt-2.5 text-red-600">
            <span>Cancelled Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  ),
)

export function CancelledOrderCard({ order }: CancelledOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showThermalBill, setShowThermalBill] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()

  const {
    grandTotal,
    taxAmount,
    isLoading: isTaxLoading,
  } = useOrderTaxCalculation({
    subtotal: order.total_amount,
    discountAmount: order.discount_amount
      ? parseFloat(String(order.discount_amount))
      : 0,
  })

  const totalItems = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  )

  const globalNote = useMemo<string | undefined>(() => {
    return order.items?.find((item) => item.special_instructions)
      ?.special_instructions
  }, [order.items])

  return (
    <div className="group bg-red-50/30 dark:bg-red-950/5 rounded-xl border border-red-100 dark:border-red-900/10 hover:shadow-xl hover:shadow-red-500/5 transition-all overflow-hidden mb-6">
      {showThermalBill && (
        <ThermalBill
          isOpen={showThermalBill}
          onClose={() => setShowThermalBill(false)}
          billData={orderToBillData(order, selectedRestaurant?.name || '')}
          showPrintButton={true}
          showDownloadButton={true}
          showShareButton={true}
          onShareToMobile={handleShareToMobile}
        />
      )}

      <OrderHeader
        order={order}
        totalItems={totalItems}
        finalGrandTotal={isTaxLoading ? order.total_amount : grandTotal}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onPrintBill={() => setShowThermalBill(true)}
      />

      {isExpanded && (
        <div className="border-t border-red-100 dark:border-red-900/10 p-3 bg-red-50/20 dark:bg-red-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-[500px]:gap-2">
            <div className="lg:col-span-1 space-y-6 max-[500px]:space-y-2">
              {globalNote && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest">
                    <ScrollText className="w-3.5 h-3.5" strokeWidth={3} />
                    Kitchen Note
                  </div>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-200 leading-relaxed">
                    {globalNote}
                  </p>
                </div>
              )}

              <OrderItemsDetail
                items={order.items}
                order={order}
                taxAmount={taxAmount}
                grandTotal={grandTotal}
              />
            </div>
            <div className="space-y-6 max-[500px]:space-y-2">
              <div className="bg-white dark:bg-[#2d1e14] p-5 rounded-xl border border-red-100 dark:border-red-900/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-red-600 uppercase tracking-widest">
                  <XCircle className="w-4 h-4" />
                  Cancellation Details
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    This order was cancelled on{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatDateTime(order.created_at)}
                    </span>
                    .
                  </p>
                  <div className="pt-2 border-t border-red-50 dark:border-red-900/20">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Customer ID: #{order.customer_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
