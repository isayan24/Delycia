import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries/queryKeys'
import axios from 'axios' // Call local server routes, NOT backend directly!
import type {
  DashboardStats,
  SalesTrendData,
  OrderStatusData,
  TopSellingItem,
  CategoryRevenueData,
  DeliveryTypeData,
  InventoryLevelsResponse,
} from '@/types/dashboard.types'

// ============================================
// Type Definitions
// ============================================

export interface DashboardQueryParams {
  rid: string
  startDate?: string
  endDate?: string
  filter?: string
}

interface DashboardStatsResponse {
  stats: DashboardStats
}

interface SalesTrendResponse {
  salesTrend: SalesTrendData[]
}

interface OrderStatusResponse {
  orderStatus: OrderStatusData[]
}

interface TopItemsResponse {
  topItems: TopSellingItem[]
}

interface CategoryRevenueResponse {
  categoryRevenue: CategoryRevenueData[]
}

interface DeliveryTypesResponse {
  deliveryTypes: DeliveryTypeData[]
}

// ============================================
// Data Transformation Helpers
// ============================================

const transformStatsData = (apiData: any): DashboardStats => {
  return {
    totalSales: Number(apiData?.totalSales || 0),
    totalOrders: Number(apiData?.totalOrders || 0),
    newCustomers: Number(apiData?.newCustomers || 0),
    avgOrderValue: Number(apiData?.avgOrderValue || 0),
    salesGrowth: Number(apiData?.salesGrowth || 0),
    ordersGrowth: Number(apiData?.ordersGrowth || 0),
    customersGrowth: Number(apiData?.customersGrowth || 0),
    avgOrderGrowth: Number(apiData?.avgOrderGrowth || 0),
    totalCustomers: Number(apiData?.totalCustomers || 0),
    customersToday: Number(apiData?.customersToday || 0),
    customersMonth: Number(apiData?.customersMonth || 0),
    customersYear: Number(apiData?.customersYear || 0),
  }
}

const transformSalesTrendData = (apiData: any[]): SalesTrendData[] => {
  return (apiData || []).map((item) => ({
    date: item.date,
    sales: Number(item.sales || 0),
    orders: Number(item.orders || 0),
  }))
}

const transformOrderStatusData = (apiData: any[]): OrderStatusData[] => {
  const total = (apiData || []).reduce(
    (sum, item) => sum + Number(item.count || 0),
    0,
  )
  return (apiData || []).map((item) => ({
    status: item.status,
    count: Number(item.count || 0),
    percentage: total > 0 ? (Number(item.count || 0) / total) * 100 : 0,
  }))
}

const transformTopItemsData = (apiData: any[]): TopSellingItem[] => {
  return (apiData || []).map((item) => ({
    itemId: Number(item.itemId || 0),
    name: item.name || '',
    totalQuantity: Number(item.totalQuantity || 0),
    orderCount: Number(item.orderCount || 0),
    totalRevenue: Number(item.totalRevenue || 0),
  }))
}

const transformCategoryRevenueData = (
  apiData: any[],
): CategoryRevenueData[] => {
  return (apiData || []).map((item) => ({
    categoryId: Number(item.categoryId || 0),
    categoryName: item.categoryName || '',
    totalRevenue: Number(item.totalRevenue || 0),
    orderCount: Number(item.orderCount || 0),
  }))
}

const transformDeliveryTypeData = (apiData: any[]): DeliveryTypeData[] => {
  return (apiData || []).map((item) => ({
    type: item.type || '',
    count: Number(item.count || 0),
    totalAmount: Number(item.totalAmount || 0),
  }))
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch dashboard statistics (sales, orders, customers, avg order value)
 */
export function useDashboardStatsQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(params),
    queryFn: async (): Promise<DashboardStats> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<DashboardStatsResponse>(
        '/api/dashboard',
        {
          params: { ...params, endpoint: 'stats' },
        },
      )

      return transformStatsData(response.data.stats)
    },
    enabled: !!params.rid,
    staleTime: 2 * 60 * 1000, // 2 minutes - relatively fresh for real-time metrics
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
  })
}

