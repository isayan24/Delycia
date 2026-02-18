import { create } from 'zustand'
import { Item } from '@/types/menu.types'

export interface CartItem extends Item {
  quantity: number
}

interface CartStore {
  cart: CartItem[]
  addToCart: (item: Item, behavior?: 'add' | 'toggle') => void
  updateQuantity: (itemId: string, delta: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (item, behavior = 'add') => {
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id)

      if (behavior === 'toggle' && existing) {
        return { cart: state.cart.filter((i) => i.id !== item.id) }
      }

      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] }
    })
  },

  updateQuantity: (itemId, delta) => {
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta)
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    }))
  },

  clearCart: () => set({ cart: [] }),
}))

// Selector for performance
export const selectCartTotalItems = (state: CartStore) =>
  state.cart.reduce((sum, item) => sum + item.quantity, 0)
