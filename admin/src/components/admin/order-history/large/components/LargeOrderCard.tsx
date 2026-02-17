import React, { useState, useMemo, memo } from 'react'
import {
  Beef,
  Calendar,
  CheckCircle,
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
    return <Carrot className="w-5 h-5" />
  if (n.includes('pizza')) return <Pizza className="w-5 h-5" />
  if (n.includes('coffee') || n.includes('latte') || n.includes('macchiato'))
    return <Coffee className="w-5 h-5" />
  if (n.includes('meat') || n.includes('beef') || n.includes('steak'))
    return <Beef className="w-5 h-5" />
  return <UtensilsCrossed className="w-5 h-5" />
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
    const StatusIcon = statusInfo.iconName

    return (
      <div
        className={`p-4 cursor-pointer select-none transition-colors ${
          isSelectionMode && isSelected
            ? 'bg-rose-50/50 dark:bg-rose-900/10'
            : ''
        } ${isSelectionMode && !isMergeable ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          if (isSelectionMode) {
            if (isMergeable && onSelect) onSelect()
          } else {
            onToggleExpand()
          }
        }}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          {/* Selection / Status Icon */}
          <div className="flex items-center gap-4">
            {isSelectionMode && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => isMergeable && onSelect?.()}
                  disabled={!isMergeable}
                  className="size-5 rounded-md border-[#ead9cd] data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                />
              </div>
            )}
            <div
              className={`size-14 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.icon}`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
          </div>

          {/* Order Brief Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                #{order.orderId}
              </h3>
              <Badge
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.badge}`}
              >
                {statusInfo.label}
              </Badge>
              {order.paymentStatus === 'refunded' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Refunded
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#a16b45]">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-4 h-4" /> {totalItems} Items
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User2 className="w-4 h-4" /> {order.customerName || 'Guest'}
              </span>
            </div>
          </div>

          {/* Total Section */}
          <div className="flex items-center gap-3 divide-x divide-[#ead9cd] dark:divide-primary/10">
            <div className="pr-6">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrintBill(order)
                }}
                className="h-10 px-6 rounded-xl border border-[#ead9cd] dark:border-primary/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-[#a16b45]" />
              </Button>
            </div>

            <div className="pl-6 flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-[#a16b45] font-medium mb-1">
                  Order Total
                </p>
                <p
                  className={`text-xl font-bold ${statusInfo.text === 'text-rose-600' ? 'text-rose-600' : 'text-primary'}`}
                >
                  ₹
                  {finalGrandTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Expand Icon */}
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
OrderHeader.displayName = 'OrderHeader'

