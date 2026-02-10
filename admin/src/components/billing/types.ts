export interface BillItem {
  name: string
  quantity: number
  price: number
  variant_name?: string | null
  addons?: BillAddon[]
}

export interface BillAddon {
  name: string
  quantity: number
  price: number
}

export interface BillData {
  orderId: string
  restaurantName: string
  tableNo: string | number
  tableZone?: string
  customerName: string
  customerPhone: string
  items: BillItem[]
  totalAmount: number
  discountAmount?: number
  orderDate: string
  paymentMethod: string
  paymentStatus: string
  rid?: number
}

export interface TaxBreakdown {
  subtotal: number
  taxAmount: number
  totalAmount: number
  taxPercent: number
}
