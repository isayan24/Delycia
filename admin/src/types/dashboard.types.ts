export interface DashboardStats {
  totalSales: number
  totalOrders: number
  newCustomers: number
  avgOrderValue: number
  salesGrowth: number
  ordersGrowth: number
  customersGrowth: number
  avgOrderGrowth: number
  totalCustomers: number
  customersToday: number
  customersMonth: number
  customersYear: number
}

export interface SalesTrendData {
  date: string
  sales: number
  orders: number
}

export interface OrderStatusData {
  status: string
  count: number
  percentage: number
}

export interface TopSellingItem {
  itemId: number
  name: string
  totalQuantity: number
  orderCount: number
  totalRevenue: number
}

export interface CategoryRevenueData {
  categoryId: number
  categoryName: string
  totalRevenue: number
  orderCount: number
}

export interface DeliveryTypeData {
  type: string
  count: number
  totalAmount: number
}

export interface DashboardData {
  stats: DashboardStats
  salesTrend: SalesTrendData[]
  orderStatus: OrderStatusData[]
  topItems: TopSellingItem[]
  categoryRevenue: CategoryRevenueData[]

  deliveryTypes: DeliveryTypeData[]
}

export interface DashboardApiParams {
  rid: string
  startDate: string
  endDate: string
}

export interface UseDashboardDataReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export interface LoyaltyData {
  customer_segment: 'New' | 'Regular' | 'Loyal' | 'VIP'
  count: number
}

export interface ChurnRiskData {
  user_id: number
  visit_count: number
  last_visit_at: string
  days_since_last_visit: number
}

export interface RetentionData {
  avgDaysBetweenVisits: string
  returningCustomers: number
}

export interface InventoryItem {
  id: number
  name: string
  stock: number
  status: string
  stockLevel: 'critical' | 'low' | 'medium' | 'good'
}

export interface InventorySummary {
  critical: number
  low: number
  medium: number
  good: number
  total: number
}

export interface InventoryLevelsResponse {
  inventory: InventoryItem[]
  inventoryByLevel: Record<string, InventoryItem[]>
  summary: InventorySummary
}
