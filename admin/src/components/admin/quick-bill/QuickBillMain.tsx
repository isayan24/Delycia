import { useState } from 'react'
import MenuSection from './MenuSection'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import QuickBillSidebar from './QuickBillSidebar'
import { Button } from '@/components/ui/button'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { useCartStore, selectCartTotalItems } from '@/store/useCartStore'
import { motion, AnimatePresence } from 'motion/react'
import { useMobileViewport } from '@/hooks/use-mobile-viewport'
import { useScrollHide } from '@/hooks/use-scroll-hide'
import { cn } from '@/lib/utils'

export interface Customer {
  id: string
  name: string
  phone_number: string
  username: string
}

export default function QuickBillMain() {
  useMobileViewport()
  const isHiddenOnScroll = useScrollHide()
  const { cart, addToCart, updateQuantity, clearCart } = useCartStore()
  const totalItems = useCartStore(selectCartTotalItems)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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
    <div className="flex flex-col @container min-[900px]:flex-row gap-4 text-black relative">
      {/* Left Side: Menu Selection */}
      <div className="flex-1 min-w-0">
        <MenuSection addToCart={addToCart} cart={cart} />
      </div>

      {/* Right Side: Sidebar (Sticky on Desktop) */}
      <div
        className={cn(
          isDesktop
            ? 'w-[320px] @xl:w-[380px] shrink-0 sticky top-[3.5rem] self-start'
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

      {!isDesktop && (
        /* Mobile Sticky Bar & Drawer */
        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          repositionInputs={false} // CRITICAL: Prevents the sheet from jumping "way too up"
        >
          <AnimatePresence>
            {!isDrawerOpen && totalItems > 0 && !isHiddenOnScroll && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{
                  type: 'spring',
                  damping: 25, // Increased from 20 for more control
                  stiffness: 150, // Reduced from 250 for slower movement
                  mass: 1.5, // Increased from 0.5 for heavier feel
                  opacity: { duration: 0.2 },
                }}
                className="fixed bottom-[110px]  max-[500px]:bottom-[75px] left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] z-50"
              >
                <DrawerTrigger asChild>
                  <Button
                    className="w-full h-12 flex justify-between rounded-full items-center text-lg active:scale-95 transition-transform"
                    size="lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-foreground/20 px-2 py-0.5 rounded text-sm font-bold">
                        {totalItems}
                      </div>
                      <span className="text-sm font-normal">View Bill</span>
                    </div>
                    <div className="font-bold">₹{grandTotal.toFixed(2)}</div>
                  </Button>
                </DrawerTrigger>
              </motion.div>
            )}
          </AnimatePresence>

          <DrawerContent className="h-[90vh]">
            <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-200 my-4" />
            <DrawerHeader className="pt-0">
              <DrawerTitle className="text-center text-xl">
                Confirm Order
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden px-4 pb-6">
              <QuickBillSidebar
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                cart={cart}
                updateQuantity={updateQuantity}
                onOrderComplete={() => {
                  clearCart()
                  setIsDrawerOpen(false)
                }}
                discount={discount}
                setDiscount={setDiscount}
                subtotal={subtotal}
                taxAmount={taxAmount}
                taxPercent={taxPercent}
                grandTotal={grandTotal}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
