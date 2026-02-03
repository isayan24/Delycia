import { useMemo, useState, useEffect, useTransition, useCallback } from 'react'
import { useWebSocketManager } from '@/hooks/useWebSocketManager'
import {
  processWebSocketOrders,
  isOrderFromPast24Hours,
} from './utils/orderProcessing'
import { WebSocketOrder, ProcessedOrder } from '@/types/WebSocketOrder'

import { OrdersLoadingState } from './order-ui-card/OrdersLoadingState'
import { OrdersHeader } from './order-ui-card/OrdersHeader'

import OrderTabs from './OrderTabs'
import UseAdminSoundWrapper from './hooks/useAdminSoundWrapper'
import logger from '@/lib/logger-dynamic'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useGlobalOrderPopupStore } from '@/store/useGlobalOrderPopupStore'

// Order states - matching API
type OrderState =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'settled'

interface OrderWithState extends ProcessedOrder {
  state: OrderState
}

export default function OrdersMain() {
  const [ordersWithState, setOrdersWithState] = useState<OrderWithState[]>([])
  const [activeTab, setActiveTab] = useState('pending')
  const { showError, showSuccess, showInfo } = useToast()
  const {
    popupsEnabled,
    togglePopups,
    showPopup,
    acceptOrder,
    rejectOrder,
    markOrderAsProcessed,
  } = useGlobalOrderPopupStore()

  // Token no longer needed - server routes read from httpOnly cookies
  const [isAcceptingOrder, startAcceptingOrder] = useTransition()
  const [isRejectingOrder, startRejectTransition] = useTransition()
  const [isMarkingReady, startMarkingReady] = useTransition()
  const [isMarkDelivered, startMarkDelivered] = useTransition()

  // Use singleton WebSocket manager that persists across route changes
  const {
    orders: rawOrders,
    status,
    isConnected,
    error,
    isLoading,
    refreshOrders,
  } = useWebSocketManager()

  // Process raw WebSocket orders into grouped, component-ready format
  const { processedOrders } = useMemo(() => {
    try {
      const webSocketOrders = rawOrders as unknown as WebSocketOrder[]
      return processWebSocketOrders(webSocketOrders)
    } catch (error) {
      console.error('Error processing orders:', error)
      return {
        processedOrders: [],
        totalOrders: 0,
        totalCustomers: 0,
        errors: ['Failed to process orders'],
      }
    }
  }, [rawOrders])

  // Update orders with state when new orders arrive - use actual data status
  useEffect(() => {
    setOrdersWithState(() => {
      const newOrdersWithState = processedOrders.map((order) => {
        // Use actual order status from data, not dummy state
        const actualState = order.order_status as OrderState

        return {
          ...order,
          state: actualState,
        }
      })

      return newOrdersWithState
    })
  }, [processedOrders])

  // fix Wrapper functions that use the Zustand store functions
  const handleAcceptOrder = useCallback(
    (order: ProcessedOrder, prepTime: number) => {
      startAcceptingOrder(async () => {
        try {
          // Add 2-second delay while transition is active
          await new Promise((resolve) => setTimeout(resolve, 500))

          // No token needed - server route reads from httpOnly cookie
          await acceptOrder(order, prepTime)
          markOrderAsProcessed(order)
        } catch (error) {
          console.error('Failed to accept order:', error)
        }
      })
    },
    [acceptOrder, markOrderAsProcessed],
  )

  const handleRejectOrder = useCallback(
    (order: ProcessedOrder) => {
      startRejectTransition(async () => {
        try {
          // Add 2-second delay while transition is active
          await new Promise((resolve) => setTimeout(resolve, 500))

          // No token needed - server route reads from httpOnly cookie
          await rejectOrder(order)
          markOrderAsProcessed(order)
        } catch (error) {
          console.error('Failed to reject order:', error)
        }
      })
    },
    [rejectOrder, markOrderAsProcessed],
  )

  /// mark handle ready
  const handleMarkReady = useCallback(
    (order: ProcessedOrder) => {
      startMarkingReady(async () => {
        try {
          // Get all order item IDs from the order
          const orderItemIds = order?.items?.map((item) => item.id)
          await new Promise((resolve) => setTimeout(resolve, 500))

          const apiData = {
            order_item_ids: orderItemIds,
            order_status: 'ready',
          }

          await axios.patch('/api/orders', apiData)
          showInfo('Ready', 'Order marked as ready')
        } catch (error) {
          showError('Error', 'Failed to mark order as ready')
          logger.error('Fetching data', {
            error: error,
            component: 'OrdersMain',
          })
        }
      })
    },
    [startMarkingReady],
  )

  // mark handle delivered

  const handleMarkDelivered = useCallback(
    (order: ProcessedOrder) => {
      startMarkDelivered(async () => {
        try {
          // Get all order item IDs from the order
          const orderItemIds = order?.items?.map((item) => item.id)
          await new Promise((resolve) => setTimeout(resolve, 500))

          const apiData = {
            order_item_ids: orderItemIds,
            order_status: 'completed',
          }

          await axios.patch('/api/orders', apiData)
          showSuccess('Delivered', 'Order marked as delivered')
        } catch (error) {
          showError('Error', 'Failed to mark as delivered')
          logger.error('Fetching data', {
            error: error,
            component: 'OrdersMain',
          })
        }
      })
    },
    [startMarkDelivered],
  )

  const handleCall = (order: ProcessedOrder) => {
    console.log('📞 CALL CUSTOMER - Full Details:', {
      order: order,
      customer: {
        id: order.customer_id,
        name: order.customer_name,
        phone: order.customer_phone,
      },
    })
  }

  const handleViewTimeline = (order: ProcessedOrder) => {
    console.log('📋 VIEW TIMELINE - Full Details:', {
      order: order,
      customer: {
        id: order.customer_id,
        name: order.customer_name,
      },
      orderTime: order.created_at,
    })
  }
  // mark handle extra time
  const handleExtendTime = async (
    order: ProcessedOrder,
    additionalMinutes: number,
  ) => {
    const orderItemIds = order?.items?.map((item) => item.id)
    const apiData = {
      order_item_ids: orderItemIds,
      preparation_time: additionalMinutes,
    }

    try {
      await axios.patch('/api/orders', apiData)
      showSuccess('Success', 'Time extended successfully')

      // fix Update local state immediately for better UX
      setOrdersWithState((prevOrders) =>
        prevOrders.map((prevOrder) => {
          if (
            prevOrder.customer_id === order.customer_id &&
            prevOrder.created_at === order.created_at
          ) {
            return {
              ...prevOrder,
              preparation_time: additionalMinutes,
              time_extended: (prevOrder.time_extended || 0) + additionalMinutes,
            }
          }
          return prevOrder
        }),
      )
    } catch (error) {
      showError('Error', 'Failed to extend time')
      logger.error('Fetching data', {
        error: error,
        component: 'OrdersMain',
      })
    }
  }

  // Countdown logic moved to CountdownDisplay component for better performance

  // Expired order handling is now managed by individual CountdownDisplay components
  // This eliminates the need for a global interval and reduces re-renders

  // Filter orders by state
  const pendingOrders = ordersWithState.filter(
    (order) => order.state === 'pending',
  )
  const processingOrders = ordersWithState.filter(
    (order) => order.state === 'processing',
  )
  const readyOrders = ordersWithState.filter((order) => order.state === 'ready')

  // Custom toggle function that can show popup for existing pending orders
  const handleTogglePopups = useCallback(() => {
    const wasEnabled = popupsEnabled
    togglePopups() // Toggle the state first

    // If we're enabling popups and there are pending orders, show the first one
    if (!wasEnabled && pendingOrders.length > 0) {
      // Small delay to ensure the toggle state is updated
      setTimeout(() => {
        showPopup(pendingOrders[0])
      }, 100)
    }
  }, [popupsEnabled, togglePopups, pendingOrders, showPopup])

  // Filter completed and cancelled orders to only show past 24 hours
  // Include both 'completed' and 'settled' orders as delivered
  const completedOrders = ordersWithState.filter(
    (order) =>
      (order.state === 'completed' || order.state === 'settled') &&
      isOrderFromPast24Hours(order.created_at),
  )
  const cancelledOrders = ordersWithState.filter(
    (order) =>
      order.state === 'cancelled' && isOrderFromPast24Hours(order.created_at),
  )

  // For delivered orders, we'll use filtered completed orders (past 24 hours only)
  const deliveredOrders = completedOrders

  if (isLoading) {
    return <OrdersLoadingState />
  }

  if (error && !isConnected) {
    return (
      <div className="p-6">
        <OrdersHeader
          orderCount={0}
          status={status}
          onRefresh={refreshOrders}
          isConnected={isConnected}
        />
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive font-medium">Connection Error</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Sound Component for Pending Orders - only play if popups are disabled */}
      {!popupsEnabled && (
        <UseAdminSoundWrapper pendingOrdersCount={pendingOrders.length} />
      )}

      <div className="p-6 max-[700px]:p-3 space-y-6">
        <OrdersHeader
          orderCount={ordersWithState.length}
          status={status}
          onRefresh={refreshOrders}
          isConnected={isConnected}
          onTogglePopups={handleTogglePopups}
          popupsEnabled={popupsEnabled}
        />

        <OrderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingOrders={pendingOrders}
          processingOrders={processingOrders}
          readyOrders={readyOrders}
          deliveredOrders={deliveredOrders}
          cancelledOrders={cancelledOrders}
          handleAcceptOrder={handleAcceptOrder}
          handleRejectOrder={handleRejectOrder}
          handleMarkReady={handleMarkReady}
          handleMarkDelivered={handleMarkDelivered}
          handleCall={handleCall}
          handleViewTimeline={handleViewTimeline}
          handleExtendTime={handleExtendTime}
          isAcceptingOrder={isAcceptingOrder}
          isRejectingOrder={isRejectingOrder}
          isMarkingReady={isMarkingReady}
          isMarkDelivered={isMarkDelivered}
        />
      </div>
    </>
  )
}
