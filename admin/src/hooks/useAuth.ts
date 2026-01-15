
import { useState, useEffect, useCallback } from "react"; 
import axiosInstance from "@/lib/axios";
import sessionService, { UserData, UserUpdateData } from "@/services/sessionService";
import tokenService from "@/services/tokenService";
import sessionCleanupService from "@/services/sessionCleanupService";

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
  updateUserDetails: (updates: UserUpdateData) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  });

  // Initialize auth state from cookies
  const initializeAuth = useCallback(() => {
    try {
      const session = sessionService.getSession();
      if (session) {
        setAuthState({
          user: sessionService.getUserData(),
          isLoading: false,
          isAuthenticated: true,
          accessToken: session.accessToken,
        });
        
        // Schedule token refresh and session cleanup
        tokenService.scheduleTokenRefresh();
        sessionCleanupService.initialize();
        sessionCleanupService.trackActivity();
        sessionCleanupService.scheduleSessionRenewal();
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          accessToken: null,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await axiosInstance.post("/admin/auth/login", credentials);
      
      if (response.data?.statusCode === 200 && response.data?.data) {
        const userData = response.data.data;
        
        // Create session data based on your API response structure
        const sessionData = {
          _id: userData.uid || userData._id,
          id: userData.id,
          phone_number: userData.phone_number || credentials.phone_number,
          role: userData.role || 2, // Default role or get from userData if available
          restaurant_rids: userData.restaurant_rids || [],
          selected_rid: userData.restaurant_rids && userData.restaurant_rids.length > 0 ? userData.restaurant_rids[0] : null,
          accessToken: userData.access_token,
          refreshToken: userData.refresh_token,
        };

        // Store in session service
        sessionService.setSession(sessionData);

        // Update auth state
        setAuthState({
          user: sessionService.getUserData(),
          isLoading: false,
          isAuthenticated: true,
          accessToken: userData.access_token,
        });

        // Schedule token refresh and session cleanup
        tokenService.scheduleTokenRefresh();
        sessionCleanupService.scheduleSessionRenewal();

        return true;
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear session and cleanup services
      sessionService.clearSession();
      sessionCleanupService.cleanup();
      
      // Update auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const session = sessionService.getSession();
      if (session) {
        // Update auth state with current session data
        setAuthState({
          user: sessionService.getUserData(),
          isLoading: false,
          isAuthenticated: true,
          accessToken: session.accessToken,
        });
      } else {
        // No valid session, logout user
        logout();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
    }
  }, [logout]);

  // Get valid access token (with automatic refresh)
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await tokenService.getValidAccessToken();
      
      // Update auth state if token was refreshed
      if (token && token !== authState.accessToken) {
        const session = sessionService.getSession();
        if (session) {
          setAuthState(prev => ({
            ...prev,
            accessToken: token,
          }));
        }
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      return null;
    }
  }, [authState.accessToken]);

  // Update user details function
  const updateUserDetails = useCallback(async (updates: UserUpdateData): Promise<boolean> => {
    try {
      const success = sessionService.updateUserDetails(updates);
      
      if (success) {
        // Refresh the auth state to reflect the changes
        await refreshSession();
        console.log('User details updated and auth state refreshed');
        return true;
      } else {
        console.error('Failed to update user details in session');
        return false;
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      return false;
    }
  }, [refreshSession]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for session changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeAuth]);

  // Periodic session validation
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      if (!sessionService.isSessionValid()) {
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, logout]);

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    getValidAccessToken,
    updateUserDetails,
  };
}