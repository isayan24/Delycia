import { Socket } from 'socket.io-client'

export interface Order {
  id: string | number
  [key: string]: any // Allow for flexible order structure
}

export interface OrdersResponse {
  orders: Order[]
  [key: string]: any
}

export interface UseOrdersWebSocketConfig {
  serverUrl?: string
  autoConnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onError?: (error: Error) => void
  onOrdersUpdate?: (orders: Order[]) => void
  onReconnecting?: (attempt: number) => void
  onReconnectFailed?: () => void
}

export interface UseOrdersWebSocketReturn {
  orders: Order[]
  status: string
  isConnected: boolean
  error: string | null
  connect: () => void
  disconnect: () => void
  refreshOrders: () => void
  socket: Socket | null
  isLoading: boolean
  reconnectAttempts: number
  isReconnecting: boolean
  networkStatus: 'online' | 'offline' | 'unknown'
}
