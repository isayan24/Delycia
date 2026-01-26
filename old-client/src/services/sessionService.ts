"use client";

import { getCookie, setCookie, deleteCookie } from "cookies-next";
import errorHandlingService from "./errorHandlingService";

export interface SessionData {
  _id: string;
  id: string;
  country_code: string;
  phone_number: string;
  role: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
}

export interface UserData {
  _id: string;
  id: string;
  country_code: string;
  phone_number: string;
  role: number;
}

const COOKIE_CONFIG = {
  name: "session",
  maxAge: 14 * 24 * 60 * 60, // 14 days in seconds (1,209,600 seconds)
  httpOnly: false, // Set to false for client-side access
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

class SessionService {
  private static instance: SessionService;
  private sessionCache: SessionData | null = null;

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Set session data in cookies
   */
  setSession(sessionData: Omit<SessionData, "expiresAt" | "createdAt">): void {
    try {
      const now = Date.now();
      const fullSessionData: SessionData = {
        ...sessionData,
        expiresAt: now + COOKIE_CONFIG.maxAge * 1000, // Convert to milliseconds
        createdAt: now,
      };

      // Store in cookie
      setCookie(COOKIE_CONFIG.name, JSON.stringify(fullSessionData), {
        maxAge: COOKIE_CONFIG.maxAge,
        httpOnly: COOKIE_CONFIG.httpOnly,
        secure: COOKIE_CONFIG.secure,
        sameSite: COOKIE_CONFIG.sameSite,
        path: COOKIE_CONFIG.path,
      });

      // Update cache
      this.sessionCache = fullSessionData;
    } catch (error) {
      console.error("Failed to set session:", error);
      const authError = errorHandlingService.createAuthError(
        "CORRUPTED_COOKIE",
        "Failed to store session data",
        error,
        false
      );
      errorHandlingService.handleAuthError(authError);
      this.clearSession();
    }
  }

  /**
   * Get session data from cookies
   */
  getSession(): SessionData | null {
    try {
      // Return cached session if valid
      if (this.sessionCache && this.isSessionDataValid(this.sessionCache)) {
        return this.sessionCache;
      }

      // Get from cookie
      const cookieValue = getCookie(COOKIE_CONFIG.name);
      if (!cookieValue || typeof cookieValue !== "string") {
        this.sessionCache = null;
        return null;
      }

      const sessionData: SessionData = JSON.parse(cookieValue);

      // Validate session data
      if (!this.isSessionDataValid(sessionData)) {
        this.clearSession();
        return null;
      }

      // Update cache
      this.sessionCache = sessionData;
      return sessionData;
    } catch (error) {
      console.error("Failed to get session:", error);
      const authError = errorHandlingService.createAuthError(
        "CORRUPTED_COOKIE",
        "Failed to read session data",
        error,
        false
      );
      errorHandlingService.handleAuthError(authError);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session data from cookies and cache
   */
  clearSession(): void {
    try {
      deleteCookie(COOKIE_CONFIG.name, {
        path: COOKIE_CONFIG.path,
      });
      this.sessionCache = null;
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }

  /**
   * Check if session is valid and not expired
   */
  isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  /**
   * Get access token from session
   */
  getAccessToken(): string | null {
    const session = this.getSession();
    return session?.accessToken || null;
  }

  /**
   * Get user data without tokens
   */
  getUserData(): UserData | null {
    const session = this.getSession();
    if (!session) return null;

    return {
      _id: session._id,
      id: session.id,
      country_code: session.country_code,
      phone_number: session.phone_number,
      role: session.role,
    };
  }

  /**
   * Update session with new token data
   */
  updateTokens(accessToken: string, refreshToken: string): void {
    const currentSession = this.getSession();
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + COOKIE_CONFIG.maxAge * 1000, // Extend expiration
    };

    this.setSession(updatedSession);
  }

  /**
   * Check if session data has all required fields and is not expired
   */
  private isSessionDataValid(sessionData: any): sessionData is SessionData {
    if (!sessionData || typeof sessionData !== "object") {
      return false;
    }

    // Check required fields
    const requiredFields = [
      "_id",
      "id",
      "country_code",
      "phone_number",
      "role",
      "accessToken",
      "refreshToken",
      "expiresAt",
      "createdAt",
    ];
    for (const field of requiredFields) {
      if (!(field in sessionData)) {
        return false;
      }
    }

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Get session expiration time
   */
  getExpirationTime(): number | null {
    const session = this.getSession();
    return session?.expiresAt || null;
  }

  /**
   * Check if session will expire soon (within 5 minutes)
   */
  isSessionExpiringSoon(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000; // 1 day instead of 5 minutes
    return session.expiresAt <= oneDayFromNow;
  }
}

export default SessionService.getInstance();
