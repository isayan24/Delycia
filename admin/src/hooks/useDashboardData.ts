import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { useDateFilterStore } from "@/store/useDateFilterStore";
import tokenService from "@/services/tokenService";
import { DashboardErrorHandler, RetryHandler } from "@/utils/errorHandler";
import {
  DashboardData,
  DashboardApiParams,
  UseDashboardDataReturn,
  DashboardStats,
  SalesTrendData,
  OrderStatusData,
  TopSellingItem,
  CategoryRevenueData,
  PaymentMethodData,
  DeliveryTypeData,
} from "@/types/dashboard.types";

interface UseDashboardDataProps {
  rid: string;
  accessToken: string;
}

// Enhanced cache with LRU eviction
class DashboardCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; accessCount: number }
  >();
  private maxSize = 50;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }

    // Update access count for LRU
    cached.accessCount++;
    return cached.data;
  }

  set(key: string, data: any): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  private evictLRU(): void {
    let lruKey = "";
    let lruAccessCount = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.accessCount < lruAccessCount) {
        lruAccessCount = value.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const dashboardCache = new DashboardCache();

// Enhanced debounce with immediate execution option
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  immediate: boolean = false
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const immediateRef = useRef<boolean>(immediate);

  return useCallback(
    (...args: Parameters<T>) => {
      const callNow = immediateRef.current && !timeoutRef.current;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
        if (!immediateRef.current) callback(...args);
      }, delay);

      if (callNow) callback(...args);
    },
    [callback, delay]
  ) as T;
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = false;
  private maxConcurrent = 3;
  private activeRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.running = true;
    this.activeRequests++;

    try {
      await request();
    } finally {
      this.activeRequests--;
      this.running = false;

      // Process next request if available
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
}

const requestQueue = new RequestQueue();

