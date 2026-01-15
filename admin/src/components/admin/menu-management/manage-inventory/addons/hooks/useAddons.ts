import { useState, useCallback } from "react";
import * as addonsApi from "@/api/endpoints/addons.api";
import type {
  Addon,
  CreateAddonParams,
  UpdateAddonParams,
} from "@/api/types/addons.types";
import useToast from "@/hooks/UseToast";
import { useAuth } from "@/hooks/useAuth";

/**
 * Custom hook for managing addon CRUD operations
 * Handles state, API calls, and user feedback via toasts
 */
export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { showSuccess, showError } = useToast();
  const { getValidAccessToken } = useAuth();

  /**
   * Fetch all addons with optional filters
   */
  const fetchAddons = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        const data = await addonsApi.fetchAddons(params, accessToken);
        setAddons(data);
        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        showError("Failed to fetch addons", error.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getValidAccessToken, showError]
  );

  /**
   * Create a new addon
   */
  const createAddon = useCallback(
    async (params: CreateAddonParams) => {
      try {
        console.log(params, "params");
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        const newAddon = await addonsApi.createAddon(params, accessToken);
        setAddons((prev) => [...prev, newAddon]);
        showSuccess(
          "Addon created",
          `${params.name} has been added successfully`
        );
        return newAddon;
      } catch (err) {
        const error = err as Error;
        showError("Failed to create addon", error.message);
        throw err;
      }
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Update an existing addon
   */
  const updateAddon = useCallback(
    async (
      id: string,
      rid: string,
      updates: Omit<UpdateAddonParams, "id" | "rid">
    ) => {
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        const updatedAddon = await addonsApi.updateAddon(
          { id, rid, ...updates },
          accessToken
        );
        setAddons((prev) =>
          prev.map((addon) => (addon.id === id ? updatedAddon : addon))
        );

        showSuccess("Addon updated", "Changes saved successfully");
        return updatedAddon;
      } catch (err) {
        const error = err as Error;
        showError("Failed to update addon", error.message);
        throw err;
      }
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Delete an addon
   */
  const deleteAddon = useCallback(
    async (addonId: string, rid: string) => {
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        await addonsApi.deleteAddon({ id: addonId, rid }, accessToken);
        setAddons((prev) => prev.filter((addon) => addon.id !== addonId));
        showSuccess("Addon deleted", "Addon removed successfully");
      } catch (err) {
        const error = err as Error;
        showError("Failed to delete addon", error.message);
        throw err;
      }
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Bulk delete addons
   * Processes deletions sequentially with error handling
   */
  const bulkDelete = useCallback(
    async (addonIds: string[], rid: string) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const results = {
        success: [] as string[],
        failed: [] as string[],
      };

      for (const addonId of addonIds) {
        try {
          await addonsApi.deleteAddon({ id: addonId, rid }, accessToken);
          results.success.push(addonId);
        } catch (err) {
          results.failed.push(addonId);
          console.error(`Failed to delete addon ${addonId}:`, err);
        }
      }

      // Update state with successfully deleted addons
      if (results.success.length > 0) {
        setAddons((prev) =>
          prev.filter((addon) => !results.success.includes(addon.id))
        );
      }

      // Show appropriate toast
      if (results.failed.length === 0) {
        showSuccess(
          "Bulk delete complete",
          `${results.success.length} addon(s) deleted`
        );
      } else if (results.success.length === 0) {
        showError(
          "Bulk delete failed",
          `Failed to delete ${results.failed.length} addon(s)`
        );
      }

      return results;
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Bulk update addons (activate/deactivate)
   */
  const bulkUpdate = useCallback(
    async (
      addonIds: string[],
      rid: string,
      updates: Partial<Omit<UpdateAddonParams, "addon_id">>
    ) => {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const results = {
        success: [] as string[],
        failed: [] as string[],
      };

      for (const addonId of addonIds) {
        try {
          await addonsApi.updateAddon(
            { id: addonId, rid, ...updates },
            accessToken
          );
          results.success.push(addonId);
        } catch (err) {
          results.failed.push(addonId);
          console.error(`Failed to update addon ${addonId}:`, err);
        }
      }

      // Update state with successfully updated addons
      if (results.success.length > 0) {
        setAddons((prev) =>
          prev.map((addon) =>
            results.success.includes(addon.id)
              ? { ...addon, ...updates }
              : addon
          )
        );
      }

      // Show appropriate toast
      if (results.failed.length === 0) {
        showSuccess(
          "Bulk update complete",
          `${results.success.length} addon(s) updated`
        );
      } else if (results.success.length === 0) {
        showError(
          "Bulk update failed",
          `Failed to update ${results.failed.length} addon(s)`
        );
      }

      return results;
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Link addons to an inventory item
   */
  const linkToItem = useCallback(
    async (inventoryIds: string[], addonId: string) => {
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        await addonsApi.linkAddonsToItem(
          { inventory_ids: inventoryIds, addon_id: addonId },
          accessToken
        );

        showSuccess(
          "Addons linked",
          `${inventoryIds.length} addon(s) linked to item`
        );
      } catch (err) {
        const error = err as Error;
        showError("Failed to link addons", error.message);
        throw err;
      }
    },
    [getValidAccessToken, showSuccess, showError]
  );

  /**
   * Unlink addons from an inventory item
   */
  const unlinkFromItem = useCallback(
    async (inventoryId: string, addonIds: string[]) => {
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("No access token available");
        }

        await addonsApi.unlinkAddonsFromItem(
          { inventory_id: inventoryId, addon_ids: addonIds },
          accessToken
        );

        showSuccess(
          "Addons unlinked",
          `${addonIds.length} addon(s) unlinked from item`
        );
      } catch (err) {
        const error = err as Error;
        showError("Failed to unlink addons", error.message);
        throw err;
      }
    },
    [getValidAccessToken, showSuccess, showError]
  );

  return {
    addons,
    loading,
    error,
    fetchAddons,
    createAddon,
    updateAddon,
    deleteAddon,
    bulkDelete,
    bulkUpdate,
    linkToItem,
    unlinkFromItem,
  };
}
