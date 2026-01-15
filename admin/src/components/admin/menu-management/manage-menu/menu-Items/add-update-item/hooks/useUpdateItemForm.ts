import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChangeTracking } from '@/hooks/useChangeTracking'
import axiosInstance from '@/lib/axios'
import type { FormData, ItemImage, Errors } from '../../types/addItemModal'
import type { Variant } from '../../variants/types/variant.types'

interface CurrentFoodItem {
  id?: number
  rid?: number
  name?: string
  description?: string
  is_veg?: number
  category_id?: number
  discount?: number
  stock?: number
  price?: number
  cost?: number
  status?: string
  images?: string[]
  img?: string
}

/**
 * Custom hook for managing update item form state
 * Handles initial data loading, variant fetching, and change tracking
 */
export const useUpdateItemForm = (
  currentFoodItem: CurrentFoodItem | null,
  open: boolean,
  categoryId: number,
) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    foodType: 'Veg',
    category_id: categoryId,
    is_veg: 0,
    discount: 0,
    stock: 100,
    price: 0,
    cost: 0,
  })

  const [itemImages, setItemImages] = useState<ItemImage[]>([])
  const [itemVariants, setItemVariants] = useState<Variant[]>([])
  const [existingVariants, setExistingVariants] = useState<Variant[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState<boolean>(false)

  // Initialize change tracking
  const {
    initialState,
    detectChanges,
    buildSelectivePayload,
    hasInitialState,
  } = useChangeTracking(
    currentFoodItem,
    open,
    formData,
    itemImages,
    itemVariants,
  )

  // Fetch existing variants when modal opens
  useEffect(() => {
    const fetchVariants = async () => {
      if (currentFoodItem?.id && open) {
        setIsLoadingVariants(true)
        try {
          const response = await axiosInstance.get(
            `/variants?inventory_id=${currentFoodItem.id}`,
          )

          if (response.data) {
            const fetchedVariants = response.data.variants.map((v: any) => ({
              id:
                v.id?.toString() ||
                Date.now().toString() +
                  Math.random().toString().substring(2, 5),
              name: v.name || '',
              price: v.price?.toString() || '0',
            }))

            setExistingVariants(fetchedVariants)
            setItemVariants(fetchedVariants)
          }
        } catch (error) {
          console.error('Error fetching variants:', error)
        } finally {
          setIsLoadingVariants(false)
        }
      }
    }

    fetchVariants()
  }, [currentFoodItem?.id, open])

  // Set default values when currentFoodItem is available
  useEffect(() => {
    if (currentFoodItem && open) {
      setFormData({
        name: currentFoodItem.name || '',
        description: currentFoodItem.description || '',
        foodType: currentFoodItem.is_veg ? 'Veg' : 'Non-Veg',
        category_id: currentFoodItem.category_id || categoryId,
        is_veg: (currentFoodItem.is_veg !== undefined
          ? currentFoodItem.is_veg
          : 1) as 0 | 1,
        discount: currentFoodItem.discount || 0,
        stock: currentFoodItem?.stock || 100,
        price: currentFoodItem.price || 0,
        cost: currentFoodItem.cost || 0,
      })

      // Set existing images
      if (currentFoodItem?.images && currentFoodItem?.images.length > 0) {
        setItemImages(
          currentFoodItem?.images?.map((img: string) => ({
            id:
              Date.now().toString() + Math.random().toString().substring(2, 5),
            image: img,
            previewImage: img,
            base64Data: null,
          })),
        )
      } else if (currentFoodItem.img) {
        setItemImages([
          {
            id: Date.now().toString(),
            image: currentFoodItem.img,
            previewImage: currentFoodItem.img,
            base64Data: null,
          },
        ])
      }
    }
  }, [currentFoodItem, open, categoryId])

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        foodType: 'Veg',
        category_id: categoryId,
        is_veg: 0,
        discount: 0,
        stock: 100,
        price: 0,
        cost: 0,
      })
      setItemImages([])
      setItemVariants([])
      setExistingVariants([])
    }
  }, [open, categoryId])

  return {
    formData,
    setFormData,
    itemImages,
    setItemImages,
    itemVariants,
    setItemVariants,
    existingVariants,
    isLoadingVariants,
    initialState,
    detectChanges,
    buildSelectivePayload,
    hasInitialState,
  }
}
