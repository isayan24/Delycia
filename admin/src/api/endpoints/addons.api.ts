/**
 * Addons API Module
 * Centralized API calls for addon management
 *
 * All addon-related HTTP requests should go through this module
 * for consistency, maintainability, and testability.
 */

import axiosInstance from "@/lib/axios";
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
} from "../types/addons.types";

/**
 * Base configuration for addon API calls
 *
 * NOTE: This calls the Express backend directly (/admin/addons)
 * because addons are simple CRUD operations that don't require:
 * - Server-side secrets (like ImageKit)
 * - Complex business logic (like variants)
 * - Data aggregation/transformation
 *
 * If you need to add business logic later, create /app/api/addons/route.ts
 * and change this path to "/api/addons" to route through Next.js API layer.
 */
const ADDON_BASE_PATH = "/admin/addons"; // Express backend route

/**
 * Helper to get authorization headers
 */
const getAuthHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

/**
 * GET /admin/addons
 * Fetch all addons with optional filters
 */
export async function fetchAddons(
  params: FetchAddonsParams,
  accessToken: string
): Promise<Addon[]> {
  try {
    const { addon_id, rid, is_active, id } = params;

    let endpoint = ADDON_BASE_PATH;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (rid) queryParams.append("rid", rid);
    if (is_active !== undefined)
      queryParams.append("is_active", String(is_active));
    if (id) queryParams.append("id", String(id));
    if (addon_id) queryParams.append("addon_id", String(addon_id));

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint = `${endpoint}?${queryString}`;
    }
    console.log("endpoint", endpoint);
    const response = await axiosInstance.get<any>(endpoint, {
      headers: getAuthHeaders(accessToken),
    });

    const data: any = response.data?.addons;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching addons:", error);
    throw error;
  }
}

/**
 * GET /admin/addons/inventory/:inventory_id
 * Fetch addons linked to a specific inventory item
 */
export async function fetchAddonsByInventoryId(
  inventoryId: string,
  accessToken: string
): Promise<Addon[]> {
  try {
    const response = await axiosInstance.get<Addon[]>(
      `${ADDON_BASE_PATH}/inventory/${inventoryId}`,
      {
        headers: getAuthHeaders(accessToken),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching addons by inventory ID:", error);
    throw error;
  }
}

/**
 * POST /admin/addons
 * Create a new addon
 */
export async function createAddon(
  params: CreateAddonParams | any,
  accessToken: string
): Promise<Addon> {
  try {
    const response = await axiosInstance.post<Addon>(ADDON_BASE_PATH, params, {
      headers: getAuthHeaders(accessToken),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating addon:", error);
    throw error;
  }
}

/**
 * PATCH /admin/addons
 * Update an existing addon
 */
export async function updateAddon(
  params: UpdateAddonParams,
  accessToken: string
): Promise<Addon> {
  try {
    console.log(params, "params");
    const response = await axiosInstance.patch<Addon>(ADDON_BASE_PATH, params, {
      headers: getAuthHeaders(accessToken),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating addon:", error);
    throw error;
  }
}

/**
 * DELETE /admin/addons
 * Delete an addon
 */
export async function deleteAddon(
  params: DeleteAddonParams,
  accessToken: string
): Promise<void> {
  try {
    await axiosInstance.delete(ADDON_BASE_PATH, {
      headers: getAuthHeaders(accessToken),
      data: params,
    });
  } catch (error) {
    console.error("Error deleting addon:", error);
    throw error;
  }
}

/**
 * POST /admin/addons/link-item
 * Link addons to an inventory item
 */
export async function linkAddonsToItem(
  params: LinkAddonsToItemParams,
  accessToken: string
): Promise<void> {
  try {
    await axiosInstance.post(`${ADDON_BASE_PATH}/link-item`, params, {
      headers: getAuthHeaders(accessToken),
    });
  } catch (error) {
    console.error("Error linking addons to item:", error);
    throw error;
  }
}

/**
 * POST /admin/addons/unlink-item
 * Unlink addons from an inventory item
 */
export async function unlinkAddonsFromItem(
  params: UnlinkAddonsFromItemParams,
  accessToken: string
): Promise<void> {
  try {
    await axiosInstance.post(`${ADDON_BASE_PATH}/unlink-item`, params, {
      headers: getAuthHeaders(accessToken),
    });
  } catch (error) {
    console.error("Error unlinking addons from item:", error);
    throw error;
  }
}

/**
 * POST /admin/addons/link-order
 * Link addons to an order
 */
export async function linkAddonsToOrder(
  params: LinkAddonsToOrderParams,
  accessToken: string
): Promise<void> {
  try {
    await axiosInstance.post(`${ADDON_BASE_PATH}/link-order`, params, {
      headers: getAuthHeaders(accessToken),
    });
  } catch (error) {
    console.error("Error linking addons to order:", error);
    throw error;
  }
}
