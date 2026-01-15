export interface DashboardStats {
  totalSales: number
  totalOrders: number
  newCustomers: number
  avgOrderValue: number
  salesGrowth: number
  ordersGrowth: number
  customersGrowth: number
  avgOrderGrowth: number
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

export interface PaymentMethodData {
  type: string
  count: number
  totalAmount: number
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
  paymentMethods: PaymentMethodData[]
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
