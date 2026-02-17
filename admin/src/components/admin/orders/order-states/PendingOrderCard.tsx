import { useState, useMemo, memo } from 'react'
import {
  Clock,
  ChevronDown,
  Printer,
  Timer,
  Calendar,
  Layers,
  User2,
  ScrollText,
  Utensils,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PrepTimeSelector } from '../order-ui-card/PrepTimeSelector'
import { CountdownDisplay } from '../countdown'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface PendingOrderCardProps {
  order: ProcessedOrder
  onAccept: (order: ProcessedOrder, prepTime: number) => void
  onReject: (order: ProcessedOrder) => void
  isAcceptingOrder: boolean
  isRejectingOrder: boolean
}

const OrderHeader = memo(
  ({
    order,
    totalItems,
    finalGrandTotal,
    isExpanded,
    onToggleExpand,
    onPrint,
  }: {
    order: ProcessedOrder
    totalItems: number
    finalGrandTotal: number
    isExpanded: boolean
    onToggleExpand: () => void
    onPrint: () => void
  }) => {
    return (
      <div
        className="p-4 max-[500px]:p-2 cursor-pointer select-none transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-[500px]:gap-2 items-start lg:items-center">
          {/* Status Icon */}
          <div className="max-[1024px]:hidden! size-14 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 dark:bg-amber-900/20">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          {/* Order Brief Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {/* <h3 className="text-md font-medium text-slate-900 dark:text-white">
                #{order.id || 'Order'}
              </h3> */}
              <Badge className="bg-amber-50 text-amber-600 border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                Pending
              </Badge>
              {order.unique_table_numbers?.length > 0 ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 pointer-events-none">
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
                <User2 className="w-4 h-4" /> {order.customer_name || 'Guest'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-4 h-4" /> {totalItems} Items
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4" />{' '}
                {formatDateTime(order.created_at)}
              </span>
            </div>
          </div>

          {/* Total & Actions */}
          <div className="flex max-[1024px]:w-full items-center max-[1024px]:justify-between! gap-3 divide-x max-[500px]:divide-none divide-[#ead9cd] dark:divide-primary/10">
            <div className="pr-4 flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrint()
                }}
                className="h-10 w-10 p-0 max-[500px]:h-4 max-[500px]:w-4 rounded-xl border-none dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-none dark:hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <Printer className="w-4 h-4 text-[#a16b45]" />
              </Button>
              <div className="text-right">
                <p className="text-sm text-[#a16b45] font-medium mb-1 flex items-center gap-2">
                  Est. Total{' '}
                  <span className="text-xl max-[500px]:text-[#a16b45] font-bold text-primary max-[500px]:text-[14px]!">
                    ₹
                    {finalGrandTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>
            </div>

            <div className="pl-6 flex items-center gap-6">
              <div
                className={`p-2 text-[10px] font-bold text-[#a16b45] flex items-center uppercase rounded-full transition-colors tracking-widest`}
              >
                {' '}
                details
                <ChevronDown
                  className={`w-5 h-5 text-[#a16b45] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
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
        <div className=" divide-[#ead9cd] dark:divide-primary/10">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="py-2 max-[500px]:py-1 px-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {/* <div className="size-9 rounded-lg bg-orange-50 dark:bg-[#3a291d] flex items-center justify-center text-primary">
                  {getItemIcon()}
                </div> */}
                <div className="flex flex-col">
                  <div className="text-slate-900 dark:text-white">
                    <span className="font-black text-orange-900/50 dark:text-orange-400 text-sm">
                      x{item.quantity}
                    </span>{' '}
                    <span className="font-medium text-[15px] max-[500px]:text-[12px]">
                      {item.display_name}
                    </span>
                  </div>
                  {item.addons && (
                    <span className="text-[10px] text-[#a16b45] italic font-medium leading-tight">
                      {item.addons
                        .map((a: any) => `+ ${a.quantity}x ${a.name}`)
                        .join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] max-[500px]:text-[11px] font-semibold text-[#a16b45]">
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
          <div className="flex justify-between text-base font-black border-t border-[#ead9cd] dark:border-primary/20 pt-2.5 text-primary">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  ),
)

export function PendingOrderCard({
  order,
  onAccept,
  onReject,
  isAcceptingOrder,
  isRejectingOrder,
}: PendingOrderCardProps) {
  const [prepTime, setPrepTime] = useState(30)
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
    <div className="group bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-2xl! shadow-orange-500/15 transition-all overflow-hidden mb-6">
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
        onPrint={() => setShowThermalBill(true)}
      />

      {isExpanded && (
        <div className="border-t border-[#ead9cd] dark:border-primary/10 p-3 bg-background-light/50 dark:bg-background-dark/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-[500px]:gap-2">
            <div className="lg:col-span-1 space-y-6 max-[500px]:space-y-2">
              {globalNote && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
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
              <div className="bg-white dark:bg-[#2d1e14] p-5 max-[500px]:py-2 rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-sm max-[500px]:text-xs font-bold text-[#a16b45] uppercase tracking-wider">
                  <Timer className="w-4 h-4" />
                  Preparation Time
                </div>
                <PrepTimeSelector
                  prepTime={prepTime}
                  onPrepTimeChange={(val) => setPrepTime(Math.max(5, val))}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => onReject(order)}
                  disabled={isRejectingOrder || isAcceptingOrder}
                  className="flex-1 h-12 max-[500px]:h-10 max-[500px]:text-xs rounded-xl border-[#ead9cd] dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-500 transition-all"
                >
                  Reject Order
                </Button>
                <Button
                  onClick={() => onAccept(order, prepTime)}
                  disabled={isAcceptingOrder || isRejectingOrder}
                  className="flex-2 h-12 max-[500px]:h-10 max-[500px]:text-xs! bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm shadow-orange-300 dark:shadow-none transition-all"
                >
                  <CountdownDisplay
                    orderTime={order.created_at}
                    onExpired={() => onReject(order)}
                    renderAs="button"
                    buttonText="Accept Order"
                    className="text-sm max-[500px]:text-xs font-bold uppercase tracking-wider"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Bar for collapsed state */}
      {!isExpanded && (
        <div className="px-4 py-2 bg-orange-50/50 dark:bg-[#3a291d]/50 border-t border-[#ead9cd]/50 dark:border-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest flex items-center gap-1.5">
              <Timer className="w-3 h-3" /> Auto-reject in:
            </span>
            <CountdownDisplay
              orderTime={order.created_at}
              onExpired={() => onReject(order)}
              className="text-xs font-bold text-primary"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-[10px] font-bold text-primary p-0 h-auto hover:bg-transparent"
          >
            QUICK ACCEPT →
          </Button>
        </div>
      )}
    </div>
  )
}
