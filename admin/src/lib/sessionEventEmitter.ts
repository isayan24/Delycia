/**
 * Session Event Emitter
 *
 * Simple event emitter for session-related events.
 * Used to coordinate session error detection between TanStack Query and components.
 */

export type SessionErrorType =
  | 'SESSION_EXPIRED'
  | 'IDLE_TOO_LONG'
  | 'UNAUTHORIZED'

export interface SessionErrorEvent {
  type: SessionErrorType
  message: string
  timestamp: number
}

type EventListener = (event: SessionErrorEvent) => void

class SessionEventEmitter {
  private listeners: Set<EventListener> = new Set()

  /**
   * Emit a session error event
   */
  emit(event: SessionErrorEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in session event listener:', error)
      }
    })
  }

  /**
   * Subscribe to session error events
   */
  on(listener: EventListener) {
    this.listeners.add(listener)
  }

  /**
   * Unsubscribe from session error events
   */
  off(listener: EventListener) {
    this.listeners.delete(listener)
  }

  /**
   * Clear all listeners (cleanup)
   */
  clear() {
    this.listeners.clear()
  }
}

// Export singleton instance
export const sessionEventEmitter = new SessionEventEmitter()
