import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Receipt, MapPin, CheckCircle, UtensilsCrossed } from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import PartySizeSelector from './PartySizeSelector'
import { motion, AnimatePresence } from 'motion/react'
import { useScrollHide } from '@/hooks/use-scroll-hide'

export default function PreviewOrder() {
  const { table, orderItems, changeState, getTotalAmount, partySize } =
    useTableStore()

  const [showPartySizeError, setShowPartySizeError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isHidden = useScrollHide(10, 50, scrollRef)

  const onConfirmOrder = () => {
    if (partySize === 0) {
      setShowPartySizeError(true)
      return
    }
    setShowPartySizeError(false)
    changeState(3)
  }

  const totalAmount = getTotalAmount()

  return (
    <div className="h-full flex flex-col bg-[#fcfcfd] dark:bg-gray-950 relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-6">
          {/* Table Information Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Table {table?.table_number || '#'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {table?.zone || 'Ground Floor'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  <span>{orderItems.length} items</span>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Party Size Selector */}
              <PartySizeSelector showError={showPartySizeError} />
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Order Items ({orderItems.length})
              </h2>
            </div>
            <div>
              {orderItems.map((orderItem, index) => (
                <div key={orderItem.id}>
                  <div className="px-4 py-3.5 flex items-center gap-3">
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                        <span className="text-primary font-bold">
                          {orderItem.quantity}×
                        </span>{' '}
                        {orderItem.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        ₹{orderItem.price} each
                      </p>
                    </div>
                    {/* Item Total */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹{orderItem.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {index < orderItems.length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
              {/* Todo: add gst/tax as needed */}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-gray-900 dark:text-white">
                  Total Amount
                </span>
                <span className="text-xl font-black text-primary tracking-tight">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer — hides/shows with MobileDock on scroll */}
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 150,
              mass: 1.5,
              opacity: { duration: 0.2 },
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] z-50"
          >
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 text-base font-bold shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all active:translate-y-0"
              size="lg"
              onClick={onConfirmOrder}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirm Order ₹{totalAmount.toFixed(2)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
