import { create } from 'zustand'
import { Item } from '@/types/menu.types'

interface OrderItem extends Item {
  // Order-specific properties
  quantity: number
  totalPrice: number
  // Variant tracking
  isVariant?: boolean
  originalItemId?: string
  variantId?: string
}

interface TableStoreProps {
  // State
  currentState: number
  orderItems: OrderItem[]
  quantities: Record<string, number>
  itemsData: Record<string, Item>
  table: any
  categoryId: string

  // Highlighting state
  highlightedItemId: string | null
  highlightTimestamp: number | null

  // Actions
  changeState: (state: number) => void
  setOrderItems: (orderItems: OrderItem[]) => void
  clearAllItems: () => void
  updateQuantity: (itemId: string, change: number, itemData: Item) => void
  setTable: (table: any) => void
  setCategoryId: (categoryId: string) => void

  // Highlighting actions
  setHighlightedItem: (itemId: string | null) => void
  clearHighlight: () => void

  // table functions
  setRefetchTablesFunction: (fn: (() => Promise<void>) | null) => void
  refetchTables: () => Promise<void>
  refetchTablesFunction: (() => Promise<void>) | null

  // Computed getters
  getTotalAmount: () => number
}

export const useTableStore = create<TableStoreProps>((set, get) => ({
  // Initial state
  currentState: 0,
  orderItems: [],
  quantities: {},
  itemsData: {},
  table: {},
  categoryId: '',

  // Highlighting initial state
  highlightedItemId: null,
  highlightTimestamp: null,

  // table functions
  refetchTablesFunction: null,

  // Actions
  setCategoryId: (categoryId) => {
    set({ categoryId })
  },
  changeState: (state) => {
    set({ currentState: state })
  },
  setOrderItems: (orderItems) => {
    set({ orderItems })
  },
  clearAllItems: () => {
    set({
      orderItems: [],
      quantities: {},
      itemsData: {},
    })
  },
  updateQuantity: (itemId, change, itemData) => {
    const newQuantity = Math.max(0, (get().quantities[itemId] || 0) + change)

    set((state) => {
      const newState = {
        ...state,
        quantities: {
          ...state.quantities,
          [itemId]: newQuantity,
        },
      }

      // Store item data when quantity > 0, remove when quantity = 0
      if (newQuantity > 0) {
        newState.itemsData = {
          ...state.itemsData,
          [itemId]: itemData,
        }
      } else {
        const { [itemId]: removed, ...remainingItemsData } = state.itemsData
        newState.itemsData = remainingItemsData
      }

      return newState
    })

    // Update orderItems based on current state
    const updatedState = get()

    const selectedItems = Object.entries(updatedState.quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const item = updatedState.itemsData[itemId]
        if (!item) return null

        // Check if this is a variant item (has underscore and variant in ID)
        const isVariant = itemId.includes('_variant_')
        let originalItemId = ''
        let variantId = ''

        if (isVariant) {
          const parts = itemId.split('_variant_')
          originalItemId = parts[0]
          variantId = parts[1]
        }

        return {
          ...item,
          quantity,
          totalPrice: item.price * quantity,
          isVariant,
          originalItemId: isVariant ? originalItemId : undefined,
          variantId: isVariant ? variantId : undefined,
        }
      })
      .filter(Boolean) as OrderItem[]

    set({ orderItems: selectedItems })
  },
  setTable: (table) => {
    set({ table })
  },

  // Highlighting actions
  setHighlightedItem: (itemId) => {
    const timestamp = Date.now()
    set({
      highlightedItemId: itemId,
      highlightTimestamp: timestamp,
    })
  },

  clearHighlight: () => {
    set({
      highlightedItemId: null,
      highlightTimestamp: null,
    })
  },

  // table functions
  setRefetchTablesFunction(fn) {
    set({ refetchTablesFunction: fn })
  },
  refetchTables: async () => {
    const { refetchTablesFunction } = get()
    if (refetchTablesFunction) {
      try {
        await refetchTablesFunction()
      } catch (error) {
        console.error('Error refetching tables:', error)
      }
    } else {
      console.warn('No refetch function available')
    }
  },

  getTotalAmount: () => {
    const selectedItems = get().orderItems
    return selectedItems.reduce(
      (sum, orderItem) => sum + orderItem.totalPrice,
      0,
    )
  },
}))
