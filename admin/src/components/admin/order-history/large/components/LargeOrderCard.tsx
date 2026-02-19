import React, { useState, useMemo, memo } from 'react'
import {
  Beef,
  Calendar,
  ChevronDown,
  Coffee,
  History,
  Pizza,
  Printer,
  UtensilsCrossed,
  Layers,
  Phone,
  Pin,
  CreditCard,
  Table as TableIcon,
  Carrot,
  CheckCircle2,
  Clock,
  User2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TransformedOrder,
  generateOrderTimeline,
  calculateDeliveryTime,
} from '../../utils/orderHistoryUtils'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'

interface LargeOrderCardProps {
  order: TransformedOrder
  onPrintBill: (order: TransformedOrder) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
  isSelectionDisabled?: boolean
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return {
        badge: 'bg-emerald-50 text-emerald-600 border-none',
        icon: 'bg-emerald-50 text-emerald-600',
        text: 'text-emerald-600',
        iconName: CheckCircle2,
        label: 'Delivered',
      }
    case 'CANCELLED':
    case 'REFUNDED':
      return {
        badge: 'bg-rose-50 text-rose-600 border-none',
        icon: 'bg-rose-50 text-rose-600',
        text: 'text-rose-600',
        iconName: History,
        label: 'Cancelled',
      }
    case 'PROCESSING':
    case 'PREPARING':
      return {
        badge: 'bg-orange-50 text-orange-600 border-none',
        icon: 'bg-orange-50 text-orange-600',
        text: 'text-orange-600',
        iconName: Clock,
        label: 'Processing',
      }
    default:
      return {
        badge: 'bg-gray-50 text-gray-600 border-none',
        icon: 'bg-gray-50 text-gray-600',
        text: 'text-gray-600',
        iconName: Clock,
        label: status,
      }
  }
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

// --- Sub-components for better readability ---

