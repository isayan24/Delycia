import { io, Socket } from 'socket.io-client'
import axios from 'axios'

// Event emitter for React components to subscribe to
type EventCallback = (...args: any[]) => void
type EventSubscribers = Map<string, Set<EventCallback>>

interface ConnectionState {
  isConnected: boolean
  status: string
  error: string | null
  isLoading: boolean
  isReconnecting: boolean
  reconnectAttempts: number
  networkStatus: 'online' | 'offline' | 'unknown'
}

interface AuthData {
  rid: number
  userId: string
  restaurantRids: number[]
}

/**
 * Singleton WebSocket Manager
 * Maintains a single WebSocket connection across the entire application lifecycle
 * Survives route changes and component unmounts
 */
class WebSocketManager {
  private static instance: WebSocketManager | null = null
  private socket: Socket | null = null
  private subscribers: EventSubscribers = new Map()
  private stateSubscribers: Set<(state: ConnectionState) => void> = new Set()

  // Connection configuration
  // Uses VITE_WS_SERVER_URL from .env, defaults to production URL
  private serverUrl: string =
    import.meta.env.VITE_WS_SERVER_URL || 'wss://api.delycia.com/orders'
  private maxReconnectAttempts: number = 5
  private reconnectInterval: number = 3000
  private heartbeatInterval: number = 30000

  // State
  private state: ConnectionState = {
    isConnected: false,
    status: 'Disconnected',
    error: null,
    isLoading: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    networkStatus: 'unknown',
  }