/**
 * Fetch sales trend data for charts
 */
export function useSalesTrendQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.salesTrend(params),
    queryFn: async (): Promise<SalesTrendData[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<SalesTrendResponse>('/api/dashboard', {
        params: { ...params, endpoint: 'sales-trend' },
      })

      return transformSalesTrendData(response.data.salesTrend)
    },
    enabled: !!params.rid,
    staleTime: 3 * 60 * 1000, // 3 minutes - historical data changes less frequently
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch order status distribution
 */
export function useOrderStatusQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.orderStatus(params),
    queryFn: async (): Promise<OrderStatusData[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<OrderStatusResponse>('/api/dashboard', {
        params: { ...params, endpoint: 'order-status' },
      })

      return transformOrderStatusData(response.data.orderStatus)
    },
    enabled: !!params.rid,
    staleTime: 1 * 60 * 1000, // 1 minute - operational data should be fresh
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch top selling items
 */
export function useTopItemsQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.topItems(params),
    queryFn: async (): Promise<TopSellingItem[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<TopItemsResponse>('/api/dashboard', {
        params: { ...params, endpoint: 'top-items' },
      })

      return transformTopItemsData(response.data.topItems)
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000, // 5 minutes - changes slowly
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch revenue by category
 */
export function useCategoryRevenueQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.categoryRevenue(params),
    queryFn: async (): Promise<CategoryRevenueData[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<CategoryRevenueResponse>(
        '/api/dashboard',
        {
          params: { ...params, endpoint: 'revenue-by-category' },
        },
      )

      return transformCategoryRevenueData(response.data.categoryRevenue)
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000, // 5 minutes - historical analysis
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch payment method distribution
 */

/**
 * Fetch delivery types distribution
 */
export function useDeliveryTypesQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.deliveryTypes(params),
    queryFn: async (): Promise<DeliveryTypeData[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<DeliveryTypesResponse>(
        '/api/dashboard',
        {
          params: { ...params, endpoint: 'delivery-types' },
        },
      )

      return transformDeliveryTypeData(response.data.deliveryTypes)
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch inventory levels
 */
export function useInventoryLevelsQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.inventory(params),
    queryFn: async (): Promise<InventoryLevelsResponse> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<InventoryLevelsResponse>(
        '/api/dashboard',
        {
          params: { ...params, endpoint: 'inventory' },
        },
      )

      return response.data
    },
    enabled: !!params.rid,
    staleTime: 1 * 60 * 1000, // 1 minute - inventory changes frequently
    gcTime: 5 * 60 * 1000,
  })
}

// ============================================
// Customer Insights Hooks
// ============================================

export interface CustomerOrderData {
  userId: number
  customerName: string
  phoneNumber: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  topItems: string
}

interface CustomerOrdersResponse {
  customerOrders: CustomerOrderData[]
}

// ============================================
// Data Transformation Helpers
// ============================================

const transformCustomerOrdersData = (apiData: any[]): CustomerOrderData[] => {
  return (apiData || []).map((item) => ({
    userId: Number(item.userId || 0),
    customerName: item.customerName || '',
    phoneNumber: item.phoneNumber || '',
    totalOrders: Number(item.totalOrders || 0),
    totalSpent: Number(item.totalSpent || 0),
    lastOrderDate: item.lastOrderDate || '',
    topItems: item.topItems || '',
  }))
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch customer orders activity
 */
export function useCustomerOrdersQuery(params: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.customerOrders(params),
    queryFn: async (): Promise<CustomerOrderData[]> => {
      if (!params.rid) throw new Error('Restaurant ID is required')

      const response = await axios.get<CustomerOrdersResponse>(
        '/api/dashboard',
        {
          params: { ...params, endpoint: 'customer-orders' },
        },
      )

      return transformCustomerOrdersData(response.data.customerOrders)
    },
    enabled: !!params.rid,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================
// Utility Hook for Refreshing All Dashboard Data
// ============================================

/**
 * Hook to invalidate all dashboard queries
 * Use this for the refresh button
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.all,
      refetchType: 'active', // Only refetch actively mounted queries
    })
  }
}
