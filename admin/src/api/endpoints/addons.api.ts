/**
 * Addons API Module
 * Centralized API calls for addon management
 *
 * All addon-related HTTP requests go through TanStack Start server routes
 * for secure httpOnly cookie authentication.
 */

import axios from 'axios'
import type {
  Addon,
  FetchAddonsParams,
  CreateAddonParams,
  UpdateAddonParams,
  LinkAddonsToItemParams,
  UnlinkAddonsFromItemParams,
  LinkAddonsToOrderParams,
  DeleteAddonParams,
  ApiResponse,
} from '../types/addons.types'

/**
 * Base configuration for addon API calls
 * Calls TanStack Start server route which handles authentication via httpOnly cookies
 */
const ADDON_BASE_PATH = '/api/addons' // TanStack Start server route

/**
 * GET /api/addons
 * Fetch all addons with optional filters
 */
export async function fetchAddons(params: FetchAddonsParams): Promise<Addon[]> {
  try {
    const { addon_id, rid, is_active, id } = params

    // Build query parameters
    const queryParams: Record<string, string> = {}
    if (rid) queryParams.rid = rid
    if (is_active !== undefined) queryParams.is_active = String(is_active)
    if (id) queryParams.id = String(id)
    if (addon_id) queryParams.addon_id = String(addon_id)

    const response = await axios.get<any>(ADDON_BASE_PATH, {
      params: queryParams,
      withCredentials: true, // Send httpOnly cookies
    })

    const data: any = response.data?.addons
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching addons:', error)
    throw error
  }
}

/**
 * GET /api/addons/inventory/:inventory_id
 * Fetch addons linked to a specific inventory item
 */
export async function fetchAddonsByInventoryId(
  inventoryId: string,
): Promise<Addon[]> {
  try {
    const response = await axios.get<Addon[]>(
      `${ADDON_BASE_PATH}/inventory/${inventoryId}`,
      { withCredentials: true },
    )

    return response.data
  } catch (error) {
    console.error('Error fetching addons by inventory ID:', error)
    throw error
  }
}

/**
 * POST /api/addons
 * Create a new addon
 */
export async function createAddon(
  params: CreateAddonParams | any,
): Promise<Addon> {
  try {
    const response = await axios.post<Addon>(ADDON_BASE_PATH, params, {
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    console.error('Error creating addon:', error)
    throw error
  }
}

/**
 * PATCH /api/addons
 * Update an existing addon
 */
export async function updateAddon(params: UpdateAddonParams): Promise<Addon> {
  try {
    const response = await axios.patch<Addon>(ADDON_BASE_PATH, params, {
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    console.error('Error updating addon:', error)
    throw error
  }
}

/**
 * DELETE /api/addons
 * Delete an addon
 */
export async function deleteAddon(params: DeleteAddonParams): Promise<void> {
  try {
    await axios.delete(ADDON_BASE_PATH, {
      data: params,
      withCredentials: true,
    })
  } catch (error) {
    console.error('Error deleting addon:', error)
    throw error
  }
}

/**
 * POST /api/addons?action=link-item
 * Link addons to an inventory item
 */
export async function linkAddonsToItem(
  params: LinkAddonsToItemParams,
): Promise<void> {
  try {
    await axios.post(`${ADDON_BASE_PATH}?action=link-item`, params, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Error linking addons to item:', error)
    throw error
  }
}

/**
 * POST /api/addons?action=unlink-item
 * Unlink addons from an inventory item
 */
export async function unlinkAddonsFromItem(
  params: UnlinkAddonsFromItemParams,
): Promise<void> {
  try {
    await axios.post(`${ADDON_BASE_PATH}?action=unlink-item`, params, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Error unlinking addons from item:', error)
    throw error
  }
}

/**
 * POST /api/addons?action=link-order
 * Link addons to an order
 */
export async function linkAddonsToOrder(
  params: LinkAddonsToOrderParams,
): Promise<void> {
  try {
    await axios.post(`${ADDON_BASE_PATH}?action=link-order`, params, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Error linking addons to order:', error)
    throw error
  }
}
