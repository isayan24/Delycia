import { useState, useCallback } from 'react'
import * as addonsApi from '@/api/endpoints/addons.api'
import type {
  Addon,
  CreateAddonParams,
  UpdateAddonParams,
} from '@/api/types/addons.types'
import useToast from '@/hooks/UseToast'

/**
 * Custom hook for managing addon CRUD operations
 * Handles state, API calls, and user feedback via toasts
 */
export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { showSuccess, showError } = useToast()

  /**
   * Fetch all addons with optional filters
   * Uses httpOnly cookies automatically - no token needed
   */
  const fetchAddons = useCallback(
    async (params = {}) => {
      setLoading(true)
      setError(null)

      try {
        const data = await addonsApi.fetchAddons(params)
        setAddons(data)
        return data
      } catch (err) {
        const error = err as Error
        setError(error)
        showError('Failed to fetch addons', error.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [showError],
  )

  /**
   * Create a new addon
   * Uses httpOnly cookies automatically
   */
  const createAddon = useCallback(
    async (params: CreateAddonParams) => {
      try {
        console.log(params, 'params')

        const newAddon = await addonsApi.createAddon(params)
        setAddons((prev) => [...prev, newAddon])
        showSuccess(
          'Addon created',
          `${params.name} has been added successfully`,
        )
        return newAddon
      } catch (err) {
        const error = err as Error
        showError('Failed to create addon', error.message)
        throw err
      }
    },
    [showSuccess, showError],
  )

  /**
   * Update an existing addon
   */
  const updateAddon = useCallback(
    async (
      id: string,
      rid: string | undefined,
      updates: Omit<UpdateAddonParams, 'id' | 'rid'>,
    ) => {
      try {
        const updatedAddon = await addonsApi.updateAddon({
          id,
          rid,
          ...updates,
        })
        setAddons((prev) =>
          prev.map((addon) => (addon.id === id ? updatedAddon : addon)),
        )

        showSuccess('Addon updated', 'Changes saved successfully')
        return updatedAddon
      } catch (err) {
        const error = err as Error
        showError('Failed to update addon', error.message)
        throw err
      }
    },
    [showSuccess, showError],
  )

  /**
   * Delete an addon
   */
  const deleteAddon = useCallback(
    async (addonId: string, rid: string | undefined) => {
      try {
        await addonsApi.deleteAddon({ id: addonId, rid })
        setAddons((prev) => prev.filter((addon) => addon.id !== addonId))
        showSuccess('Addon deleted', 'Addon removed successfully')
      } catch (err) {
        const error = err as Error
        showError('Failed to delete addon', error.message)
        throw err
      }
    },
    [showSuccess, showError],
  )

  /**
   * Bulk delete addons
   * Processes deletions sequentially with error handling
   */
  const bulkDelete = useCallback(
    async (addonIds: string[], rid: string | undefined) => {
      const results = {
        success: [] as string[],
        failed: [] as string[],
      }

      for (const addonId of addonIds) {
        try {
          await addonsApi.deleteAddon({ id: addonId, rid })
          results.success.push(addonId)
        } catch (err) {
          results.failed.push(addonId)
          console.error(`Failed to delete addon ${addonId}:`, err)
        }
      }

      // Update state with successfully deleted addons
      if (results.success.length > 0) {
        setAddons((prev) =>
          prev.filter((addon) => !results.success.includes(addon.id)),
        )
      }

      // Show appropriate toast
      if (results.failed.length === 0) {
        showSuccess(
          'Bulk delete complete',
          `${results.success.length} addon(s) deleted`,
        )
      } else if (results.success.length === 0) {
        showError(
          'Bulk delete failed',
          `Failed to delete ${results.failed.length} addon(s)`,
        )
      }

      return results
    },
    [showSuccess, showError],
  )

  /**
   * Bulk update addons (activate/deactivate)
   */
  const bulkUpdate = useCallback(
    async (
      addonIds: string[],
      rid: string | undefined,
      updates: Partial<Omit<UpdateAddonParams, 'addon_id'>>,
    ) => {
      const results = {
        success: [] as string[],
        failed: [] as string[],
      }

      for (const addonId of addonIds) {
        try {
          await addonsApi.updateAddon({ id: addonId, rid, ...updates })
          results.success.push(addonId)
        } catch (err) {
          results.failed.push(addonId)
          console.error(`Failed to update addon ${addonId}:`, err)
        }
      }

      // Update state with successfully updated addons
      if (results.success.length > 0) {
        setAddons((prev) =>
          prev.map((addon) =>
            results.success.includes(addon.id)
              ? { ...addon, ...updates }
              : addon,
          ),
        )
      }

      // Show appropriate toast
      if (results.failed.length === 0) {
        showSuccess(
          'Bulk update complete',
          `${results.success.length} addon(s) updated`,
        )
      } else if (results.success.length === 0) {
        showError(
          'Bulk update failed',
          `Failed to update ${results.failed.length} addon(s)`,
        )
      }

      return results
    },
    [showSuccess, showError],
  )

  /**
   * Link addons to an inventory item
   */
  const linkToItem = useCallback(
    async (inventoryIds: string[], addonId: string) => {
      try {
        await addonsApi.linkAddonsToItem({
          inventory_ids: inventoryIds,
          addon_id: addonId,
        })

        showSuccess(
          'Addons linked',
          `${inventoryIds.length} addon(s) linked to item`,
        )
      } catch (err) {
        const error = err as Error
        showError('Failed to link addons', error.message)
        throw err
      }
    },
    [showSuccess, showError],
  )

  /**
   * Unlink addons from an inventory item
   */
  const unlinkFromItem = useCallback(
    async (inventoryId: string, addonIds: string[]) => {
      try {
        await addonsApi.unlinkAddonsFromItem({
          inventory_id: inventoryId,
          addon_ids: addonIds,
        })

        showSuccess(
          'Addons unlinked',
          `${addonIds.length} addon(s) unlinked from item`,
        )
      } catch (err) {
        const error = err as Error
        showError('Failed to unlink addons', error.message)
        throw err
      }
    },
    [showSuccess, showError],
  )

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
  }
}
