import { useEffect, useState, useCallback, useRef } from "react";
import { Order } from "@/types/Order";
import axiosInstance from "@/lib/axios";
import tokenService from "@/services/tokenService";

/**
 * Helper function to format date with IST conversion and same-day logic
 */
const formatDateToIST = (dateString: string): string => {
  if (!dateString) return "N/A";

  // Convert UTC to IST
  const utcDate = new Date(dateString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hours for IST

  // Get current date in IST
  const now = new Date();
  const currentIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  // Check if the order is from today
  const isToday = istDate.toDateString() === currentIST.toDateString();

  if (isToday) {
    // Show only time for today's orders
    return istDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    // Show date and time for older orders
    return istDate.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
};

/**
 * Custom hook for fetching user orders via REST API with RID filtering and auto-refresh
 * @param customerId - Customer ID to fetch orders for
 * @param rid - Restaurant ID to filter orders by
 * @param autoRefreshInterval - Auto refresh interval in milliseconds (default: 30000 = 30 seconds)
 * @param enableAutoRefresh - Whether to enable auto refresh (default: true)
 */
export default function UseFetchOrders(
  customerId?: string, 
  rid?: string | null,
  autoRefreshInterval: number = 30000, // 30 seconds default
  enableAutoRefresh: boolean = true
) {
  // State for order data
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders before filtering

  // UI state
  const [status, setStatus] = useState<string | null>("Loading...");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState<boolean>(enableAutoRefresh);

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  /**
   * Filter orders by restaurant ID
   */
  const filterOrdersByRid = useCallback((ordersData: Order[], restaurantId?: string | null) => {
   
    if (!restaurantId) {
      return ordersData; // Return all orders if no RID specified
    }
    
    const filtered = ordersData.filter(order => {
      // Convert both to strings for comparison since RID might be number or string
      const orderRid = String(order.rid || '');
      const targetRid = String(restaurantId);
      
      
      return orderRid === targetRid;
    });
    
    return filtered;
  }, []);

  /**
   * Fetch orders from the API
   */
  const fetchOrders = useCallback(async (showLoadingState: boolean = true) => {
    const accessToken = await tokenService.getValidAccessToken();
    if (!accessToken) {
      setStatus("Waiting for authentication...");
      return;
    }

    if (!customerId) {
      setStatus("Waiting for customer ID...");
      return;
    }

    if (showLoadingState) {
      setIsLoading(true);
      setStatus("Loading orders...");
    }
    
    setError(null);

    try {
      const response = await axiosInstance.get("/orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          customer_id: customerId,
        },
      });

      if (!mountedRef.current) return; // Component unmounted, don't update state

      if (response.data?.statusCode === 200 && response.data?.orders) {
        const ordersData = response.data.orders;
        
        // Process orders with formatted dates
        const processedOrders = ordersData.map((order: any) => ({
          ...order,
          // Format dates for display - use created_at as ordered_on since that's when order was placed
          ordered_on_ist: formatDateToIST(order.created_at),
          created_at_ist: formatDateToIST(order.created_at),
          updated_at_ist: formatDateToIST(order.updated_at),
          // Map API fields to expected UI fields
          foodDetails: {
            name: order.display_name || `Item #${order.item_id}`,
            preparation_time: order.preparation_time || 0,
            img: null, // API doesn't seem to have image field
          },
        }));

        // Sort orders by creation date - LATEST FIRST
        const sortedOrders = processedOrders.sort((a: any, b: any) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Latest orders first (descending order)
        });

        // Store all orders
        setAllOrders(sortedOrders);
        
        // Filter orders by RID
        const filteredOrders = filterOrdersByRid(sortedOrders, rid);
        setOrders(filteredOrders);
        
        const totalOrdersText = rid ? 
          `${filteredOrders.length} orders for restaurant (${sortedOrders.length} total)` : 
          `${sortedOrders.length} orders`;
        
        setStatus(`Loaded ${totalOrdersText} successfully ✅`);
      } else {
        setAllOrders([]);
        setOrders([]);
        setStatus("No orders found");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      if (mountedRef.current) {
        setError(error?.response?.data?.message || "Failed to fetch orders");
        setStatus("Error loading orders");
        setAllOrders([]);
        setOrders([]);
      }
    } finally {
      if (mountedRef.current && showLoadingState) {
        setIsLoading(false);
      }
    }
  }, [customerId, rid, filterOrdersByRid]);

  /**
   * Setup auto-refresh interval
   */
  const setupAutoRefresh = useCallback(() => {
    if (!isAutoRefreshActive || autoRefreshInterval <= 0) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchOrders(false); // Don't show loading state for auto-refresh
      }
    }, autoRefreshInterval);
  }, [isAutoRefreshActive, autoRefreshInterval, fetchOrders]);

  /**
   * Effect: Fetch orders when dependencies change
   */
  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  /**
   * Effect: Setup auto-refresh
   */
  useEffect(() => {
    if (isAutoRefreshActive) {
      setupAutoRefresh();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setupAutoRefresh, isAutoRefreshActive]);

  /**
   * Effect: Update filtered orders when RID changes
   */
  useEffect(() => {
    const filteredOrders = filterOrdersByRid(allOrders, rid);
    setOrders(filteredOrders);
    
    if (allOrders.length > 0) {
      const totalOrdersText = rid ? 
        `${filteredOrders.length} orders for restaurant (${allOrders.length} total)` : 
        `${allOrders.length} orders`;
      setStatus(`Loaded ${totalOrdersText} successfully ✅`);
    }
  }, [rid, allOrders, filterOrdersByRid]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Manual refresh function
   */
  const refreshOrders = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  /**
   * Toggle auto-refresh
   */
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshActive(prev => {
      const newState = !prev;
      
      if (newState) {
        // Enable auto-refresh
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            if (mountedRef.current) {
              fetchOrders(false);
            }
          }, autoRefreshInterval);
        }
      } else {
        // Disable auto-refresh
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      
      return newState;
    });
  }, [autoRefreshInterval, fetchOrders]);

  // Return the managed state and functions for component use
  return {
    orders, // Filtered orders for the user and restaurant
    allOrders, // All orders (unfiltered)
    status, // Current loading status
    isLoading, // Boolean loading state
    error, // Current error message if any
    refreshOrders, // Manual refresh function
    toggleAutoRefresh, // Toggle auto-refresh function
    isAutoRefreshActive, // Auto-refresh status (now a proper state variable)
  };
}