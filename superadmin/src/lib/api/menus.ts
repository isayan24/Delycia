import { createServerFn } from '@tanstack/start'
import { withAuth } from '@/lib/withAuth'

export interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  category_id: number
  category_name: string
  restaurant_id: number
  restaurant_name: string
  is_available: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface MenuFilters {
  page?: number
  limit?: number
  search?: string
  restaurant_id?: string
  category_id?: string
  min_price?: string
  max_price?: string
  availability?: string
}

export const getMenus = createServerFn({ method: 'GET' })
  .validator((data: { data: MenuFilters }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      const params = new URLSearchParams()
      
      if (data.page) params.append('page', data.page.toString())
      if (data.limit) params.append('limit', data.limit.toString())
      if (data.search) params.append('search', data.search)
      if (data.restaurant_id) params.append('restaurant_id', data.restaurant_id)
      if (data.category_id) params.append('category_id', data.category_id)
      if (data.min_price) params.append('min_price', data.min_price)
      if (data.max_price) params.append('max_price', data.max_price)
      if (data.availability) params.append('availability', data.availability)

      return axios.get(`/superadmin/menus?${params.toString()}`)
    })
  })

export const updateMenuItem = createServerFn({ method: 'POST' })
  .validator((data: { id: number; updates: any }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.patch(`/superadmin/menus/items/${data.id}`, data.updates)
    })
  })

export const deleteMenuItem = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.delete(`/superadmin/menus/items/${data.id}`)
    })
  })

export const createMenuCategory = createServerFn({ method: 'POST' })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.post('/superadmin/menus/categories', data)
    })
  })

export const bulkUpdateMenuItems = createServerFn({ method: 'POST' })
  .validator((data: { items: any[] }) => data)
  .handler(async ({ data }) => {
    return withAuth(async (axios) => {
      return axios.patch('/superadmin/menus/bulk', data)
    })
  })
