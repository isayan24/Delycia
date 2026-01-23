import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import MenuSection from './MenuSection'
import BillSummary from './BillSummary'
import CustomerSearch from './CustomerSearch'
import { Item } from '@/types/menu.types'

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

  return (
    <div className="flex h-full gap-3 p-3 text-black">
      {/* Left Side: Menu Selection */}
      <div className="flex-1 min-w-0">
        <MenuSection addToCart={addToCart} />
      </div>

      {/* Right Side: Bill Summary & Customer */}
      <div className="w-[380px] flex flex-col gap-3">
        <Card className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          <h2 className="text-lg font-bold">Quick Bill</h2>

          <CustomerSearch
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />

          <div className="flex-1 overflow-hidden min-h-0">
            <BillSummary
              cart={cart}
              updateQuantity={updateQuantity}
              selectedCustomer={selectedCustomer}
              onOrderComplete={clearCart}
              discount={discount}
              setDiscount={setDiscount}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
