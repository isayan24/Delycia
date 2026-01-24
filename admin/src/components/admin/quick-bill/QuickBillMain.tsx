import { useState, useCallback } from 'react'
import MenuSection from './MenuSection'
import { Item } from '@/types/menu.types'
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

export interface CartItem extends Item {
  quantity: number
}

export interface Customer {
  id: string
  name: string
  phone_number: string
  username: string
}

export default function QuickBillMain() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [discount, setDiscount] = useState<number>(0)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const addToCart = useCallback((item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta)
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
    setDiscount(0)
  }, [])

  // Mobile Summary Calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price ?? item.cost_price) * item.quantity,
    0,
  )
  const totalAmount = Math.max(0, subtotal - discount)

  return (
    <div className="flex h-full gap-1 text-black relative">
      {/* Left Side: Menu Selection */}
      <div className={`flex-1 min-w-0 ${!isDesktop ? 'pb-20' : ''}`}>
        <MenuSection addToCart={addToCart} cart={cart} />
      </div>

      {/* Desktop Right Side */}
      {isDesktop ? (
        <div className="w-[380px] flex flex-col gap-3">
          <QuickBillSidebar
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            cart={cart}
            updateQuantity={updateQuantity}
            onOrderComplete={clearCart}
            discount={discount}
            setDiscount={setDiscount}
          />
        </div>
      ) : (
        /* Mobile Bottom Bar & Drawer */
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                className="w-full h-12 flex justify-between items-center text-lg"
                size="lg"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary-foreground/20 px-2 py-0.5 rounded text-sm font-bold">
                    {totalItems}
                  </div>
                  <span className="text-sm font-normal">View Bill</span>
                </div>
                <div className="font-bold">₹{totalAmount.toFixed(2)}</div>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Current Order</DrawerTitle>
              </DrawerHeader>
              <div className="h-full px-4 pb-4">
                <QuickBillSidebar
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  cart={cart}
                  updateQuantity={updateQuantity}
                  onOrderComplete={clearCart}
                  discount={discount}
                  setDiscount={setDiscount}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  )
}
