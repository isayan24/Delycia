import { useState, useEffect } from 'react'
import { useChangeTracking } from '@/hooks/useChangeTracking'
import { useInventoryVariantsQuery } from '@/hooks/queries/useInventoryQuery'
import { FormData, ItemImage } from '../../types/addItemModal'
import { Variant } from '../../variants/types/variant.types'

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
    existingVariants,
  )

  // Fetch existing variants when modal opens
  const { data: variantsData, isLoading: isVariantsQueryLoading } =
    useInventoryVariantsQuery(currentFoodItem?.id?.toString(), open)

  // Sync fetched variants to local state
  useEffect(() => {
    if (variantsData && open) {
      const formattedVariants = variantsData.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price.toString(),
      }))

      setExistingVariants(formattedVariants)
      // Only set item variants if we haven't started editing or if it's the initial load
      // Ideally query syncs only once or when data changes from server and we want to refresh
      // For now, simpler approach: if local state is empty and we have data, set it.
      // But careful about re-fetching overwriting user edits.
      // Since existingVariants is for tracking changes, we should update it.
      // We set itemVariants only if we are initializing.
      setItemVariants((prev) => (prev.length === 0 ? formattedVariants : prev))
      setIsLoadingVariants(false)
    }
  }, [variantsData, open])

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
