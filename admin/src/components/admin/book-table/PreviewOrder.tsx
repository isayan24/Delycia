import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Receipt,
  MapPin,
  Users,
  CheckCircle,
  Edit3,
  Trash2,
  ChevronLeft,
  UtensilsCrossed,
} from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import PartySizeSelector from './PartySizeSelector'

export default function PreviewOrder() {
  const {
    table,
    orderItems,
    clearAllItems,
    changeState,
    getTotalAmount,
    partySize,
  } = useTableStore()

  const [showPartySizeError, setShowPartySizeError] = useState(false)

  const onCancelOrder = () => {
    changeState(0)
    clearAllItems()
  }
  const onEditOrder = () => {
    changeState(1)
  }
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
    <div className="h-full flex flex-col bg-[#fcfcfd] dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onEditOrder}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                Order Preview
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelOrder}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl text-xs h-8 px-3"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditOrder}
              className="rounded-xl text-xs h-8 px-3 border-gray-200 dark:border-gray-700"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
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

      {/* Sticky Bottom Confirm Button */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:translate-y-[-1px] active:translate-y-0"
            size="lg"
            onClick={onConfirmOrder}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirm Order ₹{totalAmount.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  )
}
