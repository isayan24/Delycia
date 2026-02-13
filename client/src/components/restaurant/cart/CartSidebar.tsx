import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { usePathname, useRouter } from '@/lib/next-compat'
import { toast } from 'sonner'
import {
  ShoppingCart,
  CreditCard,
  Loader2,
  Receipt,
  ArrowRight,
} from 'lucide-react'
import { useNavVisibility } from '@/utils/scrollUtils'
import { useCheckoutTax } from '@/hooks/useCheckoutTax'

export default function CartSidebar({ totalPrice, selectedItems }: any) {
  const router = useRouter()
  const isNavVisible = useNavVisibility((state) => state.isNavVisible)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  // Calculate tax (UI-only)
  const { taxPercent, taxAmount, grandTotal } = useCheckoutTax(totalPrice)

  const checkoutHandler = () => {
    setIsLoading(true)
    try {
      if (selectedItems.length > 0) {
        router.push('/checkout')
        if (pathname === '/checkout') {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
        toast.error('Please select at least one item')
      }
    } catch (error) {
      setIsLoading(false)
      toast.error('Please select at least one item')
    }
  }

  return (
    <main className="space-y-4 sticky top-16 h-full w-full max-w-[24rem] max-[1000px]:max-w-full">
      <section className="py-5 flex flex-col gap-4 rounded-2xl p-4 border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          <span className="bg-linear-to-r from-orange-500 to-orange-600 text-white p-2 rounded-xl shadow-sm">
            <ShoppingCart className="w-4 h-4" />
          </span>
          Order Summary
        </h1>

        {/* Price Breakdown */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-700">
              ₹{totalPrice.toFixed(2)}
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
            <section>
              <span className="text-base font-semibold text-gray-800 block">
                Grand Total
              </span>
              <span className="text-xs text-gray-400 font-normal">
                (Inclusive of all taxes)
              </span>
            </section>
            <span className="text-xl font-bold text-gray-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Checkout Button */}
      <Button
        onClick={checkoutHandler}
        disabled={isLoading || selectedItems.length === 0}
        className={`w-full rounded-xl py-7 text-lg font-semibold bg-[#DC7F02] text-white hover:bg-[#e08a1ae0] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center max-[700px]:fixed bottom-2 left-1/2 z-[999] max-[700px]:-translate-x-1/2 max-[700px]:w-[90%] ${isNavVisible ? 'bottom-16' : 'bottom-2'} ${isLoading || selectedItems.length === 0 ? 'bg-[#e08a1adb]! cursor-not-allowed opacity-80' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5 mr-2" />
        )}
        {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        {!isLoading && <ArrowRight className="w-5 h-5 ml-2 opacity-80" />}
      </Button>

      {/* Mobile Spacer */}
      <div className="h-24 min-[700px]:hidden block"></div>
    </main>
  )
}