export const useDashboardData = ({
  rid,
  accessToken,
}: UseDashboardDataProps): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentDateRange, setLoading: setFilterLoading } =
    useDateFilterStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const getCacheKey = useCallback((params: DashboardApiParams) => {
    return `dashboard-${params.rid}-${params.startDate}-${params.endDate}`;
  }, []);

  // Memoized cache operations
  const cacheOperations = useMemo(
    () => ({
      get: (key: string) => dashboardCache.get(key),
      set: (key: string, data: any) => dashboardCache.set(key, data),
      clear: () => dashboardCache.clear(),
    }),
    []
  );

  // Transform API responses to match our types
  const transformStatsData = (apiData: any): DashboardStats => {
    return {
      totalSales: Number(apiData.stats?.totalSales || 0),
      totalOrders: Number(apiData.stats?.totalOrders || 0),
      newCustomers: Number(apiData.stats?.newCustomers || 0),
      avgOrderValue: Number(apiData.stats?.avgOrderValue || 0),
      salesGrowth: Number(apiData.stats?.salesGrowth || 0),
      ordersGrowth: Number(apiData.stats?.ordersGrowth || 0),
      customersGrowth: Number(apiData.stats?.customersGrowth || 0),
      avgOrderGrowth: Number(apiData.stats?.avgOrderGrowth || 0),
    };
  };

  const transformSalesTrendData = (apiData: any[]): SalesTrendData[] => {
    return (apiData || []).map((item) => ({
      date: item.date,
      sales: Number(item.sales || 0),
      orders: Number(item.orders || 0),
    }));
  };

  const transformOrderStatusData = (apiData: any[]): OrderStatusData[] => {
    const total = (apiData || []).reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );
    return (apiData || []).map((item) => ({
      status: item.status,
      count: Number(item.count || 0),
      percentage: total > 0 ? (Number(item.count || 0) / total) * 100 : 0,
    }));
  };

  const transformTopItemsData = (apiData: any[]): TopSellingItem[] => {
    return (apiData || []).map((item) => ({
      itemId: Number(item.itemId || 0),
      name: item.name || "",
      totalQuantity: Number(item.totalQuantity || 0),
      orderCount: Number(item.orderCount || 0),
      totalRevenue: Number(item.totalRevenue || 0),
    }));
  };

  const transformCategoryRevenueData = (
    apiData: any[]
  ): CategoryRevenueData[] => {
    return (apiData || []).map((item) => ({
      categoryId: Number(item.categoryId || 0),
      categoryName: item.categoryName || "",
      totalRevenue: Number(item.totalRevenue || 0),
      orderCount: Number(item.orderCount || 0),
    }));
  };

  const transformPaymentMethodData = (apiData: any[]): PaymentMethodData[] => {
    return (apiData || []).map((item) => ({
      type: item.method || "",
      count: Number(item.count || 0),
      totalAmount: Number(item.totalAmount || 0),
    }));
  };

  const transformDeliveryTypeData = (apiData: any[]): DeliveryTypeData[] => {
    return (apiData || []).map((item) => ({
      type: item.type || "",
      count: Number(item.count || 0),
      totalAmount: Number(item.totalAmount || 0),
    }));
  };

  // Enhanced fetch function with performance optimizations
  const fetchDashboardData = useCallback(async () => {
    // Props are guaranteed to be valid by parent component

    const params: DashboardApiParams = {
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    };

    const cacheKey = getCacheKey(params);
    const cachedData = cacheOperations.get(cacheKey);

    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setFilterLoading(true);
    setError(null);

    try {
      let validAccessToken = accessToken;
      try {
        // Ensure we have a valid token (refreshed if necessary)
        const refreshedToken = await tokenService.getValidAccessToken();
        if (refreshedToken) {
          validAccessToken = refreshedToken;
        }
      } catch (tokenError) {
        console.warn(
          "Failed to refresh token before dashboard fetch, falling back to prop token",
          tokenError
        );
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${validAccessToken}`,
      };

      // Use retry handler for resilient API calls
      const dashboardData = await RetryHandler.withRetry(
        async () => {
          // Fetch all dashboard data in parallel with request queue management
          const requests = [
            () =>
              axiosInstance.get("/admin/dashboard/stats", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/sales-trend", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/order-status", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/top-items", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/revenue-by-category", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/payment-methods", {
                params,
                headers,
                signal,
              }),
            () =>
              axiosInstance.get("/admin/dashboard/delivery-types", {
                params,
                headers,
                signal,
              }),
          ];

          // Execute requests with controlled concurrency
          const responses = await Promise.all(
            requests.map((request) => requestQueue.add(request))
          );

          const [
            statsResponse,
            salesTrendResponse,
            orderStatusResponse,
            topItemsResponse,
            categoryRevenueResponse,
            paymentMethodsResponse,
            deliveryTypesResponse,
          ] = responses;

          return {
            stats: transformStatsData(statsResponse.data),
            salesTrend: transformSalesTrendData(
              salesTrendResponse.data.salesTrend
            ),
            orderStatus: transformOrderStatusData(
              orderStatusResponse.data.orderStatus
            ),
            topItems: transformTopItemsData(topItemsResponse.data.topItems),
            categoryRevenue: transformCategoryRevenueData(
              categoryRevenueResponse.data.categoryRevenue
            ),
            paymentMethods: transformPaymentMethodData(
              paymentMethodsResponse.data.paymentMethods
            ),
            deliveryTypes: transformDeliveryTypeData(
              deliveryTypesResponse.data.deliveryTypes
            ),
          };
        },
        3,
        "dashboard-data-fetch"
      );

      setData(dashboardData);
      cacheOperations.set(cacheKey, dashboardData);
      setError(null);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // Request was cancelled, don't update state
      }

      const errorDetails = DashboardErrorHandler.handleApiError(err);
      DashboardErrorHandler.logError(errorDetails, {
        context: "dashboard-data-fetch",
        params,
      });

      setError(errorDetails.userMessage);
      setData(null);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, [
    rid,
    accessToken,
    currentDateRange,
    getCacheKey,
    cacheOperations,
    setFilterLoading,
  ]);

  // Debounced version of fetch function
  const debouncedFetch = useDebounce(fetchDashboardData, 300);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    debouncedFetch();

    // Cleanup function to cancel requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