  // Timers and refs
  private reconnectTimeoutId: NodeJS.Timeout | null = null
  private heartbeatTimeoutId: NodeJS.Timeout | null = null
  private isManualDisconnect: boolean = false
  private authData: AuthData | null = null

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.setupNetworkListeners()
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Set initial network status
    this.updateState({
      networkStatus: navigator.onLine ? 'online' : 'offline',
    })
  }

  /**
   * Handle network online event
   */
  private handleOnline = (): void => {
    console.log('🌐 Network back online')
    this.updateState({ networkStatus: 'online' })

    if (!this.socket?.connected && !this.isManualDisconnect) {
      console.log('🔄 Attempting reconnection...')
      this.attemptReconnect()
    }
  }

  /**
   * Handle network offline event
   */
  private handleOffline = (): void => {
    console.log('📡 Network offline')
    this.updateState({
      networkStatus: 'offline',
      status: 'Network offline 📡',
    })
  }

  /**
   * Update connection state and notify subscribers
   */
  private updateState(partial: Partial<ConnectionState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyStateSubscribers()
  }

  /**
   * Notify all state subscribers of state change
   */
  private notifyStateSubscribers(): void {
    this.stateSubscribers.forEach((callback) => callback(this.state))
  }

  /**
   * Subscribe to connection state changes
   */
  public subscribeToState(
    callback: (state: ConnectionState) => void,
  ): () => void {
    this.stateSubscribers.add(callback)
    // Immediately notify with current state
    callback(this.state)

    // Return unsubscribe function
    return () => {
      this.stateSubscribers.delete(callback)
    }
  }

  /**
   * Subscribe to a WebSocket event
   */
  public subscribe(event: string, callback: EventCallback): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event)!.add(callback)

    // If socket exists, add listener
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Unsubscribe from a WebSocket event
   */
  public unsubscribe(event: string, callback: EventCallback): void {
    const eventSubscribers = this.subscribers.get(event)
    if (eventSubscribers) {
      eventSubscribers.delete(callback)
      if (eventSubscribers.size === 0) {
        this.subscribers.delete(event)
      }
    }

    // Remove from socket if it exists
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  /**
   * Emit an event to the server
   */
  public emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`)
    }
  }

  /**
   * Get WebSocket authentication token from server
   */
  private async getWebSocketToken(): Promise<string> {
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
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }
  }

  /**
   * Clear heartbeat timeout
   */
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId)
      this.heartbeatTimeoutId = null
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.clearHeartbeatTimeout()

    this.heartbeatTimeoutId = setTimeout(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping')
        this.startHeartbeat() // Schedule next heartbeat
      }
    }, this.heartbeatInterval)
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.state.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateState({
        isReconnecting: false,
        status: 'Reconnection failed ❌',
        error: 'Maximum reconnection attempts reached',
      })
      return
    }

    if (this.state.networkStatus === 'offline') {
      this.updateState({ status: 'Waiting for network... 📡' })
      return
    }

    const attempt = this.state.reconnectAttempts + 1
    this.updateState({
      isReconnecting: true,
      reconnectAttempts: attempt,
      status: `Reconnecting... (${attempt}/${this.maxReconnectAttempts}) 🔄`,
    })

    this.reconnectTimeoutId = setTimeout(() => {
      if (!this.isManualDisconnect && this.authData) {
        this.connect(this.authData.userId, this.authData.rid)
      }
    }, this.reconnectInterval)
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(socket: Socket): void {
    // Connection established
    socket.on('connect', () => {
      console.log('✅ WebSocket connected')
      this.updateState({
        status: 'Connected ✅',
        isConnected: true,
        error: null,
        isLoading: false,
        isReconnecting: false,
        reconnectAttempts: 0,
      })

      this.clearReconnectTimeout()
      this.startHeartbeat()

      // Request all orders on connection
      if (this.authData?.rid) {
        socket.emit('all_orders', { rid: this.authData.rid })
      }

      // Notify custom subscribers
      this.notifySubscribers('connect')
    })

    // All orders received
    socket.on('all_orders', (data: any) => {
      this.notifySubscribers('all_orders', data)
    })

    // Orders refresh requested
    socket.on('orders_refresh', () => {
      if (this.authData?.rid) {
        socket.emit('all_orders', { rid: this.authData.rid })
      }
    })

    // Heartbeat response
    socket.on('pong', () => {
      console.log('💓 Heartbeat received')
    })

    // Connection error
    socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket connection error:', err.message)
      this.updateState({
        status: `Connection Error: ${err.message}`,
        error: err.message,
        isConnected: false,
        isLoading: false,
      })

      this.notifySubscribers('error', err)

      // Attempt reconnection if not manual disconnect
      if (!this.isManualDisconnect) {
        this.attemptReconnect()
      }
    })

    // Disconnection
    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason)
      this.updateState({
        status: 'Disconnected ❌',
        isConnected: false,
        isLoading: false,
      })

      this.clearHeartbeatTimeout()
      this.notifySubscribers('disconnect', reason)

      // Attempt reconnection for unexpected disconnects
      if (
        !this.isManualDisconnect &&
        reason !== 'client namespace disconnect'
      ) {
        this.attemptReconnect()
      }
    })

    // Connection timeout
    socket.on('connect_timeout', () => {
      console.log('⏱️ Connection timeout')
      this.updateState({
        status: 'Connection timeout ⏱️',
        error: 'Connection timeout',
        isLoading: false,
      })

      if (!this.isManualDisconnect) {
        this.attemptReconnect()
      }
    })

    // Re-attach all existing subscriber listeners
    this.subscribers.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        socket.on(event, callback)
      })
    })
  }

  /**
   * Notify all subscribers of an event
   */
  private notifySubscribers(event: string, ...args: any[]): void {
    const eventSubscribers = this.subscribers.get(event)
    if (eventSubscribers) {
      eventSubscribers.forEach((callback) => callback(...args))
    }
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(userId: string, rid: number): Promise<void> {
    // Already connected
    if (this.socket?.connected) {
      console.log('Already connected')
      return
    }

    // Network is offline
    if (this.state.networkStatus === 'offline') {
      this.updateState({
        status: 'Network offline 📡',
        error: 'No internet connection',
      })
      return
    }

    try {
      this.updateState({
        status: 'Connecting...',
        error: null,
        isLoading: true,
      })

      this.isManualDisconnect = false

      // Get WebSocket token from server (extracted from httpOnly cookie)
      const wsToken = await this.getWebSocketToken()

      // Store auth data for reconnection
      this.authData = { userId, rid, restaurantRids: [] }

      // Cleanup existing socket
      if (this.socket) {
        this.socket.disconnect()
        this.socket.removeAllListeners()
      }

      // Create new socket connection
      const newSocket = io(this.serverUrl, {
        auth: {
          token: wsToken,
          userId,
          rid,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We handle reconnection manually
        forceNew: true,
      })

      this.socket = newSocket
      this.setupSocketListeners(newSocket)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Connection error:', errorMessage)
      this.updateState({
        status: `Error: ${errorMessage}`,
        error: errorMessage,
        isLoading: false,
        isReconnecting: false,
      })

      this.notifySubscribers('error', err)
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    console.log('🔌 Manual disconnect')
    this.isManualDisconnect = true
    this.clearReconnectTimeout()
    this.clearHeartbeatTimeout()

    if (this.socket) {
      this.socket.disconnect()
      this.socket.removeAllListeners()
      this.socket = null
    }

    this.updateState({
      isConnected: false,
      status: 'Disconnected ❌',
      isLoading: false,
      reconnectAttempts: 0,
      isReconnecting: false,
    })
  }

  /**
   * Refresh orders manually
   */
  public refreshOrders(): void {
    if (this.socket?.connected && this.authData?.rid) {
      this.socket.emit('all_orders', { rid: this.authData.rid })
    } else if (!this.state.isReconnecting && this.authData) {
      // Try to reconnect if not connected
      this.connect(this.authData.userId, this.authData.rid)
    }
  }

  /**
   * Update restaurant ID (when user switches restaurants)
   */
  public updateRestaurant(rid: number): void {
    if (this.authData) {
      this.authData.rid = rid
    }

    if (this.socket?.connected) {
      this.socket.emit('all_orders', { rid })
    }
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return { ...this.state }
  }

  /**
   * Get current socket instance (use with caution)
   */
  public getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Cleanup - should only be called on app unmount
   */
  public destroy(): void {
    console.log('🧹 Destroying WebSocket manager')

    // Remove network listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }

    this.disconnect()
    this.subscribers.clear()
    this.stateSubscribers.clear()
    WebSocketManager.instance = null
  }
}

export default WebSocketManager