const OrderHeader = memo(
  ({
    order,
    statusInfo,
    formattedDate,
    totalItems,
    finalGrandTotal,
    isExpanded,
    onToggleExpand,
    onPrintBill,
    isSelectionMode,
    isSelected,
    onSelect,
    isMergeable,
  }: {
    order: TransformedOrder
    statusInfo: any
    formattedDate: string
    totalItems: number
    finalGrandTotal: number
    isExpanded: boolean
    onToggleExpand: () => void
    onPrintBill: (order: TransformedOrder) => void
    isSelectionMode: boolean
    isSelected: boolean
    onSelect?: () => void
    isMergeable: boolean
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
          isSelectionMode && isSelected && 'bg-rose-50/40 dark:bg-rose-900/10',
          isSelectionMode && !isMergeable && 'opacity-50 cursor-not-allowed',
        )}
        onClick={() => {
          if (isSelectionMode) {
            if (isMergeable && onSelect) onSelect()
          } else {
            onToggleExpand()
          }
        }}
      >
        <div
          className={cn(
            'flex flex-col justify-between gap-[4%] max-[1200px]:gap-2',
            isSidebarCollapsed
              ? 'md:flex-row md:items-center'
              : 'min-[1200px]:flex-row min-[1200px]:items-center',
          )}
        >
          {/* Left: ID & Status */}
          <div
            className={cn(
              'flex items-center min-w-[8rem]',
              isSidebarCollapsed
                ? 'max-[768px]:pr-32 transition-spacing'
                : 'max-[1024px]:pr-32 transition-spacing',
            )}
          >
            {isSelectionMode && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => isMergeable && onSelect?.()}
                  disabled={!isMergeable}
                  className="rounded border-slate-200"
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge
                  className={cn(
                    'px-1.5 py-0 border-none text-[9px] font-bold uppercase tracking-tight',
                    statusInfo.badge,
                  )}
                >
                  {statusInfo.label}
                </Badge>
                {order.paymentStatus === 'refunded' && (
                  <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-none text-[9px] font-bold uppercase">
                    Paid
                  </Badge>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                #{order.orderId}
              </h3>
            </div>
          </div>

          {/* Center: Customer & Time */}
          <div
            className={cn(
              'flex-1 grid grid-cols-2 gap-6',
              !isSidebarCollapsed && 'max-[1200px]:grid-cols-1',
            )}
          >
            <div
              className={cn(
                'space-y-1 pl:6 min-w-0',
                isSidebarCollapsed ? 'max-[1200px]:pl-6' : 'max-[1200px]:pl-0',
              )}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Brief
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1.5">
                  <User2 className="w-3.5 h-3.5 text-[#a16b45] shrink-0" />{' '}
                  {order.customerName || 'Guest'}
                </p>
                <p className="text-[11px] font-medium text-[#a16b45] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 shrink-0" /> {totalItems} Items
                </p>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Timeline
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#a16b45] shrink-0" />{' '}
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Right: Total & Actions */}
          <div
            className={cn(
              'flex items-center gap-6 justify-end',
              isSidebarCollapsed
                ? 'absolute top-4 right-6 md:static md:pl-6 md:min-w-[200px]'
                : 'absolute top-4 right-6 min-[1200px]:static lg:pl-6 lg:min-w-[200px]',
            )}
          >
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Final Total
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                ₹
                {finalGrandTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrintBill(order)
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
            <th className="py-3 px-4 text-right">Unit Price</th>
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
                  <div className="mt-1 shrink-0 text-primary/60">
                    {getItemIcon(item.name)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[15px] text-slate-700 dark:text-slate-200">
                      {item.name}
                      {item?.variant_name && (
                        <span className="text-slate-400 ml-1.5 font-medium">
                          / {item.variant_name}
                        </span>
                      )}
                    </p>
                    {item?.addons && item.addons.length > 0 && (
                      <p className="text-[11px] text-slate-400">
                        {item.addons
                          .map((a: any) => (typeof a === 'string' ? a : a.name))
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
              <td className="py-4 px-4 text-right tabular-nums text-slate-400 text-xs">
                ₹
                {item.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="py-4 pl-4 pr-6 text-right tabular-nums font-bold text-slate-700 dark:text-slate-200">
                ₹
                {(item.quantity * item.price).toLocaleString('en-IN', {
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

const TimelineSection = memo(
  ({
    deliveryTimeMsg,
    timeline,
    timelineColorClass,
  }: {
    deliveryTimeMsg: string
    timeline: any[]
    timelineColorClass: string
  }) => (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Lifecycle
        </h4>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
          {deliveryTimeMsg}
        </span>
      </div>

      <div className="relative pt-2 pb-2 px-4">
        {/* Track Line */}
        <div className="absolute top-[1.2rem] left-8 right-8 h-[2px] bg-slate-100 dark:bg-slate-800">
          <div
            className={cn(
              'h-full transition-all duration-500',
              timelineColorClass,
            )}
            style={{
              width:
                timeline.filter((s) => s.completed).length > 1 ? '98%' : '0%',
            }}
          />
        </div>

        <div className="flex justify-between relative z-10">
          {timeline.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'size-3.5 rounded-full border-2 transition-all mt-1 bg-white dark:bg-slate-900',
                  step.completed
                    ? cn('border-transparent scale-110', timelineColorClass)
                    : 'border-slate-200 dark:border-slate-700',
                )}
              >
                {step.completed && (
                  <CheckCircle2 className="size-2 text-white m-auto" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    'text-[12px] font-bold tracking-tight',
                    step.completed
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400',
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  {step.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
)
TimelineSection.displayName = 'TimelineSection'

const UnifiedDetails = memo(
  ({
    order,
    taxInfo,
    finalGrandTotal,
  }: {
    order: TransformedOrder
    taxInfo: any
    finalGrandTotal: number
  }) => (
    <div className="space-y-6">
      {/* Profiler - Very Compact */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {(order.customerName || 'G').charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {order.customerName || 'Guest User'}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pl-1">
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <User2 className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">
              {order.customerEmail || 'No email provided'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">
              {order.customerPhone || 'Contact Not Available'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            <TableIcon className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="font-medium">
              {order.tableNo ? `Table ${order.tableNo}` : 'Takeaway'}
            </span>
          </div>
          <div className="flex items-start gap-3 text-[12px] text-slate-500 leading-snug">
            <Pin className="w-3.5 h-3.5 opacity-40 mt-0.5 shrink-0" />
            <span className="font-medium italic">
              {order.deliveryAddress || 'Takeaway Order / No Address'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Section - Integrated (No dark box) */}
      <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Bill Summary
          </h4>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {order.paymentMethod || 'CASH'}
          </span>
        </div>

        <div className="space-y-2.5 tabular-nums">
          <div className="flex justify-between text-xs font-semibold text-slate-500/80">
            <span>Sub-total</span>
            <span>
              ₹
              {order.totalAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {order.deliveryFee ? (
            <div className="flex justify-between text-xs font-semibold text-slate-500/80">
              <span>Surcharge</span>
              <span>
                ₹
                {order.deliveryFee.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : null}

          {(order.discountAmount || 0) > 0 && (
            <div className="flex justify-between text-xs font-semibold text-emerald-600">
              <span>Benefits</span>
              <span>
                -₹
                {(order.discountAmount || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs font-semibold text-slate-500/80">
            <span>Tax ({taxInfo.taxPercent}%)</span>
            <span>
              ₹
              {taxInfo.taxAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Total
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹
              {finalGrandTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
)
UnifiedDetails.displayName = 'UnifiedDetails'

const ExpandedContent = memo(
  ({
    order,
    taxInfo,
    finalGrandTotal,
    deliveryTimeMsg,
    timeline,
    timelineColorClass,
  }: {
    order: TransformedOrder
    taxInfo: any
    finalGrandTotal: number
    deliveryTimeMsg: string
    timeline: any[]
    timelineColorClass: string
  }) => {
    return (
      <div className="border-t border-slate-100 dark:border-slate-800/50 p-6 pt-6 pb-8 bg-white dark:bg-slate-900/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Hero Logic Column */}
          <div className="lg:col-span-8 space-y-6">
            <ItemDetailsTable items={order.items} />
            <TimelineSection
              deliveryTimeMsg={deliveryTimeMsg}
              timeline={timeline}
              timelineColorClass={timelineColorClass}
            />
          </div>

          {/* Context Sidebar */}
          <div className="lg:col-span-4">
            <UnifiedDetails
              order={order}
              taxInfo={taxInfo}
              finalGrandTotal={finalGrandTotal}
            />
          </div>
        </div>
      </div>
    )
  },
)
ExpandedContent.displayName = 'ExpandedContent'

const LargeOrderCard = React.memo(
  ({
    order,
    onPrintBill,
    isSelected = false,
    onSelect,
    isSelectionMode = false,
    isSelectionDisabled = false,
  }: LargeOrderCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const isMergeable = !isSelectionDisabled

    const statusInfo = useMemo(
      () => getStatusStyles(order.status || (order as any).order_status),
      [order.status, order],
    )

    const totalItems = useMemo(
      () =>
        order.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0,
        ),
      [order.items],
    )

    const formattedDate = useMemo(
      () => formatDateTime(order.createdAt),
      [order.createdAt],
    )

    const taxInfo = useOrderTaxCalculation({
      subtotal: order.totalAmount,
      discountAmount: order.discountAmount || 0,
      rid: order.rid,
    })

    const finalGrandTotal = useMemo(
      () => taxInfo.grandTotal + (order.deliveryFee || 0),
      [taxInfo.grandTotal, order.deliveryFee],
    )

    const deliveryTimeMsg = useMemo(
      () => (isExpanded ? calculateDeliveryTime(order) : ''),
      [order, isExpanded],
    )

    const timeline = useMemo(
      () => (isExpanded ? generateOrderTimeline(order) : []),
      [order, isExpanded],
    )

    const timelineColorClass = useMemo(() => {
      if (!isExpanded) return ''
      switch (order.status) {
        case 'DELIVERED':
          return 'bg-emerald-500'
        case 'CANCELLED':
          return 'bg-rose-500'
        default:
          return 'bg-slate-300'
      }
    }, [order.status, isExpanded])

    return (
      <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
        <OrderHeader
          order={order}
          statusInfo={statusInfo}
          formattedDate={formattedDate}
          totalItems={totalItems}
          finalGrandTotal={finalGrandTotal}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onPrintBill={onPrintBill}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onSelect={onSelect}
          isMergeable={isMergeable}
        />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            >
              <ExpandedContent
                order={order}
                taxInfo={taxInfo}
                finalGrandTotal={finalGrandTotal}
                deliveryTimeMsg={deliveryTimeMsg}
                timeline={timeline}
                timelineColorClass={timelineColorClass}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
LargeOrderCard.displayName = 'LargeOrderCard'
export default LargeOrderCard
