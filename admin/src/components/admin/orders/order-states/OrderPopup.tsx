import { useState, useMemo, useEffect, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  X,
  Clock,
  User2,
  Printer,
  Volume2,
  VolumeX,
  Phone,
  Utensils,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import { formatOrderTime } from '../utils/orderProcessing'
import { CountdownDisplay } from '../countdown'
import { PrintBillDialog } from '../../order-history/shared/PrintBillDialog'
import { orderToBillData } from '@/components/billing/utils/orderToBillData'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useSoundContext } from '@/context/SoundContext'

interface OrderPopupProps {
  order: ProcessedOrder
  onAccept: (order: any, prepTime: number) => void
  onReject: (order: any) => void
  onClose: () => void
  isVisible: boolean
  onTogglePopups: () => void
  isTransitioning: boolean
}

export const OrderPopup = memo(function OrderPopup({
  order,
  onAccept,
  onReject,
  onClose,
  isVisible,
  onTogglePopups,
  isTransitioning,
}: OrderPopupProps) {
  const [prepTime, setPrepTime] = useState(30)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()
  const { isSoundEnabled, toggleSound } = useSoundContext()

  // Lock body scroll when popup is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  const handleAccept = () => {
    onAccept(order, prepTime)
  }
  const orderTimeLabel = formatOrderTime(order.created_at)
  const tableNumber =
    order.unique_table_numbers.length > 0 ? order.unique_table_numbers[0] : null

  const { subtotal, discountAmount, gstAmount, totalDue } = useMemo(() => {
    const sub = order.total_amount
    const disc = order.discount_amount || 0
    const discountedSub = sub - disc
    const gst = discountedSub * 0.05
    const total = (order as any).total_amount_after_tax || discountedSub + gst
    return {
      subtotal: sub,
      discountAmount: disc,
      gstAmount: gst,
      totalDue: total,
    }
  }, [
    order.total_amount,
    order.discount_amount,
    (order as any).total_amount_after_tax,
  ])

  const billData = useMemo(() => {
    if (!order) return null
    return orderToBillData(order, selectedRestaurant?.name || 'Restaurant')
  }, [order, selectedRestaurant])

  const globalNote = useMemo(() => {
    return order.items.find((item) => item.special_instructions)
      ?.special_instructions
  }, [order.items])

  if (!isVisible) return null

  return (
    <div className="relative w-[95%] max-w-[40rem]  group animate-in zoom-in-95 duration-300">
      {/* Print Dialog Integration */}
      {showPrintDialog && (
        <PrintBillDialog
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
          billData={billData as any}
        />
      )}

      {/* Receipt Container */}
      <Card
        id="printable-receipt"
        className="relative bg-[#fcfcfc] dark:bg-[#1a110a] border-t-4 border-orange-500 rounded-t-sm shadow-2xl overflow-visible border-x-0 border-b-0 max-h-[80vh] max-[500px]:max-h-[60vh] flex flex-col"
      >
        {/* Header Section */}
        <div className="px-8 max-[500px]:px-4!  pt-6 pb-2 space-y-4">
          <div className="flex items-start justify-between">
            {/* Left Side: Table & Small ID */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {tableNumber ? (
                  <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border-none text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
                    <Utensils className="w-3.5 h-3.5" strokeWidth={3} />
                    {order.table_zone} Table: {tableNumber}
                  </div>
                ) : (
                  <div className="px-2.5 py-1 bg-amber-50 text-amber-600 border-none rounded-full text-[11px] font-bold uppercase tracking-wider pointer-events-none">
                    Takeaway
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-slate-400">
                  <Clock className="w-3 h-3" strokeWidth={3} />
                  <span className="text-[12px] font-black">
                    {orderTimeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#64748b] dark:text-slate-400">
                  <User2 className="w-3 h-3" strokeWidth={3} />
                  <span className="text-[13px] font-black uppercase tracking-tight">
                    {order.customer_name || 'Guest'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#64748b] dark:text-slate-400">
                  <Phone className="w-3 h-3" strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-tight">
                    {order.customer_phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Action Icons */}
            <div className="flex items-center gap-1.5 no-print">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSound()
                }}
                className="h-8 w-8 rounded-lg text-slate-800 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={isSoundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPrintDialog(true)
                }}
                className="h-8 w-8 rounded-lg text-slate-800 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onClose()
                  onTogglePopups()
                }}
                className="h-8 w-8 rounded-lg text-slate-800 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dotted Divider */}
        <div className="px-4">
          <div className="border-t border-dashed border-slate-200 dark:border-white/10 w-full" />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Content Section */}
          <div className="px-8 max-[500px]:px-4! py-2 space-y-5">
            {/* Order Summary Label */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em]">
                ORDER SUMMARY
              </span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                NEW PENDING
              </span>
            </div>

            {/* Global Order Note (Deduplicated) */}
            {globalNote && (
              <div className="bg-orange-50 dark:bg-orange-500/10 border-l-2 border-orange-500 px-3 py-2 -mt-2">
                <p className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase leading-snug tracking-tight">
                  KITCHEN NOTE: {globalNote}
                </p>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-2 min-w-0">
                      <span className="text-base font-black text-orange-500 shrink-0">
                        {item.quantity}x
                      </span>
                      <span className=" text-shadow-md text-[#1e293b] dark:text-white uppercases leading-tight truncate tracking-tight">
                        {item.display_name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#64748b] dark:text-slate-400 tabular-nums">
                      ₹{item.total_amount.toFixed(2)}
                    </span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="pl-7">
                      <p className="text-[10px] font-black text-[#94a3b8] uppercase italic leading-none tracking-tight">
                        + {item.addons.map((a: any) => `${a.name}`).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Section with Dotted Top */}
            <div className="pt-4 mt-4 pb-4 space-y-1 relative">
              <div className="absolute top-0 left-0 right-0 border-t border-dashed border-slate-200 dark:border-white/10" />

              <div className="flex justify-between items-center text-[#94a3b8]">
                <span className="text-[11px] font-black uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-sm font-black tabular-nums">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-500">
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Discount
                  </span>
                  <span className="text-sm font-black tabular-nums">
                    -₹{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#94a3b8]">
                <span className="text-[11px] font-black uppercase tracking-wider">
                  GST (5%)
                </span>
                <span className="text-sm font-black tabular-nums">
                  ₹{gstAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-end pt-1">
                <span className="text-[11px] font-black text-[#64748b] dark:text-slate-300 uppercase tracking-widest mb-1.5">
                  TOTAL AMOUNT
                </span>
                <span className="text-xl font-black text-[#1e293b] dark:text-white tabular-num tracking-tighter max-[500px]:text-[16px] ">
                  ₹{totalDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section (Light Grey BG) */}
        <div className="bg-[#f8fafc] px-8 max-[500px]:px-4! py-2 space-y-4 no-print shrink-0 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#94a3b8] uppercase tracking-wider">
              PREP TIME
            </span>
            <Select
              value={String(prepTime)}
              onValueChange={(v) => setPrepTime(Number(v))}
            >
              <SelectTrigger className="w-[120px] h-10 bg-white dark:bg-transparent border-slate-200 dark:border-white/10 font-bold rounded-lg shadow-sm">
                <SelectValue placeholder="30 mins" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#2d1e14] border-slate-200 dark:border-white/10 font-bold z-50">
                {[5, 10, 15, 20, 25, 30, 40, 50, 60].map((mins) => (
                  <SelectItem
                    key={mins}
                    value={String(mins)}
                    className="font-bold"
                  >
                    {mins} mins
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onReject(order)}
              disabled={isTransitioning}
              className="flex-1 h-12 border-slate-200 dark:border-white/10 text-[#f43f5e] font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-rose-50 hover:border-rose-100 transition-all max-[500px]:h-10 max-[500px]:text-[12px] max-[500px]:flex:0"
            >
              REJECT
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isTransitioning}
              className="flex-[2] h-12 bg-slate-950 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-black text-xs uppercase tracking-[0.1em] rounded-lg shadow-xl shadow-slate-900/10 transition-all font-inter max-[500px]:h-10 max-[500px]:text-[12px]"
            >
              <CountdownDisplay
                orderTime={order.created_at}
                onExpired={() => onReject(order)}
                renderAs="button"
                buttonText="ACCEPT ORDER"
              />
            </Button>
          </div>
        </div>

        {/* Serrated Edge Pattern */}
        <div
          className="absolute -bottom-2.5 left-0 right-0 h-2.5 bg-transparent overflow-hidden pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 3px 10px, transparent 3px, white 3px)`,
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0',
          }}
        />
      </Card>
    </div>
  )
})
