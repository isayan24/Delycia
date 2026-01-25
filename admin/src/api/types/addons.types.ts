/**
 * Addon Domain Types
 * Centralized type definitions for addon-related API operations
 */

export interface Addon {
  id: string
  name: string
  price: number
  is_active: number
  rid: string | undefined
  created_at?: string
  updated_at?: string
  linked_items_count?: number
  [key: string]: any // Allow additional properties
}

export interface FetchAddonsParams {
  rid?: string | undefined
  addon_id?: string
  is_active?: number
  id?: string
}

export interface CreateAddonParams {
  rid: string | undefined
  name: string
  price: number
  is_active?: number
}

export interface UpdateAddonParams {
  id: string
  addon_name?: string
  addon_price?: number
  is_active?: number
  rid: string | undefined
}

export interface LinkAddonsToItemParams {
  inventory_ids: string[]
  addon_id: string
}

export interface UnlinkAddonsFromItemParams {
  inventory_id: string
  addon_ids: string[]
}

export interface LinkAddonsToOrderParams {
  order_id: string
  addon_id: string
}

export interface DeleteAddonParams {
  id: string
  rid: string | undefined
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  error?: string
  statusCode?: number
}
