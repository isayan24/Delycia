/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to a failing service.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are blocked
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 * 
 * Features:
 * - Automatic state transitions
 * - Configurable failure threshold
 * - Configurable timeout
 * - Success/failure tracking
 * - Event callbacks for monitoring
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  successThreshold: number // Number of successes to close circuit from half-open
  timeout: number // Time in ms before attempting to close circuit
  name?: string // Circuit breaker name for logging
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  nextAttemptTime: number | null
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private consecutiveFailures: number = 0
  private consecutiveSuccesses: number = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private nextAttemptTime: number | null = null
  private readonly config: Required<CircuitBreakerConfig>

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      name: 'CircuitBreaker',
      ...config,
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed
      if (this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
        console.log(`[${this.config.name}] Circuit transitioning to HALF_OPEN`)
        this.state = CircuitState.HALF_OPEN
        this.consecutiveSuccesses = 0
      } else {
        const waitTime = this.nextAttemptTime ? Math.ceil((this.nextAttemptTime - Date.now()) / 1000) : 0
        throw new Error(`Circuit breaker is OPEN. Try again in ${waitTime} seconds.`)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now()
    this.successes++
    this.consecutiveSuccesses++
    this.consecutiveFailures = 0

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        console.log(`[${this.config.name}] Circuit closing after ${this.consecutiveSuccesses} successes`)
        this.state = CircuitState.CLOSED
        this.consecutiveSuccesses = 0
        this.nextAttemptTime = null
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now()
    this.failures++
    this.consecutiveFailures++
    this.consecutiveSuccesses = 0

    if (this.state === CircuitState.HALF_OPEN) {
      console.warn(`[${this.config.name}] Circuit opening - failure in HALF_OPEN state`)
      this.openCircuit()
    } else if (this.state === CircuitState.CLOSED) {
      if (this.consecutiveFailures >= this.config.failureThreshold) {
        console.warn(`[${this.config.name}] Circuit opening after ${this.consecutiveFailures} failures`)
        this.openCircuit()
      }
    }
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.timeout
    console.warn(`[${this.config.name}] Circuit OPEN until ${new Date(this.nextAttemptTime).toISOString()}`)
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.consecutiveFailures = 0
    this.consecutiveSuccesses = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.nextAttemptTime = null
    console.log(`[${this.config.name}] Circuit breaker reset`)
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
    }
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN && 
           (!this.nextAttemptTime || Date.now() < this.nextAttemptTime)
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }
}

/**
 * Create a circuit breaker with default configuration
 */
export function createCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  return new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
    name,
    ...config,
  })
}
