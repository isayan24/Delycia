import sessionService from "../../../services/session.service.js";
import jwt from "jsonwebtoken";

/**
 * Get all active sessions for the current user
 */
const getUserSessions = async (req, res) => {
  try {
    // Get user ID from access token
    const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.access_token;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        error: "Access token not provided"
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const userId = decoded.id;

    // Get all sessions for user
    const sessions = await sessionService.getUserSessions(userId);

    // Get current session ID
    const refresh_token = req.cookies?.refresh_token || req.headers?.['x-refresh-token'];
    let currentSessionId = null;
    
    if (refresh_token) {
      const currentSession = await sessionService.getSessionByRefreshToken(refresh_token);
      if (currentSession) {
        currentSessionId = currentSession.sessionId;
      }
    }

    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.sessionId === currentSessionId,
    }));

    res.status(200).json({
      status: true,
      data: {
        sessions: sessionsWithCurrent,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error("[getUserSessions] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to fetch sessions"
    });
  }
};

/**
 * Get session status (for expiry warnings)
 */
const getSessionStatus = async (req, res) => {
  try {
    const refresh_token = req.cookies?.refresh_token || req.headers?.['x-refresh-token'];
    
    if (!refresh_token) {
      return res.status(401).json({
        status: false,
        error: "Refresh token not provided"
      });
    }

    const session = await sessionService.getSessionByRefreshToken(refresh_token);
    
    if (!session) {
      return res.status(404).json({
        status: false,
        error: "Session not found"
      });
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const timeUntilExpiry = Math.floor((expiresAt - now) / 1000); // seconds

    res.status(200).json({
      status: true,
      data: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
        timeUntilExpiry, // seconds
        lastActivity: session.lastActivity,
        lastRefresh: session.lastRefresh,
      },
    });
  } catch (error) {
    console.error("[getSessionStatus] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to fetch session status"
    });
  }
};

/**
 * Extend session (refresh TTL)
 */
const extendSession = async (req, res) => {
  try {
    const refresh_token = req.cookies?.refresh_token || req.headers?.['x-refresh-token'];
    
    if (!refresh_token) {
      return res.status(401).json({
        status: false,
        error: "Refresh token not provided"
      });
    }

    const session = await sessionService.getSessionByRefreshToken(refresh_token);
    
    if (!session) {
      return res.status(404).json({
        status: false,
        error: "Session not found"
      });
    }

    // Update session activity (which also extends TTL)
    await sessionService.updateSessionActivity(session.sessionId);

    res.status(200).json({
      status: true,
      message: "Session extended successfully",
      data: {
        sessionId: session.sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("[extendSession] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to extend session"
    });
  }
};

/**
 * Logout from a specific session
 */
const logoutFromSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        error: "Session ID not provided"
      });
    }

    // Verify user owns this session
    const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.access_token;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        error: "Access token not provided"
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const userId = decoded.id;

    const session = await sessionService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        status: false,
        error: "Session not found"
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: false,
        error: "Unauthorized to delete this session"
      });
    }

    // Delete session
    await sessionService.deleteSession(sessionId);

    res.status(200).json({
      status: true,
      message: "Session deleted successfully"
    });
  } catch (error) {
    console.error("[logoutFromSession] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to delete session"
    });
  }
};

/**
 * Logout from all sessions except current
 */
const logoutFromAllSessions = async (req, res) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1] || req.cookies?.access_token;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        error: "Access token not provided"
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const userId = decoded.id;

    // Get current session ID
    const refresh_token = req.cookies?.refresh_token || req.headers?.['x-refresh-token'];
    let currentSessionId = null;
    
    if (refresh_token) {
      const currentSession = await sessionService.getSessionByRefreshToken(refresh_token);
      if (currentSession) {
        currentSessionId = currentSession.sessionId;
      }
    }

    // Delete all sessions except current
    const deletedCount = await sessionService.deleteUserSessions(userId, currentSessionId);

    res.status(200).json({
      status: true,
      message: `Logged out from ${deletedCount} device(s)`,
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error("[logoutFromAllSessions] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to logout from all sessions"
    });
  }
};

/**
 * Get session statistics (admin only)
 */
const getSessionStats = async (req, res) => {
  try {
    const stats = await sessionService.getStats();

    res.status(200).json({
      status: true,
      data: stats,
    });
  } catch (error) {
    console.error("[getSessionStats] Error:", error.message);
    res.status(500).json({
      status: false,
      error: "Failed to fetch session statistics"
    });
  }
};

export default {
  getUserSessions,
  getSessionStatus,
  extendSession,
  logoutFromSession,
  logoutFromAllSessions,
  getSessionStats,
};
