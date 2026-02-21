import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import QuickBillSidebar from './QuickBillSidebar'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'
import { useScrollHide } from '@/hooks/use-scroll-hide'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useCartStore, selectCartTotalItems } from '@/store/useCartStore'
import type { Customer } from './QuickBillMain'

interface BillingSheetProps {
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  cart: any[]
  updateQuantity: (itemId: string, delta: number) => void
  clearCart: () => void
  discount: number
  setDiscount: (discount: number) => void
  subtotal: number
  taxAmount: number
  taxPercent: number
  grandTotal: number
}

/** Floating "View Bill" trigger button shared by both Sheet and Drawer */
function ViewBillTrigger({
  totalItems,
  grandTotal,
  TriggerComponent,
}: {
  totalItems: number
  grandTotal: number
  TriggerComponent: typeof SheetTrigger | typeof DrawerTrigger
}) {
  return (
    <TriggerComponent asChild>
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
    </TriggerComponent>
  )
}

export default function BillingSheet({
  selectedCustomer,
  setSelectedCustomer,
  cart,
  updateQuantity,
  clearCart,
  discount,
  setDiscount,
  subtotal,
  taxAmount,
  taxPercent,
  grandTotal,
}: BillingSheetProps) {
  const isHiddenOnScroll = useScrollHide()
  const totalItems = useCartStore(selectCartTotalItems)
  const isTablet = useMediaQuery('(min-width: 600px)')

  const [isOpen, setIsOpen] = useState(false)

  const sidebarProps = {
    selectedCustomer,
    setSelectedCustomer,
    cart,
    updateQuantity,
    onOrderComplete: () => {
      clearCart()
      setIsOpen(false)
    },
    discount,
    setDiscount,
    subtotal,
    taxAmount,
    taxPercent,
    grandTotal,
  }

  const floatingBar = (
    <AnimatePresence>
      {!isOpen && totalItems > 0 && !isHiddenOnScroll && (
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
          className="fixed bottom-[110px] max-[500px]:bottom-[75px] left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] z-50"
        >
          <ViewBillTrigger
            totalItems={totalItems}
            grandTotal={grandTotal}
            TriggerComponent={isTablet ? SheetTrigger : DrawerTrigger}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Tablet (600–900px): Right-side Sheet
  if (isTablet) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {floatingBar}

        <SheetContent
          side="right"
          className="w-[380px] sm:max-w-[420px] overflow-y-auto p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-center text-xl">
              Confirm Order
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <QuickBillSidebar {...sidebarProps} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Mobile (<600px): Bottom Drawer
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
      {floatingBar}

      <DrawerContent className="h-[90vh]">
        <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-200 my-4" />
        <DrawerHeader className="pt-0">
          <DrawerTitle className="text-center text-xl">
            Confirm Order
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <QuickBillSidebar {...sidebarProps} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
