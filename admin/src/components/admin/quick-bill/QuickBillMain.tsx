import { useState } from 'react'
import MenuSection from './MenuSection'
import { useMediaQuery } from '@/hooks/use-media-query'
import QuickBillSidebar from './QuickBillSidebar'
import BillingSheet from './BillingSheet'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { useCartStore } from '@/store/useCartStore'
import { cn } from '@/lib/utils'

export interface Customer {
  id: string
  name: string
  phone_number: string
  username: string
  isGuest?: boolean // Flag to indicate this is a pending guest customer
}

export default function QuickBillMain() {
  const { cart, addToCart, updateQuantity, clearCart } = useCartStore()

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [discount, setDiscount] = useState<number>(0)
  const isDesktop = useMediaQuery('(min-width: 900px)')

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price ?? item.cost_price ?? 0) * item.quantity,
    0,
  )

  const { grandTotal, taxAmount, taxPercent } = useOrderTaxCalculation({
    subtotal,
    discountAmount: discount,
  })

  return (
    <div className="flex flex-col @container sidebar:flex-row gap-4 text-black sidebar:h-[calc(100vh-150px)]">
      {/* Left Side: Menu Selection */}
      <div className="flex-1 min-w-0 sidebar:h-[calc(100vh-100px)]">
        <MenuSection addToCart={addToCart} cart={cart} />
      </div>

      {/* Right Side: Sidebar (Sticky on Desktop) */}
      <div
        className={cn(
          isDesktop
            ? 'w-[320px] @xl:w-[380px] shrink-0 sticky top-14 self-start'
            : 'hidden',
        )}
      >
        <QuickBillSidebar
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          cart={cart}
          updateQuantity={updateQuantity}
          onOrderComplete={clearCart}
          discount={discount}
          setDiscount={setDiscount}
          subtotal={subtotal}
          taxAmount={taxAmount}
          taxPercent={taxPercent}
          grandTotal={grandTotal}
        />
      </div>

      {/* Tablet & Mobile: Sheet / Drawer */}
      {!isDesktop && (
        <BillingSheet
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          cart={cart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          discount={discount}
          setDiscount={setDiscount}
          subtotal={subtotal}
          taxAmount={taxAmount}
          taxPercent={taxPercent}
          grandTotal={grandTotal}
        />
      )}
    </div>
  )
}
