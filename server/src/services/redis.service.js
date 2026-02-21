import { createClient } from 'redis';

/**
 * Redis Service - Production-Ready Redis Connection Management
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Graceful degradation (fallback when Redis is down)
 * - Connection health monitoring
 * - Comprehensive error handling
 * - Environment-based configuration
 */

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL

      console.log('🔄 Connecting to Redis...');
      console.log('   URL:', redisUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000, // 5 second timeout
          reconnectStrategy: (retries) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
            if (retries > this.maxReconnectAttempts) {
              console.error('❌ Redis: Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            const delay = Math.min(1000 * Math.pow(2, retries), 30000);
            console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries + 1}/${this.maxReconnectAttempts})`);
            return delay;
          },
        },
      });

      // Event listeners
      this.client.on('error', (err) => {
        console.error('❌ Redis Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis: Connection established');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        console.log('✅ Redis: Ready to accept commands');
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis: Connection closed');
        this.isConnected = false;
      });

      // Connect
      await this.client.connect();

      // Test connection
      await this.client.ping();
      console.log('✅ Redis: Connection successful!');

      return true;
    } catch (err) {
      console.error('❌ Redis: Connection failed:', err.message);
      console.warn('⚠️  Continuing without Redis cache...');
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get value from Redis with fallback
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`Redis GET error for key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Set value in Redis with TTL
   */
  async set(key, value, options = {}) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      if (options.EX) {
        await this.client.setEx(key, options.EX, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (err) {
      console.error(`Redis SET error for key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Delete key from Redis
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      console.error(`Redis DEL error for key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(keys);
      return keys.length;
    } catch (err) {
      console.error(`Redis DEL pattern error for "${pattern}":`, err.message);
      return 0;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key) {
    if (!this.isConnected || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (err) {
      console.error(`Redis TTL error for key "${key}":`, err.message);
      return -1;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      console.error(`Redis EXISTS error for key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Increment value (for rate limiting)
   */
  async incr(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.incr(key);
    } catch (err) {
      console.error(`Redis INCR error for key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Set expiry on existing key
   */
  async expire(key, seconds) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (err) {
      console.error(`Redis EXPIRE error for key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern) {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (err) {
      console.error(`Redis KEYS error for pattern "${pattern}":`, err.message);
      return [];
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      client: this.client ? 'initialized' : 'not initialized',
      attempts: this.connectionAttempts,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isConnected || !this.client) {
      return {
        status: 'disconnected',
        message: 'Redis client not connected',
      };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency: `${latency}ms`,
        connected: true,
      };
    } catch (err) {
      return {
        status: 'unhealthy',
        message: err.message,
        connected: false,
      };
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('✅ Redis: Disconnected gracefully');
      } catch (err) {
        console.error('❌ Redis: Error during disconnect:', err.message);
      }
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

// Export service
export default redisService;

// Export class for testing
export { RedisService };
