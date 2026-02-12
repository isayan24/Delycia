import { useState, useEffect, useCallback } from 'react'
import WebSocketManager from '@/services/WebSocketManager'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Order } from '@/types/webSocket.types'
import { formatDateTime, formatTimeNew } from '@/utils/dateUtils'

interface ConnectionState {
  isConnected: boolean
  status: string
  error: string | null
  isLoading: boolean
  isReconnecting: boolean
  reconnectAttempts: number
  networkStatus: 'online' | 'offline' | 'unknown'
}

interface UseWebSocketManagerReturn extends ConnectionState {
  orders: Order[]
  connect: () => Promise<void>
  disconnect: () => void
  refreshOrders: () => void
  subscribe: (event: string, callback: (...args: any[]) => void) => void
  unsubscribe: (event: string, callback: (...args: any[]) => void) => void
  emit: (event: string, data?: any) => void
}

/**
 * React hook to access the WebSocket singleton manager
 *
 * This hook:
 * - Subscribes to the singleton WebSocket manager
 * - Does NOT create a new connection on mount
 * - Does NOT disconnect on unmount (connection persists)
 * - Automatically connects when user is authenticated
 * - Returns connection state and control methods
 *
 * @example
 * ```tsx
 * const { isConnected, orders, subscribe, unsubscribe } = useWebSocketManager()
 *
 * useEffect(() => {
 *   const handleOrders = (data) => console.log('Orders:', data)
 */
export function useWebSocketManager(): UseWebSocketManagerReturn {
  const { user, isAuthenticated } = useAdminAuthQuery()
  const manager = WebSocketManager.getInstance()

  // Local state for connection status
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    manager.getState(),
  )

  // Local state for orders
  const [orders, setOrders] = useState<Order[]>([])

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = manager.subscribeToState(setConnectionState)
    return unsubscribe
  }, [manager])

  // Subscribe to order updates
  useEffect(() => {
    const handleOrdersUpdate = (data: any) => {
      const newOrders = (data.orders || []).map((order: any) => ({
        ...order,
        dateAndTime: formatDateTime(order.created_at),
        formattedTime: formatTimeNew(order.created_at),
      }))
      setOrders(newOrders)
    }

    manager.subscribe('all_orders', handleOrdersUpdate)

    return () => {
      manager.unsubscribe('all_orders', handleOrdersUpdate)
    }
  }, [manager])

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !connectionState.isConnected) {
      const userId = String(user._id || user.id)
      const rid = user.selected_rid

      if (userId && rid) {
        manager.connect(userId, rid)
      }
    }
  }, [isAuthenticated, user, connectionState.isConnected, manager])

  // Handle restaurant selection changes
  useEffect(() => {
    if (connectionState.isConnected && user?.selected_rid) {
      manager.updateRestaurant(user.selected_rid)
    }
  }, [user?.selected_rid, connectionState.isConnected, manager])

  // Connect method
  const connect = useCallback(async () => {
    if (!user) {
      console.warn('Cannot connect: No authenticated user')
      return
    }

    const userId = String(user._id || user.id)
    const rid = user.selected_rid

    if (userId && rid) {
      await manager.connect(userId, rid)
    }
  }, [user, manager])

  // Disconnect method
  const disconnect = useCallback(() => {
    manager.disconnect()
  }, [manager])

  // Refresh orders method
  const refreshOrders = useCallback(() => {
    manager.refreshOrders()
  }, [manager])

  // Subscribe to custom events
  const subscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      manager.subscribe(event, callback)
    },
    [manager],
  )

  // Unsubscribe from custom events
  const unsubscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      manager.unsubscribe(event, callback)
    },
    [manager],
  )

  // Emit events to server
  const emit = useCallback(
    (event: string, data?: any) => {
      manager.emit(event, data)
    },
    [manager],
  )

  return {
    ...connectionState,
    orders,
    connect,
    disconnect,
    refreshOrders,
    subscribe,
    unsubscribe,
    emit,
  }
}
