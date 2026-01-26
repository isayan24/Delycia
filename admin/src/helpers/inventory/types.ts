export interface InventoryItem {
  rid?: any
  id?: number
  name: string
  description: string
  categoryId: number
  images: string[]
  isVeg: boolean
  cost: number
  price: number
  stock: number
  status: string
  variants?: Array<{
    id?: number
    name: string
    price: number
  }>
}

export interface ApiPayload {
  rid?: number
  id?: number
  name?: string
  description?: string
  category_id: number
  images?: string
  is_veg?: boolean
  status?: string
  stock?: number
  price: number
  cost: number
}

// Type definitions for bulk items
export interface BulkItem {
  name: string
  description: string
  images: string[]
  price: number
  cost: number
  stock: number
  variants?: Array<{ name: string; price: number }>
}

export interface BulkInventoryRequest {
  rid: number
  category_id: number
  is_veg: number
  items: BulkItem[]
  token: string
  variants: Array<{ name: string; price: number }>
}
