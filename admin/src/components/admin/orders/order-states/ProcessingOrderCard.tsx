import { useState, useMemo, memo, useTransition } from 'react'
import {
  ChevronDown,
  Phone,
  Printer,
  Calendar,
  Layers,
  User2,
  Table as TableIcon,
  ShoppingBag,
  ScrollText,
  Utensils,
  Beef,
  Coffee,
  Pizza,
  Carrot,
  UtensilsCrossed,
  Timer,
  Loader2,
  Plus,
  CheckCircle2,
  CookingPot,
  X,
} from 'lucide-react'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTimeIST } from '@/utils/dateUtils'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'
import { ProcessingCountdownDisplay } from '../countdown'

interface ProcessingOrderCardProps {
  order: ProcessedOrder
  onMarkReady: (order: ProcessedOrder) => void
  onExtendTime?: (order: ProcessedOrder, additionalMinutes: number) => void
  isMarkingReadyTransition: boolean
  handleMarkDelivered: (order: ProcessedOrder) => void
  isMarkDelivered: boolean
}

const getItemIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('burger') || n.includes('fastfood'))
    return <Carrot className="w-4 h-4" />
  if (n.includes('pizza')) return <Pizza className="w-4 h-4" />
  if (n.includes('coffee') || n.includes('latte') || n.includes('macchiato'))
    return <Coffee className="w-4 h-4" />
  if (n.includes('meat') || n.includes('beef') || n.includes('steak'))
    return <Beef className="w-4 h-4" />
  return <UtensilsCrossed className="w-4 h-4" />
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
    const { state } = useSidebar()
    const isSidebarCollapsed = state === 'collapsed'

    return (
      <div
        className={cn(
          'p-4 cursor-pointer transition-all duration-200 px-6 select-none group/header relative',
          isExpanded
            ? 'bg-slate-50/80 dark:bg-slate-800/60'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/20',
        )}
        onClick={onToggleExpand}
      >
        <div className="flex flex-col gap-4">
          {/* Left: ID & Status */}
          <div className="flex items-center min-w-32">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge className="bg-orange-50 text-orange-600 border-none px-1.5 py-0 text-[13px] font-bold uppercase tracking-tight">
                  Preparing
                </Badge>
                {order.unique_table_numbers?.length > 0 ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-1.5 py-0 text-[13px] font-bold uppercase tracking-tight flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    {order.table_zone} Table:{' '}
                    {order.unique_table_numbers.join(', ')}
                  </Badge>
                ) : (
                  <Badge className="bg-orange-50 text-[#a16b45] border-none px-1.5 py-0 text-[13px] font-bold uppercase tracking-tight">
                    {order.is_delivery ? 'DELIVERY' : 'TAKEAWAY'}
                  </Badge>
                )}
              </div>
              {order.id && (
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                  #{order.id}
                </h3>
              )}
            </div>
          </div>

          {/* Main Context Area: Brief, Timeline & Actions */}
          <div className="flex flex-row gap-6 items-start">
            {/* Center Grid: Brief & Timeline */}
            <div
              className={cn(
                'flex-1 grid grid-cols-2 gap-6',
                isSidebarCollapsed
                  ? 'max-[768px]:grid-cols-1'
                  : 'max-[1024px]:grid-cols-1',
              )}
            >
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Brief
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1.5">
                    <User2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    {order.customer_name || 'Guest'}
                  </p>
                  <p className="text-[11px] font-medium text-orange-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 shrink-0" /> {totalItems}{' '}
                    Items
                  </p>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Timeline
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  {formatDateTimeIST(order.created_at)}
                </p>
              </div>
            </div>

            {/* Right Group: Actions & Total */}
            <div
              className={cn(
                'flex flex-row-reverse items-end justify-center gap-3 min-w-max',
                isSidebarCollapsed
                  ? 'max-[768px]:flex-col'
                  : 'max-[1024px]:flex-col',
              )}
            >
              {/* Actions Group */}
              <div className="flex items-center gap-1.5 order-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrintBill()
                  }}
                  className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                </Button>

                <div
                  className={cn(
                    'h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200',
                    isExpanded
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'bg-transparent',
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-400 transition-transform duration-300',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </div>
              </div>

              {/* Price Group */}
              <div className="text-right order-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  EST. TOTAL
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                  ₹
                  {finalGrandTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)
OrderHeader.displayName = 'OrderHeader'

const ItemDetailsTable = memo(({ items }: { items: any[] }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-2">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Items Summary
      </h4>
      <span className="text-[10px] font-bold text-slate-300">
        {items.length} Entries
      </span>
    </div>

    <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            <th className="py-3 pl-6 pr-4">Description</th>
            <th className="py-3 px-4 text-center">Qty</th>
            <th className="py-3 pl-4 pr-6 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-white dark:hover:bg-slate-800/30 transition-colors"
            >
              <td className="py-4 pl-6 pr-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0 text-orange-600/60">
                    {getItemIcon(item.display_name)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[15px] text-slate-700 dark:text-slate-200">
                      {item.display_name}
                    </p>
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-[11px] text-slate-400">
                        {item.addons
                          .map((a: any) => `+ ${a.quantity}x ${a.name}`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                  {item.quantity}
                </span>
              </td>
              <td className="py-4 pl-4 pr-6 text-right tabular-nums font-bold text-slate-700 dark:text-slate-200">
                ₹
                {item.total_amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
))
ItemDetailsTable.displayName = 'ItemDetailsTable'

const UnifiedDetails = memo(
  ({
    order,
    taxAmount,
    grandTotal,
  }: {
    order: ProcessedOrder
    taxAmount: number
    grandTotal: number
  }) => (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {(order.customer_name || 'G').charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {order.customer_name || 'Guest User'}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              ID: #{order.customer_id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pl-1">
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <TableIcon className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">
              {order.unique_table_numbers?.length > 0
                ? `Table ${order.unique_table_numbers.join(', ')}`
                : 'Takeaway'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <ShoppingBag className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">
              {order.is_delivery ? 'Home Delivery' : 'On-Premise'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Section */}
      <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Est. Bill Summary
          </h4>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {order.payment_method || 'CASH'}
          </span>
        </div>

        <div className="space-y-2.5 tabular-nums">
          <div className="flex justify-between text-xs font-semibold text-slate-500/80">
            <span>Sub-total</span>
            <span>
              ₹
              {order.total_amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {(order.discount_amount || 0) > 0 && (
            <div className="flex justify-between text-xs font-semibold text-emerald-600">
              <span>Benefits</span>
              <span>
                -₹
                {parseFloat(String(order.discount_amount)).toLocaleString(
                  'en-IN',
                  { minimumFractionDigits: 2 },
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs font-semibold text-slate-500/80">
            <span>Tax (5%)</span>
            <span>
              ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Est. Total
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹
              {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
)
UnifiedDetails.displayName = 'UnifiedDetails'

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
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-none mb-6">
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          >
            <div className="border-t border-slate-100 dark:border-slate-800/50 p-6 pt-6 pb-8 bg-white dark:bg-slate-900/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-8">
                  {globalNote && (
                    <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-[10px] uppercase tracking-widest">
                        <ScrollText className="w-3.5 h-3.5" />
                        Kitchen Note
                      </div>
                      <p className="text-sm font-semibold text-orange-900/80 dark:text-orange-200/80 italic leading-relaxed">
                        "{globalNote}"
                      </p>
                    </div>
                  )}

                  <ItemDetailsTable items={order.items} />

                  {/* Processing Specific Actions */}
                  <div className="space-y-6">
                    {/* Timing & Extension Section */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                        {/* Countdown / Status Info */}
                        <div className="flex-1 flex items-center gap-5">
                          <div className="size-12 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/20 flex items-center justify-center shrink-0">
                            <Timer className="w-6 h-6 text-orange-600" />
                          </div>

                          {!showExtendOptions ? (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                                Est. Ready In
                              </p>
                              <ProcessingCountdownDisplay
                                orderTime={processingStartTime}
                                preparationTime={totalPrepTime}
                                preparationStartedAt={
                                  order.preparation_started_at
                                }
                                onTimeExpired={() => {}}
                                className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter"
                              />
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                                Extend Prep Time
                              </p>
                              <p className="text-[13px] font-medium text-slate-500">
                                Select additional minutes
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {!showExtendOptions ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowExtendOptions(true)}
                              className="h-10 px-4 border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-950/10 hover:text-orange-600 transition-all"
                            >
                              Need more time?
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                {[5, 10, 15, 30].map((mins) => (
                                  <button
                                    key={mins}
                                    onClick={() => setSelectedExtendTime(mins)}
                                    className={cn(
                                      'px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all',
                                      selectedExtendTime === mins
                                        ? 'bg-orange-600 text-white'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                                    )}
                                  >
                                    +{mins}m
                                  </button>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                onClick={handleAddTime}
                                disabled={
                                  !selectedExtendTime || isExtendingTime
                                }
                                className="h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"
                              >
                                {isExtendingTime ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  'Add'
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowExtendOptions(false)
                                  setSelectedExtendTime(null)
                                }}
                                className="h-10 w-10 p-0 text-slate-400 hover:text-slate-600"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleMarkDelivered(order)}
                        disabled={isMarkDelivered}
                        className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        Quick Deliver
                      </Button>
                      <Button
                        onClick={() => onMarkReady(order)}
                        disabled={isMarkingReadyTransition}
                        className="flex-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
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

                {/* Context Sidebar */}
                <div className="lg:col-span-4">
                  <UnifiedDetails
                    order={order}
                    taxAmount={taxAmount}
                    grandTotal={grandTotal}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Status Bar for collapsed state */}
      {!isExpanded && (
        <div className="px-6 py-3 bg-orange-50/30 dark:bg-orange-900/5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" /> Ready in approx:
            </span>
            <ProcessingCountdownDisplay
              orderTime={processingStartTime}
              preparationTime={totalPrepTime}
              preparationStartedAt={order.preparation_started_at}
              onTimeExpired={() => {}}
              className="text-xs font-bold text-orange-700 dark:text-orange-400 tabular-nums"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-[10px] font-bold text-primary p-0 h-auto hover:bg-transparent tracking-widest"
          >
            MANAGE PREP →
          </Button>
        </div>
      )}
    </div>
  )
}