const ItemDetailsTable = memo(({ items }: { items: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold uppercase tracking-widest text-[#a16b45]">
      Item Details
    </h4>
    <div className="bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-background-light dark:bg-[#3a291d] text-[#a16b45] font-bold border-b border-[#ead9cd] dark:border-primary/10">
            <th className="px-6 py-4">Item</th>
            <th className="px-6 py-4 text-center">Qty</th>
            <th className="px-6 py-4 text-right">Price</th>
            <th className="px-6 py-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ead9cd] dark:divide-primary/10">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-orange-50 dark:bg-[#3a291d] flex items-center justify-center text-primary">
                    {getItemIcon(item.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.name}{' '}
                      <span className="text-xs text-[#a16b45] italic">
                        {item?.variant_name && `(${item.variant_name})`}
                      </span>
                    </span>
                    {item?.addons && item.addons.length > 0 && (
                      <span className="text-[11px] text-[#a16b45] italic">
                        +{' '}
                        {item.addons
                          .map((a: any) => (typeof a === 'string' ? a : a.name))
                          .join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center font-medium">
                {item.quantity}
              </td>
              <td className="px-6 py-4 text-right text-[#a16b45]">
                ₹{item.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                ₹{(item.quantity * item.price).toFixed(2)}
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
    <div className="flex-1 w-full space-y-6 bg-white dark:bg-[#2d1e14] p-6 rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold uppercase tracking-widest text-[#a16b45]">
          Order Timeline
        </h4>
        <span className="text-xs font-semibold text-[#a16b45] bg-orange-50 dark:bg-[#3a291d] px-3 py-1 rounded-full">
          {deliveryTimeMsg}
        </span>
      </div>

      <div className="relative py-4 px-2">
        <div
          className={`absolute top-10 left-8 right-8 h-0.5 ${timelineColorClass.replace('bg-', 'bg-opacity-20 bg-')}`}
        >
          <div
            className={`h-full ${timelineColorClass}`}
            style={{
              width:
                timeline.filter((s) => s.completed).length > 1 ? '100%' : '0%',
            }}
          />
        </div>

        <div className="flex justify-between relative z-10">
          {timeline.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                  step.completed
                    ? `${timelineColorClass} scale-110`
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-current" />
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {step.label}
                </p>
                <p className="text-[10px] font-medium text-[#a16b45]">
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

const TotalsBreakdown = memo(
  ({
    order,
    taxInfo,
    finalGrandTotal,
  }: {
    order: TransformedOrder
    taxInfo: any
    finalGrandTotal: number
  }) => (
    <div className="w-full lg:w-72 shrink-0 space-y-3 bg-white dark:bg-[#2d1e14] p-5 rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm">
      <div className="flex justify-between text-sm text-[#a16b45]">
        <span>Subtotal</span>
        <span className="font-semibold text-slate-900 dark:text-white">
          ₹{order.totalAmount.toFixed(2)}
        </span>
      </div>
      {order.deliveryFee ? (
        <div className="flex justify-between text-sm text-[#a16b45]">
          <span>Delivery Fee</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            ₹{order.deliveryFee.toFixed(2)}
          </span>
        </div>
      ) : null}
      {(order.discountAmount || 0) > 0 && (
        <div className="flex justify-between text-sm text-emerald-600 font-medium">
          <span>Discount</span>
          <span>-₹{(order.discountAmount || 0).toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-[#a16b45]">
        <span>Tax (GST {taxInfo.taxPercent}%)</span>
        <span className="font-semibold text-slate-900 dark:text-white">
          ₹{taxInfo.taxAmount.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-lg font-bold border-t border-[#ead9cd] dark:border-primary/10 pt-3 text-primary">
        <span>Grand Total</span>
        <span>₹{finalGrandTotal.toFixed(2)}</span>
      </div>
    </div>
  ),
)
TotalsBreakdown.displayName = 'TotalsBreakdown'

const CustomerInfoSection = memo(({ order }: { order: TransformedOrder }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold uppercase tracking-widest text-[#a16b45]">
      Customer Information
    </h4>
    <div className="bg-white dark:bg-[#2d1e14] p-6 rounded-xl border border-[#ead9cd] dark:border-primary/10 space-y-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
          {(order.customerName || 'G').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            {order.customerName || 'Guest'}
          </p>
          <p className="text-xs text-[#a16b45]">
            {order.customerEmail || 'No email provided'}
          </p>
        </div>
      </div>
      <div className="pt-4 flex flex-col gap-3 border-t border-[#ead9cd] dark:border-primary/10">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          {order.customerPhone || 'Contact Not Available'}
        </div>
        {order.deliveryAddress && (
          <div className="flex items-start gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
            <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary shrink-0">
              <Pin className="w-4 h-4" />
            </div>
            {order.deliveryAddress || 'Takeaway Order / No Address'}
          </div>
        )}
      </div>
    </div>
  </div>
))
CustomerInfoSection.displayName = 'CustomerInfoSection'

const MetadataSection = memo(({ order }: { order: TransformedOrder }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-bold uppercase tracking-widest text-[#a16b45]">
      Order Metadata
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white dark:bg-[#2d1e14] p-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm">
        <p className="text-[10px] text-[#a16b45] uppercase font-bold tracking-wider mb-2">
          Payment
        </p>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            {order.paymentMethod || 'UPI / Cash'}
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#2d1e14] p-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm">
        <p className="text-[10px] text-[#a16b45] uppercase font-bold tracking-wider mb-2">
          Table/Spot
        </p>
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {order.tableNo ? `Table ${order.tableNo}` : 'Takeaway'}
          </p>
        </div>
      </div>
    </div>
  </div>
))
MetadataSection.displayName = 'MetadataSection'

// --- Main Component ---

export const LargeOrderCard = React.memo(
  ({
    order,
    onPrintBill,
    isSelectionMode = false,
    isSelected = false,
    onSelect,
    isSelectionDisabled = false,
  }: LargeOrderCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const statusInfo = useMemo(
      () => getStatusStyles(order.status || (order as any).order_status),
      [order.status, order],
    )
    const isMergeable = !isSelectionDisabled

    const totalItems = useMemo(
      () =>
        order.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0,
        ),
      [order.items],
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

    const formattedDate = useMemo(
      () => formatDateTime(order.createdAt),
      [order.createdAt],
    )

    // Only calculate these expensive values when expanded
    const timeline = useMemo(
      () => (isExpanded ? generateOrderTimeline(order) : []),
      [order, isExpanded],
    )
    const deliveryTimeMsg = useMemo(
      () => (isExpanded ? calculateDeliveryTime(order) : ''),
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
      <div className="group bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden">
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

        {isExpanded && (
          <div className="border-t border-[#ead9cd] dark:border-primary/10 p-8 bg-background-light/50 dark:bg-background-dark/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <ItemDetailsTable items={order.items} />

                <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pt-2">
                  <TimelineSection
                    deliveryTimeMsg={deliveryTimeMsg}
                    timeline={timeline}
                    timelineColorClass={timelineColorClass}
                  />
                  <TotalsBreakdown
                    order={order}
                    taxInfo={taxInfo}
                    finalGrandTotal={finalGrandTotal}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <CustomerInfoSection order={order} />
                <MetadataSection order={order} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)
LargeOrderCard.displayName = 'LargeOrderCard'
