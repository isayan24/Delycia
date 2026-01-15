
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import errorHandlingService from "./errorHandlingService";

export interface SessionData {
  _id: string;
  id: string;
  phone_number: string;
  role: number;
  restaurant_rids: number[];
  selected_rid: number | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
}

export interface UserData {
  _id: string;
  id: string;
  phone_number: string;
  role: number;
  restaurant_rids: number[];
  selected_rid: any;
}

// Interface for partial user updates
export interface UserUpdateData {
  selected_rid?: number | null;
  restaurant_rids?: number[];
  role?: number;
  phone_number?: string;
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

  private constructor() { }

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
      phone_number: session.phone_number,
      role: session.role,
      restaurant_rids: session.restaurant_rids,
      selected_rid: session.selected_rid,
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
   * Update user details in the session
   * This function allows partial updates to user data
   */
  updateUserDetails(updates: UserUpdateData): boolean {
    try {
      const currentSession = this.getSession();
      if (!currentSession) {
        console.error("No active session found to update");
        return false;
      }

      // Validate selected_rid if provided
      if (updates.selected_rid !== undefined) {
        if (updates.selected_rid !== null &&
          currentSession.restaurant_rids &&
          !currentSession.restaurant_rids.includes(updates.selected_rid)) {
          console.error(`Selected restaurant ID ${updates.selected_rid} is not in user's accessible restaurants`);
          return false;
        }
      }

      // Create updated session data
      const updatedSession: SessionData = {
        ...currentSession,
        // Update only the fields that are provided
        ...(updates.selected_rid !== undefined && { selected_rid: updates.selected_rid }),
        ...(updates.restaurant_rids !== undefined && { restaurant_rids: updates.restaurant_rids }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.phone_number !== undefined && { phone_number: updates.phone_number }),
        // Keep the same expiration time
        expiresAt: currentSession.expiresAt,
      };

      // Store the updated session
      setCookie(COOKIE_CONFIG.name, JSON.stringify(updatedSession), {
        maxAge: COOKIE_CONFIG.maxAge,
        httpOnly: COOKIE_CONFIG.httpOnly,
        secure: COOKIE_CONFIG.secure,
        sameSite: COOKIE_CONFIG.sameSite,
        path: COOKIE_CONFIG.path,
      });

      // Update cache
      this.sessionCache = updatedSession;

      return true;
    } catch (error) {
      console.error("Failed to update user details:", error);
      const authError = errorHandlingService.createAuthError(
        "CORRUPTED_COOKIE",
        "Failed to update user details in session",
        error,
        false
      );
      errorHandlingService.handleAuthError(authError);
      return false;
    }
  }

  /**
   * Specific function to update selected restaurant ID
   */
  updateSelectedRestaurant(restaurantId: number): boolean {
    return this.updateUserDetails({ selected_rid: restaurantId });
  }

  /**
   * Get the currently selected restaurant ID
   */
  getSelectedRestaurantId(): number | null {
    const session = this.getSession();
    return session?.selected_rid || null;
  }

  /**
   * Get list of accessible restaurant IDs
   */
  getAccessibleRestaurantIds(): number[] {
    const session = this.getSession();
    return session?.restaurant_rids || [];
  }

  /**
   * Check if a restaurant ID is accessible to the current user
   */
  isRestaurantAccessible(restaurantId: number): boolean {
    const accessibleIds = this.getAccessibleRestaurantIds();
    return accessibleIds.includes(restaurantId);
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
      "phone_number",
      "role",
      "restaurant_rids",
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