import { create } from 'zustand'
import { ProcessedOrder, WebSocketOrder } from '@/types/WebSocketOrder'
import { processWebSocketOrders } from '@/components/admin/orders/utils/orderProcessing'
import axios from 'axios'
import { toast } from 'sonner'

interface GlobalOrderPopupState {
  // State
  isPopupVisible: boolean
  popupsEnabled: boolean // Controls whether popups should show for new orders
  currentOrder: ProcessedOrder | null
  processedOrderIds: Set<string>
  isTransitioning: boolean

  // Actions
  showPopup: (order: ProcessedOrder) => void
  hidePopup: () => void
  togglePopups: () => void
  enablePopups: () => void
  disablePopups: () => void
  handleWebSocketOrders: (orders: WebSocketOrder[]) => void
  acceptOrder: (order: ProcessedOrder, prepTime: number) => Promise<void>
  rejectOrder: (order: ProcessedOrder) => Promise<void>
  markOrderAsProcessed: (order: ProcessedOrder) => void
}

export const useGlobalOrderPopupStore = create<GlobalOrderPopupState>(
  (set, get) => ({
    // Initial state
    isPopupVisible: false,
    popupsEnabled: true, // Popups are enabled by default
    currentOrder: null,
    processedOrderIds: new Set<string>(),
    isTransitioning: false,

    // Actions
    showPopup: (order: ProcessedOrder) => {
      set({
        currentOrder: order,
        isPopupVisible: true,
        isTransitioning: false,
      })
    },

    hidePopup: () => {
      set({
        isPopupVisible: false,
        currentOrder: null,
        isTransitioning: false,
      })
    },

    togglePopups: () => {
      set((state) => {
        const newPopupsEnabled = !state.popupsEnabled
        return {
          popupsEnabled: newPopupsEnabled,
          // If disabling popups, hide current popup
          isPopupVisible: newPopupsEnabled ? state.isPopupVisible : false,
          currentOrder: newPopupsEnabled ? state.currentOrder : null,
        }
      })
    },

    enablePopups: () => {
      set({ popupsEnabled: true })
    },

    disablePopups: () => {
      set({
        popupsEnabled: false,
        isPopupVisible: false,
        currentOrder: null,
      })
    },

    handleWebSocketOrders: (rawOrders: WebSocketOrder[]) => {
      try {
        const { processedOrders } = processWebSocketOrders(rawOrders)
        const { processedOrderIds, isPopupVisible, popupsEnabled } = get()

        // Only process if popups are enabled
        if (!popupsEnabled) return

        // Check for new pending orders that haven't been processed
        const pendingOrders = processedOrders.filter((order) => {
          const isPending = order.order_status === 'pending'
          const orderKey = `${order.customer_id}-${order.created_at}`
          const isNotProcessed = !processedOrderIds.has(orderKey)
          return isPending && isNotProcessed
        })

        if (pendingOrders.length > 0 && !isPopupVisible) {
          // Show popup for the first new order
          const newOrder = pendingOrders[0]
          get().showPopup(newOrder)
        }
      } catch (error) {
        console.error('❌ GlobalOrderPopup - Error processing orders:', error)
      }
    },

    acceptOrder: async (order: ProcessedOrder, prepTime: number) => {
      set({ isTransitioning: true })

      try {
        // Get all order item IDs from the order
        const orderItemIds = order?.items?.map((item) => item.id)

        const apiData = {
          order_item_ids: orderItemIds,
          order_status: 'processing',
          preparation_time: prepTime,
          preparation_started_at: new Date().toISOString(),
        }
        await axios.patch('/api/orders', apiData)

        // Mark order as processed
        get().markOrderAsProcessed(order)

        toast.success('Order Accepted', {
          description: `Preparation time: ${prepTime} minutes`,
          style: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #22c55e',
            color: '#22c55e',
          },
          icon: '✅',
        })

        // Hide popup after successful acceptance
        setTimeout(() => {
          get().hidePopup()
        }, 1000)
      } catch (error) {
        console.error('Failed to accept order:', error)
        toast.error('Failed to accept order. Please try again.')
        set({ isTransitioning: false })
        throw error
      }
    },

    rejectOrder: async (order: ProcessedOrder) => {
      try {
        set({ isTransitioning: true })
        // Get all order item IDs from the order
        const orderItemIds = order?.items?.map((item) => item.id)

        const apiData = {
          order_item_ids: orderItemIds,
          order_status: 'cancelled',
        }

        await axios.patch('/api/orders', apiData)

        // Mark order as processed
        get().markOrderAsProcessed(order)

        toast.success('Order Rejected', {
          style: { backgroundColor: '#fffbeb', border: '1px solid #f59e0b' },
          icon: '❌',
        })

        // Hide popup
        get().hidePopup()
      } catch (error) {
        console.error('Failed to reject order:', error)
        toast.error('Failed to reject order. Please try again.')
      }
    },

    markOrderAsProcessed: (order: ProcessedOrder) => {
      const orderKey = `${order.customer_id}-${order.created_at}`
      set((state) => ({
        processedOrderIds: new Set(state.processedOrderIds).add(orderKey),
      }))
    },
  }),
)
