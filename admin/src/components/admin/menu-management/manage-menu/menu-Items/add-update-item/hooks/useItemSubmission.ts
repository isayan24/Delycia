import { useTransition } from 'react'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useAuth } from '@/hooks/useAuth'
import type { BulkItemEntry } from './useItemFormState'
import type { Variant } from '../../variants/types/variant.types'

interface SubmitSingleItemParams {
  formData: {
    name: string
    description: string
    category_id: number
    is_veg: number
    price: number
    cost: number
    stock: number
  }
  imageLinks: string[]
  itemVariants: Variant[]
  rid?: number
}

interface SubmitBulkItemsParams {
  bulkItems: BulkItemEntry[]
  formData: {
    category_id: number
    is_veg: number
  }
  uploadBulkItemImages: (images: any[]) => Promise<string[]>
  rid?: number
}

/**
 * Custom hook for handling form submission (single and bulk modes)
 */
export const useItemSubmission = (
  onSuccess: () => void,
  refetch: () => void,
  // ✅ Removed refreshCategories - not needed
) => {
  const [isPending, startTransition] = useTransition()
  const { showError, showSuccess } = useToast()
  const { user } = useAuth()

  /**
   * Submit a single item
   */
  const submitSingleItem = async (params: SubmitSingleItemParams) => {
    const { formData, imageLinks, itemVariants, rid } = params

    startTransition(async () => {
      try {
        const data = {
          rid: rid || user?.selected_rid,
          name: formData.name,
          description: formData.description,
          categoryId: formData.category_id,
          images: imageLinks,
          isVeg: formData.is_veg,
          stock: formData.stock,
          price: formData.price,
          cost: formData.cost,
          status: 'available',
          variants: itemVariants.map((variant) => ({
            name: variant.name,
            price: parseInt(variant.price as any) || 0,
          })),
        }

        await axios.post(`/api/inventory`, data)

        showSuccess(
          'Successfully!',
          'Food item and variants added successfully!',
        )
        refetch()
        onSuccess()
        // ✅ Removed refreshCategories call - cache auto-updates
      } catch (err: any) {
        console.error('Error submitting single item:', err)
        showError('Error', err.response?.data?.message || 'Error saving item')
      }
    })
  }

  /**
   * Submit bulk items
   */
  const submitBulkItems = async (params: SubmitBulkItemsParams) => {
    const { bulkItems, formData, uploadBulkItemImages, rid } = params

    startTransition(async () => {
      try {
        // Upload images for all bulk items
        const itemsWithImages = await Promise.all(
          bulkItems.map(async (item) => {
            const imageLinks = await uploadBulkItemImages(item.images)
            return {
              name: item.name,
              description: item.description,
              images: imageLinks,
              price: item.price,
              cost: item.cost,
              stock: item.stock,
              variants: item.variants.map((variant) => ({
                name: variant.name,
                price: parseInt(variant.price as any) || 0,
              })),
            }
          }),
        )

        const data = {
          rid: rid || user?.selected_rid,
          category_id: formData.category_id,
          is_veg: formData.is_veg,
          items: itemsWithImages,
        }
        console.log(data, 'data to be sent \n\n\n\n\n')
        const response = await axios.post(`/api/inventory/bulk`, data)

        const { inserted = 0, failed = 0 } = response.data

        if (inserted > 0) {
          showSuccess(
            'Success!',
            `${inserted} item(s) added successfully!${failed > 0 ? ` (${failed} failed)` : ''}`,
          )
          refetch()
          onSuccess()
          // ✅ Removed refreshCategories call - cache auto-updates
        } else {
          showError('Error', 'All items failed to add. Please try again.')
        }
      } catch (err: any) {
        console.error('Error submitting bulk items:', err)
        showError('Error', err.response?.data?.message || 'Error saving items')
      }
    })
  }

  return {
    isPending,
    submitSingleItem,
    submitBulkItems,
  }
}
