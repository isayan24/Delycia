import axiosInstance from '@/lib/axios'
import { VariantPayload } from './types'

// Helper function to create variants
export const createVariants = async (
  inventoryId: number,
  variants: Array<{ name: string; price: number }>,
  accessToken: string,
): Promise<void> => {
  if (!variants || variants.length === 0) return

  const variantPromises = variants.map(async (variant) => {
    const variantPayload: VariantPayload = {
      inventory_id: inventoryId,
      name: variant.name,
      price: variant.price,
    }

    return axiosInstance.post('/admin/variants', variantPayload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  })

  await Promise.all(variantPromises)
}

// Helper function to update variants
export const updateVariants = async (
  inventoryId: number,
  variants: Array<{ id?: number; name: string; price: number }>,
  accessToken: string,
): Promise<void> => {
  if (!variants || variants.length === 0) return

  // First, fetch existing variants to determine which ones to delete
  try {
    const existingVariantsResponse = await axiosInstance.get(
      `/variants?inventory_id=${inventoryId}`,
    )

    const existingVariants = existingVariantsResponse.data?.data || []
    const newVariantIds = variants.filter((v) => v.id).map((v) => v.id)

    // Delete variants that are no longer in the updated list
    const variantsToDelete = existingVariants.filter(
      (existing: any) => !newVariantIds.includes(existing.id),
    )

    if (variantsToDelete.length > 0) {
      const deletePromises = variantsToDelete.map((variant: any) =>
        axiosInstance.delete('/admin/variants', {
          data: { id: variant.id },
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      )
      await Promise.all(deletePromises)
    }
  } catch (error) {
    console.error('Error fetching existing variants:', error)
    // Continue with update process even if fetching existing variants fails
  }

  // Process each variant (update existing or create new)
  const variantPromises = variants.map(async (variant) => {
    if (variant.id) {
      // Update existing variant
      const variantPayload: any = {
        id: variant.id,
        // inventory_id: inventoryId,
        name: variant.name,
        price: variant.price,
      }

      return axiosInstance.patch('/admin/variants', variantPayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } else {
      // Create new variant
      const variantPayload: VariantPayload = {
        inventory_id: inventoryId,
        name: variant.name,
        price: variant.price,
      }

      return axiosInstance.post('/admin/variants', variantPayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    }
  })

  await Promise.all(variantPromises)
}

export const deleteAllVariants = async (
  inventoryId: number,
  accessToken: string,
): Promise<void> => {
  try {
    // First fetch all variants for this inventory item
    const existingVariantsResponse = await axiosInstance.get(
      `/admin/variants?inventory_id=${inventoryId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    const existingVariants = existingVariantsResponse.data?.data || []

    if (existingVariants.length > 0) {
      const deletePromises = existingVariants.map((variant: any) =>
        axiosInstance.delete('/admin/variants', {
          data: { id: variant.id },
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      )

      await Promise.all(deletePromises)
    }
  } catch (error) {
    console.error('Error deleting variants:', error)
    // Don't throw error here as the main inventory deletion should still proceed
  }
}
