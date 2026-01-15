import sessionService from "./sessionService";

class SessionCleanupService {
  private static instance: SessionCleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private beforeUnloadListener: (() => void) | null = null;

  private constructor() {}

  static getInstance(): SessionCleanupService {
    if (!SessionCleanupService.instance) {
      SessionCleanupService.instance = new SessionCleanupService();
    }
    return SessionCleanupService.instance;
  }

  /**
   * Initialize session cleanup mechanisms
   */
  initialize(): void {
    this.startPeriodicCleanup();
    this.setupBeforeUnloadHandler();
    this.setupVisibilityChangeHandler();
  }

  /**
   * Start periodic session validation and cleanup
   */
  private startPeriodicCleanup(): void {
    // Check session validity every 5 minutes
    this.cleanupInterval = setInterval(() => {
      if (!sessionService.isSessionValid()) {
        console.log('Session expired, clearing...');
        sessionService.clearSession();
        
        // Redirect to admin login page if session expired
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Setup handler for browser close/refresh
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    this.beforeUnloadListener = () => {
      // Optional: Clear session on browser close
      // Uncomment if you want to clear session when browser closes
      // sessionService.clearSession();
    };

    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }

  /**
   * Setup handler for tab visibility changes
   */
  private setupVisibilityChangeHandler(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible, check session validity
        if (!sessionService.isSessionValid()) {
          console.log('Session expired while tab was hidden');
          sessionService.clearSession();
          window.location.href = '/admin/login';
        }
      }
    });
  }

  /**
   * Schedule session renewal for active users
   */
  scheduleSessionRenewal(): void {
    const expirationTime = sessionService.getExpirationTime();
    if (!expirationTime) return;

    // Schedule renewal 1 hour before expiration
    const renewalTime = expirationTime - Date.now() - (60 * 60 * 1000);
    
    if (renewalTime > 0) {
      setTimeout(() => {
        if (sessionService.isSessionValid()) {
          // Extend session by updating expiration time
          const session = sessionService.getSession();
          if (session) {
            sessionService.setSession({
              _id: session._id,
              id: session.id,
              phone_number: session.phone_number,
              role: session.role,
              restaurant_rids: session.restaurant_rids,
              selected_rid: session.selected_rid,
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
            });
            
            console.log('Session renewed for active user');
            this.scheduleSessionRenewal(); // Schedule next renewal
          }
        }
      }, renewalTime);
    }
  }

  /**
   * Check if user is active (has interacted recently)
   */
  private isUserActive(): boolean {
    // Simple activity detection - can be enhanced
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;

    const lastActivityTime = parseInt(lastActivity);
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    return lastActivityTime > fiveMinutesAgo;
  }

  /**
   * Track user activity
   */
  trackActivity(): void {
    if (typeof window === 'undefined') return;

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Track various user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Initial activity timestamp
    updateActivity();
  }

  /**
   * Cleanup all listeners and intervals
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.beforeUnloadListener && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadListener);
      this.beforeUnloadListener = null;
    }
  }

  /**
   * Force session expiration (for testing or manual logout)
   */
  expireSession(): void {
    sessionService.clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiration(): number | null {
    const expirationTime = sessionService.getExpirationTime();
    if (!expirationTime) return null;

    const timeLeft = expirationTime - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  }

  /**
   * Check if session will expire soon (within specified minutes)
   */
  isSessionExpiringSoon(minutes: number = 5): boolean {
    const timeLeft = this.getTimeUntilExpiration();
    if (!timeLeft) return false;

    return timeLeft <= (minutes * 60 * 1000);
  }
}

export default SessionCleanupService.getInstance();