import { memo, useState, useMemo } from 'react'
import {
  Beef,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Coffee,
  History,
  Info,
  Pizza,
  Printer,
  User,
  UtensilsCrossed,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TransformedOrder } from '../utils/orderHistoryUtils'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'

interface MobileOrderCardProps {
  order: TransformedOrder
  onPrintBill: () => void
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return {
        badge: 'bg-emerald-50 text-emerald-600 border-none',
        card: 'bg-white dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10',
        total: 'text-primary',
        label: 'Delivered',
      }
    case 'CANCELLED':
    case 'REFUNDED':
      return {
        badge: 'bg-rose-50 text-rose-600 border-none',
        card: 'bg-white/60 dark:bg-[#2d1e14]/60 border-dashed border-[#ead9cd] dark:border-primary/20',
        total: 'text-rose-600',
        label: 'Cancelled',
      }
    case 'PROCESSING':
    case 'PREPARING':
      return {
        badge: 'bg-orange-50 text-orange-600 border-none',
        card: 'bg-white dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10',
        total: 'text-orange-600',
        label: 'Processing',
      }
    default:
      return {
        badge: 'bg-gray-50 text-gray-600 border-none',
        card: 'bg-white dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10',
        total: 'text-primary',
        label: status,
      }
  }
}

// Icon mapping for items based on name or type if available
const getItemIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('burger') || n.includes('fastfood'))
    return <Beef className="size-4 text-primary" />
  if (n.includes('pizza'))
    return <Pizza className="size-4 text-orange-700 font-bold" />
  if (n.includes('coffee') || n.includes('latte') || n.includes('macchiato'))
    return <Coffee className="size-4 text-primary" />
  return <UtensilsCrossed className="size-4 text-primary" />
}

const MobileOrderCard = memo(function MobileOrderCard({
  order,
  onPrintBill,
}: MobileOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const subtotal = useMemo(
    () => order.items.reduce((sum, item) => sum + item.price, 0),
    [order.items],
  )

  const { grandTotal } = useOrderTaxCalculation({
    subtotal,
    discountAmount: order.discountAmount || 0,
    rid: order.rid,
  })

  const styles = useMemo(() => getStatusStyles(order.status), [order.status])
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-all overflow-hidden shadow-sm ${styles.card} ${isExpanded && !isCancelled ? 'border-primary dark:border-primary/40 shadow-xl shadow-primary/5' : ''}`}
    >
      {/* Header with ID and Grand Total */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#a16b45] tracking-wider uppercase">
              Order ID
            </span>
            <Badge
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
            >
              {styles.label}
            </Badge>
          </div>
          <h3
            className={`text-sm font-semibold text-slate-900 dark:text-white`}
          >
            #{order.orderId}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#a16b45] font-bold uppercase tracking-wider mb-1">
            Grand Total
          </p>
          <p className={`text-md font-semibold ${styles.total}`}>
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Summary Row / Details Toggle */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl border border-[#ead9cd] dark:border-primary/10 ${isCancelled ? 'bg-white/40 dark:bg-[#2d1e14]/40' : 'bg-slate-50 dark:bg-[#3a291d]'}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 2).map((item: any, idx: number) => (
              <div
                key={idx}
                className={`size-8 rounded-lg border-2 border-white dark:border-[#2d1e14] flex items-center justify-center ${idx === 0 ? 'bg-orange-100 dark:bg-[#4a3629]' : 'bg-orange-200 dark:bg-[#5a4232]'}`}
              >
                {getItemIcon(item.name)}
              </div>
            ))}
          </div>
          <div>
            <p
              className={`text-sm font-bold ${isCancelled ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
            >
              {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
            </p>
            <p
              className={`text-[11px] font-medium ${isCancelled ? 'text-slate-400' : 'text-[#a16b45]'}`}
            >
              {order.customerName}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs font-bold flex items-center gap-1 transition-colors ${isCancelled ? 'text-slate-400' : 'text-primary'}`}
        >
          Details
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="flex flex-col gap-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Customer Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-[#a16b45]" />
              <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest leading-none">
                Customer Info
              </p>
            </div>
            <div className="flex justify-between items-center px-1">
              <div>
                <p
                  className={`text-sm font-bold ${isCancelled ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                  {order.customerName}
                </p>
                <p
                  className={`text-xs font-medium ${isCancelled ? 'text-slate-400' : 'text-[#a16b45]'}`}
                >
                  {order.customerPhone}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-wider">
                  Table No.
                </p>
                <p
                  className={`text-base font-bold ${isCancelled ? 'text-slate-400' : 'text-primary'}`}
                >
                  {order.tableNo
                    ? `${String(order.tableNo).padStart(2, '0')}`
                    : 'Takeaway'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#ead9cd] dark:bg-primary/10 w-full" />

          {/* Order Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-[#a16b45]" />
              <p className="text-[10px] font-bold text-[#a16b45] uppercase tracking-widest leading-none">
                Order Items
              </p>
            </div>
            <div className="flex flex-col gap-3 px-1">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold leading-tight ${isCancelled ? 'text-slate-400 line-through decoration-rose-300' : 'text-slate-900 dark:text-white'}`}
                    >
                      {item.quantity}x {item.name}{' '}
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
                  <span
                    className={`text-sm font-bold ${isCancelled ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                  >
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div
        className={`flex items-center justify-between pt-2 border-t ${isExpanded ? 'border-[#ead9cd] dark:border-primary/10' : 'border-transparent'}`}
      >
        <div className="flex items-center gap-1.5 text-[#a16b45]">
          {isCancelled ? (
            <History className="size-5" />
          ) : (
            <Calendar className="size-5" />
          )}
          <div className="flex flex-col leading-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isCancelled
                ? `Cancelled ${order.dateAndTime.split(',')[0]}`
                : order.dateAndTime.split(',')[0]}
            </span>
            <span className="text-[10px] font-bold">
              {order.dateAndTime.split(',')[1]?.trim() || ''}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCancelled && (
            <>
              <Button
                variant="outline"
                onClick={onPrintBill}
                className="flex items-center gap-2 px-6 py-2 border-[#ead9cd] dark:border-primary/10 rounded-xl text-[#a16b45] dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <Printer className="size-4" />
                Print
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

export default MobileOrderCard
