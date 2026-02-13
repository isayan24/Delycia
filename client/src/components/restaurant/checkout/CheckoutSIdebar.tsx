import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2, Receipt } from 'lucide-react'
import { useNavVisibility } from '@/utils/scrollUtils'
import { Shop } from '@mui/icons-material'

interface CheckoutSidebarProps {
  totalPrice: number
  selectedItems: any[]
  isCheckoutLoading: boolean
  disableButton: boolean
  taxPercent: number
  taxAmount: number
  grandTotal: number
}

export default function CheckoutSidebar({
  totalPrice,
  selectedItems,
  isCheckoutLoading,
  disableButton,
  taxPercent,
  taxAmount,
  grandTotal,
}: CheckoutSidebarProps) {
  const isNavVisible = useNavVisibility((state) => state.isNavVisible)

  const subtotal = totalPrice

  return (
    <main className="space-y-4 sticky top-16 h-full max-[890px]:w-full">
      <div className="flex min-[1550px]:flex-col gap-4 max-[1000px]:flex-col relative">
        <section className="py-5 flex flex-col gap-4 rounded-2xl p-4 border border-gray-100 max-[890px]:w-full w-98 bg-white shadow-sm">
          {/* Header */}
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            <span className="bg-linear-to-r from-orange-500 to-orange-600 text-white p-2 rounded-xl shadow-sm">
              <ShoppingCart className="w-4 h-4" />
            </span>
            Order Summary
          </h1>

          {/* Items list */}
          <div className="flex flex-col gap-0 bg-gray-50/80 rounded-xl overflow-hidden">
            {selectedItems.map((item: any, index: number) => (
              <div
                key={item.id}
                className={`flex justify-between items-start px-4 py-3 ${
                  index !== selectedItems.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    Qty: {item.quantity}
                  </span>
                  {item.addons && item.addons.length > 0 && (
                    <div className="flex flex-col mt-0.5">
                      {item.addons.map((addon: any) => (
                        <span key={addon.id} className="text-xs text-gray-400">
                          + {addon.quantity > 1 ? `${addon.quantity}× ` : ''}
                          {addon.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800 whitespace-nowrap ml-4">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="flex flex-col gap-2 pt-1">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Tax row — only shown when tax > 0 */}
            {taxPercent > 0 && (
              <div className="flex justify-between items-center text-sm px-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" />
                  GST ({taxPercent}%)
                </span>
                <span className="font-medium text-gray-700">
                  + ₹{taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Divider */}
            <hr className="border-dashed border-gray-200 my-1" />

            {/* Grand Total */}
            <div className="flex justify-between items-center px-1">
              <span className="text-base font-semibold text-gray-800">
                Amount to pay
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Place Order button */}
      <Button
        disabled={disableButton}
        className={`max-[890px]:w-[90%] w-full rounded-xl py-7 text-lg font-semibold bg-[#DC7F02] text-white hover:bg-[#e08a1ae0] max-[890px]:hover:bg-[#DC7F02] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center max-[890px]:fixed left-1/2 z-50 max-[890px]:-translate-x-1/2 ${isNavVisible ? 'bottom-16' : 'bottom-2'} ${isCheckoutLoading ? 'bg-[#e08a1adb]! cursor-not-allowed pointer-events-none' : ''}`}
      >
        {isCheckoutLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Shop className="w-5 h-5 mr-2" />
        )}
        {isCheckoutLoading ? 'Confirming Order' : 'Place Order'}
      </Button>
    </main>
  )
}
