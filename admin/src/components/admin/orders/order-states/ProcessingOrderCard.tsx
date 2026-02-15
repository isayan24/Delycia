import { useState, useMemo, memo, useTransition } from 'react'
import {
  Loader2,
  ChevronDown,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  User2,
  Timer,
  Printer,
  ScrollText,
  Utensils,
  CookingPot,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProcessingCountdownDisplay } from '../countdown'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface ProcessingOrderCardProps {
  order: ProcessedOrder
  onMarkReady: (order: ProcessedOrder) => void
  onExtendTime?: (order: ProcessedOrder, additionalMinutes: number) => void
  isMarkingReadyTransition: boolean
  handleMarkDelivered: (order: ProcessedOrder) => void
  isMarkDelivered: boolean
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
        className="p-4 cursor-pointer select-none transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-[500px]:gap-2 items-start lg:items-center">
          {/* Status Icon */}
          <div className="max-[1024px]:hidden! size-14 rounded-xl flex items-center justify-center shrink-0 bg-orange-50 text-orange-600 dark:bg-orange-900/20">
            <CookingPot className="w-6 h-6 animate-spin-slow" />
          </div>

          {/* Order Brief Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-50 text-orange-600 border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                Preparing
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
                  onPrint()
                }}
                className="h-10 w-10 p-0 rounded-xl border border-[#ead9cd] dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <Printer className="w-4 h-4 text-[#a16b45]" />
              </Button>
            </div>

            <div className="pl-6 flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-[#a16b45] font-medium mb-1">
                  Est. Total
                </p>
                <p className="text-xl font-bold text-primary max-[500px]:text-lg!">
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
        <div className=" divide-[#ead9cd] dark:divide-primary/10">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="py-2 max-[500px]:py-1 px-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
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

export function ProcessingOrderCard({
  order,
  onMarkReady,
  onExtendTime,
  isMarkingReadyTransition,
  handleMarkDelivered,
  isMarkDelivered,
}: ProcessingOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExtendOptions, setShowExtendOptions] = useState(false)
  const [showThermalBill, setShowThermalBill] = useState(false)
  const [selectedExtendTime, setSelectedExtendTime] = useState<number | null>(
    null,
  )
  const [isExtendingTime, setIsExtendingTime] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()
  const [, startTransition] = useTransition()

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

  const totalPrepTime = order.preparation_time || 30
  const processingStartTime =
    order.preparation_started_at ||
    order.items[0]?.updated_at ||
    order.created_at

  const totalItems = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  )

  const globalNote = useMemo<string | undefined>(() => {
    return order.items?.find((item) => item.special_instructions)
      ?.special_instructions
  }, [order.items])

  const handleAddTime = () => {
    if (selectedExtendTime && onExtendTime) {
      setIsExtendingTime(true)
      startTransition(async () => {
        try {
          await onExtendTime(order, selectedExtendTime)
          setShowExtendOptions(false)
          setSelectedExtendTime(null)
        } catch (error) {
          console.error('Failed to extend time:', error)
        } finally {
          setIsExtendingTime(false)
        }
      })
    }
  }

  return (
    <div className="group bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-lg shadow-orange-100/20 dark:shadow-none hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden mb-6">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm max-[500px]:text-xs font-bold text-[#a16b45] uppercase tracking-wider">
                    <Timer className="w-4 h-4" />
                    Time Remaining
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExtendOptions(!showExtendOptions)}
                    className="text-[13px] max-[500px]:text-[10px] font-bold text-primary p-0 h-auto hover:bg-transparent"
                  >
                    {showExtendOptions ? 'CANCEL' : 'NEED MORE TIME?'}
                  </Button>
                </div>

                {showExtendOptions ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-5 gap-2">
                      {[5, 10, 15, 20, 30].map((mins) => (
                        <Button
                          key={mins}
                          variant={
                            selectedExtendTime === mins ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setSelectedExtendTime(mins)}
                          className={`h-10 rounded-lg text-xs font-bold transition-all ${
                            selectedExtendTime === mins
                              ? 'bg-primary text-white border-none'
                              : 'border-[#ead9cd] text-[#a16b45] hover:bg-orange-50'
                          }`}
                          disabled={isExtendingTime}
                        >
                          +{mins}m
                        </Button>
                      ))}
                    </div>
                    <Button
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                      onClick={handleAddTime}
                      disabled={!selectedExtendTime || isExtendingTime}
                    >
                      {isExtendingTime ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Extra {selectedExtendTime} Minutes
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-orange-50/30 dark:bg-[#3a291d]/30 rounded-xl border border-dashed border-[#ead9cd]">
                    <ProcessingCountdownDisplay
                      orderTime={processingStartTime}
                      preparationTime={totalPrepTime}
                      preparationStartedAt={order.preparation_started_at}
                      onTimeExpired={() => {}}
                      className="text-4xl font-bold text-primary tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleMarkDelivered(order)}
                  disabled={isMarkDelivered}
                  className="flex-1 h-12 max-[500px]:h-10 max-[500px]:text-xs rounded-xl border-[#ead9cd] dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 transition-all"
                >
                  Quick Deliver
                </Button>
                <Button
                  onClick={() => onMarkReady(order)}
                  disabled={isMarkingReadyTransition}
                  className="flex-2 h-12 max-[500px]:h-10 max-[500px]:text-xs! bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isMarkingReadyTransition ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {isMarkingReadyTransition
                    ? 'Marking Ready...'
                    : 'Order is Ready'}
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
              <Timer className="w-3 h-3" /> Ready in approx:
            </span>
            <ProcessingCountdownDisplay
              orderTime={processingStartTime}
              preparationTime={totalPrepTime}
              preparationStartedAt={order.preparation_started_at}
              onTimeExpired={() => {}}
              className="text-xs font-bold text-primary tabular-nums"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-[10px] font-bold text-primary p-0 h-auto hover:bg-transparent"
          >
            MANAGE PREP →
          </Button>
        </div>
      )}
    </div>
  )
}
