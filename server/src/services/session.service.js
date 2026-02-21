import redisService from './redis.service.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Session Management Service - Redis-based session tracking
 * 
 * Features:
 * - Track user sessions across multiple devices
 * - Store device info, IP, user agent
 * - Session activity tracking
 * - Multi-device logout support
 * - Session expiry management
 * - Graceful degradation (works without Redis)
 */

class SessionService {
  constructor() {
    this.SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
    this.KEY_PREFIX = 'delycia:session:';
    this.USER_SESSIONS_PREFIX = 'delycia:user:sessions:';
  }

  /**
   * Generate session key
   */
  _getSessionKey(sessionId) {
    return `${this.KEY_PREFIX}${sessionId}`;
  }

  /**
   * Generate user sessions key
   */
  _getUserSessionsKey(userId) {
    return `${this.USER_SESSIONS_PREFIX}${userId}`;
  }

  /**
   * Extract device info from request
   */
  _extractDeviceInfo(req) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection?.remoteAddress || 'Unknown';
    
    // Parse user agent for device type
    let deviceType = 'Desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'Tablet';
    
    // Parse browser
    let browser = 'Unknown';
    if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/edge/i.test(userAgent)) browser = 'Edge';
    
    // Parse OS
    let os = 'Unknown';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/mac/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/ios/i.test(userAgent)) os = 'iOS';
    
    return {
      deviceType,
      browser,
      os,
      userAgent,
      ip,
    };
  }

  /**
   * Create a new session
   * @param {number} userId - User ID
   * @param {string} refreshToken - Refresh token
   * @param {Object} req - Express request object
   * @returns {Promise<Object|null>} - Session object or null
   */
  async createSession(userId, refreshToken, req) {
    if (!userId || !refreshToken) {
      console.warn('[SessionService] Invalid parameters for session creation');
      return null;
    }

    try {
      const sessionId = uuidv4();
      const deviceInfo = this._extractDeviceInfo(req);
      const now = new Date().toISOString();
      
      const session = {
        sessionId,
        userId,
        refreshToken,
        ...deviceInfo,
        createdAt: now,
        lastActivity: now,
        lastRefresh: now,
        expiresAt: new Date(Date.now() + this.SESSION_TTL * 1000).toISOString(),
      };

      // Store session
      const sessionKey = this._getSessionKey(sessionId);
      const success = await redisService.set(
        sessionKey,
        JSON.stringify(session),
        { EX: this.SESSION_TTL }
      );

      if (!success) {
        console.warn('[SessionService] Failed to store session in Redis');
        return null;
      }

      // Add session to user's session list
      const userSessionsKey = this._getUserSessionsKey(userId);
      const userSessions = await redisService.get(userSessionsKey);
      const sessionsList = userSessions ? JSON.parse(userSessions) : [];
      
      sessionsList.push(sessionId);
      
      await redisService.set(
        userSessionsKey,
        JSON.stringify(sessionsList),
        { EX: this.SESSION_TTL }
      );

      console.log(`[SessionService] ✅ Session created: ${sessionId} for user ${userId}`);
      return session;
    } catch (err) {
      console.error('[SessionService] Create session error:', err.message);
      return null;
    }
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} - Session object or null
   */
  async getSession(sessionId) {
    if (!sessionId) {
      return null;
    }

    try {
      const sessionKey = this._getSessionKey(sessionId);
      const sessionData = await redisService.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (err) {
      console.error('[SessionService] Get session error:', err.message);
      return null;
    }
  }

  /**
   * Get session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object|null>} - Session object or null
   */
  async getSessionByRefreshToken(refreshToken) {
    if (!refreshToken) {
      return null;
    }

    try {
      // Search through all sessions (this is a fallback, not optimal for large scale)
      // In production, consider maintaining a refresh_token -> session_id mapping
      const pattern = `${this.KEY_PREFIX}*`;
      const keys = await redisService.keys(pattern);
      
      for (const key of keys) {
        const sessionData = await redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.refreshToken === refreshToken) {
            return session;
          }
        }
      }
      
      return null;
    } catch (err) {
      console.error('[SessionService] Get session by token error:', err.message);
      return null;
    }
  }

  /**
   * Update session activity
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} - Success status
   */
  async updateSessionActivity(sessionId) {
    if (!sessionId) {
      return false;
    }

    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }

      session.lastActivity = new Date().toISOString();
      
      const sessionKey = this._getSessionKey(sessionId);
      const success = await redisService.set(
        sessionKey,
        JSON.stringify(session),
        { EX: this.SESSION_TTL }
      );

      if (success) {
        console.log(`[SessionService] ✅ Activity updated for session ${sessionId}`);
      }

      return success;
    } catch (err) {
      console.error('[SessionService] Update activity error:', err.message);
      return false;
    }
  }

  /**
   * Update session last refresh time
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} - Success status
   */
  async updateSessionRefresh(sessionId) {
    if (!sessionId) {
      return false;
    }

    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }

      session.lastRefresh = new Date().toISOString();
      session.lastActivity = new Date().toISOString();
      
      const sessionKey = this._getSessionKey(sessionId);
      const success = await redisService.set(
        sessionKey,
        JSON.stringify(session),
        { EX: this.SESSION_TTL }
      );

      return success;
    } catch (err) {
      console.error('[SessionService] Update refresh error:', err.message);
      return false;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteSession(sessionId) {
    if (!sessionId) {
      return false;
    }

    try {
      // Get session to find userId
      const session = await this.getSession(sessionId);
      
      if (session) {
        // Remove from user's session list
        const userSessionsKey = this._getUserSessionsKey(session.userId);
        const userSessions = await redisService.get(userSessionsKey);
        
        if (userSessions) {
          const sessionsList = JSON.parse(userSessions);
          const updatedList = sessionsList.filter(id => id !== sessionId);
          
          if (updatedList.length > 0) {
            await redisService.set(
              userSessionsKey,
              JSON.stringify(updatedList),
              { EX: this.SESSION_TTL }
            );
          } else {
            await redisService.del(userSessionsKey);
          }
        }
      }

      // Delete session
      const sessionKey = this._getSessionKey(sessionId);
      const success = await redisService.del(sessionKey);

      if (success) {
        console.log(`[SessionService] ✅ Session deleted: ${sessionId}`);
      }

      return success;
    } catch (err) {
      console.error('[SessionService] Delete session error:', err.message);
      return false;
    }
  }

  /**
   * Get all sessions for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of session objects
   */
  async getUserSessions(userId) {
    if (!userId) {
      return [];
    }

    try {
      const userSessionsKey = this._getUserSessionsKey(userId);
      const userSessions = await redisService.get(userSessionsKey);
      
      if (!userSessions) {
        return [];
      }

      const sessionIds = JSON.parse(userSessions);
      const sessions = [];

      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          // Remove sensitive data
          const { refreshToken, ...safeSession } = session;
          sessions.push(safeSession);
        }
      }

      return sessions;
    } catch (err) {
      console.error('[SessionService] Get user sessions error:', err.message);
      return [];
    }
  }

  /**
   * Delete all sessions for a user (except current)
   * @param {number} userId - User ID
   * @param {string} currentSessionId - Current session ID to keep
   * @returns {Promise<number>} - Number of sessions deleted
   */
  async deleteUserSessions(userId, currentSessionId = null) {
    if (!userId) {
      return 0;
    }

    try {
      const userSessionsKey = this._getUserSessionsKey(userId);
      const userSessions = await redisService.get(userSessionsKey);
      
      if (!userSessions) {
        return 0;
      }

      const sessionIds = JSON.parse(userSessions);
      let deletedCount = 0;

      for (const sessionId of sessionIds) {
        if (sessionId !== currentSessionId) {
          const success = await this.deleteSession(sessionId);
          if (success) deletedCount++;
        }
      }

      // Update user sessions list
      if (currentSessionId) {
        await redisService.set(
          userSessionsKey,
          JSON.stringify([currentSessionId]),
          { EX: this.SESSION_TTL }
        );
      } else {
        await redisService.del(userSessionsKey);
      }

      console.log(`[SessionService] ✅ Deleted ${deletedCount} sessions for user ${userId}`);
      return deletedCount;
    } catch (err) {
      console.error('[SessionService] Delete user sessions error:', err.message);
      return 0;
    }
  }

  /**
   * Clean up expired sessions (maintenance task)
   * @returns {Promise<number>} - Number of sessions cleaned
   */
  async cleanupExpiredSessions() {
    try {
      const pattern = `${this.KEY_PREFIX}*`;
      const keys = await redisService.keys(pattern);
      let cleanedCount = 0;

      for (const key of keys) {
        const ttl = await redisService.ttl(key);
        if (ttl === -1 || ttl === -2) {
          // No TTL or expired
          await redisService.del(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`[SessionService] ✅ Cleaned up ${cleanedCount} expired sessions`);
      }

      return cleanedCount;
    } catch (err) {
      console.error('[SessionService] Cleanup error:', err.message);
      return 0;
    }
  }

  /**
   * Get session statistics
   * @returns {Promise<Object>} - Session statistics
   */
  async getStats() {
    try {
      const sessionPattern = `${this.KEY_PREFIX}*`;
      const sessionKeys = await redisService.keys(sessionPattern);
      
      const userPattern = `${this.USER_SESSIONS_PREFIX}*`;
      const userKeys = await redisService.keys(userPattern);

      return {
        totalSessions: sessionKeys.length,
        totalUsers: userKeys.length,
        avgSessionsPerUser: userKeys.length > 0 
          ? (sessionKeys.length / userKeys.length).toFixed(2) 
          : 0,
      };
    } catch (err) {
      console.error('[SessionService] Get stats error:', err.message);
      return {
        totalSessions: 0,
        totalUsers: 0,
        avgSessionsPerUser: 0,
      };
    }
  }
}

// Create singleton instance
const sessionService = new SessionService();

// Export service
export default sessionService;

// Export class for testing
export { SessionService };
