/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  Order,
  OrdersResponse,
  UseOrdersWebSocketConfig,
  UseOrdersWebSocketReturn,
} from '@/types/webSocket.types.ts'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import axios from 'axios'
// Custom hook for managing orders WebSocket connection with network resilience
export const useOrdersWebSocket = (
  config: UseOrdersWebSocketConfig = {},
): UseOrdersWebSocketReturn => {
  const {
    serverUrl = `ws://localhost:8020/orders`,
    // serverUrl = `wss://api.delycia.com/orders`,
    autoConnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onConnect,
    onDisconnect,
    onError,
    onOrdersUpdate,
    onReconnecting,
    onReconnectFailed,
  } = config

  const { user, isAuthenticated } = useAdminAuthQuery()

  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<string>('Disconnected')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0)
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false)
  const [networkStatus, setNetworkStatus] = useState<
    'online' | 'offline' | 'unknown'
  >('unknown')

  // Refs to prevent stale closures
  const userRef = useRef(user)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const isManualDisconnectRef = useRef<boolean>(false)

  // Update refs when values change
  userRef.current = user
  reconnectAttemptsRef.current = reconnectAttempts

  // Get dynamic data from auth
  const getAuthData = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser) {
      throw new Error('No authenticated user found')
    }

    return {
      rid: currentUser.selected_rid,
      userId: currentUser._id || currentUser.id,
      restaurantRids: currentUser.restaurant_rids,
    }
  }, [])

  // Fetch WebSocket authentication token
  const getWebSocketToken = useCallback(async (): Promise<string> => {
    try {
      const response = await axios.get('/api/ws-token', {
        withCredentials: true,
      })

      if (response.data?.token) {
        return response.data.token
      }

      throw new Error('No token received from server')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get WS token'
      console.error('WebSocket token fetch error:', errorMessage)
      throw new Error(`WS token fetch failed: ${errorMessage}`)
    }
  }, [])

  // Clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Clear heartbeat timeout
  const clearHeartbeatTimeout = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }, [])

  // Start heartbeat
  const startHeartbeat = useCallback(
    (socket: Socket) => {
      clearHeartbeatTimeout()

      heartbeatTimeoutRef.current = setTimeout(() => {
        if (socket.connected) {
          socket.emit('ping')
          startHeartbeat(socket) // Schedule next heartbeat
        }
      }, heartbeatInterval)
    },
    [heartbeatInterval, clearHeartbeatTimeout],
  )

  // Attempt reconnection
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setIsReconnecting(false)
      setStatus('Reconnection failed ❌')
      setError('Maximum reconnection attempts reached')
      onReconnectFailed?.()
      return
    }

    if (networkStatus === 'offline') {
      setStatus('Waiting for network... 📡')
      return
    }

    setIsReconnecting(true)
    setReconnectAttempts((prev) => prev + 1)

    const attempt = reconnectAttemptsRef.current + 1
    setStatus(`Reconnecting... (${attempt}/${maxReconnectAttempts}) 🔄`)

    onReconnecting?.(attempt)

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isManualDisconnectRef.current) {
        connect()
      }
    }, reconnectInterval)
  }, [
    maxReconnectAttempts,
    reconnectInterval,
    networkStatus,
    onReconnecting,
    onReconnectFailed,
  ])

  // Manual connection function
  const connect = useCallback(async () => {
    if (socket?.connected) return

    if (!isAuthenticated) {
      setStatus('Authentication required')
      setError('Please log in to connect')
      return
    }

    if (networkStatus === 'offline') {
      setStatus('Network offline 📡')
      setError('No internet connection')
      return
    }

    try {
      setStatus('Connecting...')
      setError(null)
      setIsLoading(true)
      isManualDisconnectRef.current = false

      // Get WebSocket token from server (extracted from httpOnly cookie)
      const wsToken = await getWebSocketToken()
      const { rid, userId } = await getAuthData()

      // Cleanup existing socket
      if (socket) {
        socket.disconnect()
      }

      const newSocket = io(serverUrl, {
        auth: {
          token: wsToken, // Use WS token for authentication
          userId,
          rid,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We handle reconnection manually
        forceNew: true,
      })

      setSocket(newSocket)

      newSocket.on('connect', () => {
        setStatus('Connected ✅')
        setIsConnected(true)
        setError(null)
        setIsLoading(false)
        setIsReconnecting(false)
        setReconnectAttempts(0)
        clearReconnectTimeout()

        // Start heartbeat
        startHeartbeat(newSocket)

        // Request all orders on connection
        if (rid) {
          newSocket.emit('all_orders', { rid })
        }

        onConnect?.()
      })

      newSocket.on('all_orders', (data: OrdersResponse) => {
        const newOrders = data.orders || []
        setOrders(newOrders)
        onOrdersUpdate?.(newOrders)
      })

      newSocket.on('orders_refresh', async () => {
        try {
          const { rid: currentRid } = await getAuthData()
          if (currentRid) {
            newSocket.emit('all_orders', { rid: currentRid })
          }
        } catch (err) {
          console.error('Failed to refresh orders:', err)
        }
      })

      // Handle pong response
      newSocket.on('pong', () => {
        // Heartbeat received, connection is alive
        console.log('Heartbeat received')
      })

      newSocket.on('connect_error', (err: Error) => {
        console.error('Socket connection error:', err.message)
        setStatus(`Connection Error: ${err.message}`)
        setError(err.message)
        setIsConnected(false)
        setIsLoading(false)

        onError?.(err)

        // Attempt reconnection if not manual disconnect
        if (!isManualDisconnectRef.current) {
          attemptReconnect()
        }
      })

      newSocket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason)
        setStatus('Disconnected ❌')
        setIsConnected(false)
        setIsLoading(false)
        clearHeartbeatTimeout()

        onDisconnect?.(reason)

        // Attempt reconnection for unexpected disconnects
        if (
          !isManualDisconnectRef.current &&
          reason !== 'client namespace disconnect'
        ) {
          attemptReconnect()
        }
      })

      // Handle connection timeout
      newSocket.on('connect_timeout', () => {
        console.log('Connection timeout')
        setStatus('Connection timeout ⏱️')
        setError('Connection timeout')
        setIsLoading(false)

        if (!isManualDisconnectRef.current) {
          attemptReconnect()
        }
      })

      return newSocket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setStatus(`Error: ${errorMessage}`)
      setError(errorMessage)
      setIsLoading(false)
      setIsReconnecting(false)
      onError?.(err as Error)
    }
  }, [
    serverUrl,
    isAuthenticated,
    getAuthData,
    getWebSocketToken,
    onConnect,
    onDisconnect,
    onError,
    onOrdersUpdate,
    socket,
    networkStatus,
    startHeartbeat,
    attemptReconnect,
    clearReconnectTimeout,
    clearHeartbeatTimeout,
  ])

  // Manual disconnect function
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true
    setIsReconnecting(false)
    clearReconnectTimeout()
    clearHeartbeatTimeout()

    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    setIsConnected(false)
    setStatus('Disconnected ❌')
    setIsLoading(false)
    setReconnectAttempts(0)
  }, [socket, clearReconnectTimeout, clearHeartbeatTimeout])

  // Refresh orders manually
  const refreshOrders = useCallback(async () => {
    if (socket?.connected) {
      try {
        const { rid } = await getAuthData()
        if (rid) {
          socket.emit('all_orders', { rid })
        }
      } catch (err) {
        console.error('Failed to refresh orders:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to refresh orders',
        )
      }
    } else if (!isReconnecting) {
      // Try to reconnect if not connected
      connect()
    }
  }, [socket, getAuthData, isReconnecting, connect])

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online')
      if (socket && !socket.connected && !isManualDisconnectRef.current) {
        console.log('Network back online, attempting reconnect...')
        attemptReconnect()
      }
    }

    const handleOffline = () => {
      setNetworkStatus('offline')
      setStatus('Network offline 📡')
    }

    // Check initial network status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [socket, attemptReconnect])

  // Auto-connect when authenticated
  useEffect(() => {
    if (
      autoConnect &&
      isAuthenticated &&
      user &&
      !socket?.connected &&
      !isManualDisconnectRef.current
    ) {
      connect()
    }
  }, [autoConnect, isAuthenticated, user, connect, socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManualDisconnectRef.current = true
      clearReconnectTimeout()
      clearHeartbeatTimeout()
      socket?.disconnect()
    }
  }, [socket, clearReconnectTimeout, clearHeartbeatTimeout])

  // Handle auth changes (token refresh, user changes)
  useEffect(() => {
    if (isAuthenticated && socket?.connected && user) {
      // If user or token changed, refresh auth
      getAuthData()
        .then(({ userId, rid }) => {
          socket.emit('auth_refresh', { userId, rid })
        })
        .catch((err) => {
          console.error('Failed to refresh auth:', err)
        })
    }
  }, [user, isAuthenticated, socket, getAuthData])

  // Handle restaurant selection changes
  useEffect(() => {
    if (socket?.connected && user?.selected_rid) {
      // Restaurant selection changed, request orders for new restaurant
      socket.emit('all_orders', { rid: user.selected_rid })
    }
  }, [user?.selected_rid, socket])

  return {
    orders,
    status,
    isConnected,
    error,
    connect,
    disconnect,
    refreshOrders,
    socket,
    isLoading,
    reconnectAttempts,
    isReconnecting,
    networkStatus,
  }
}
