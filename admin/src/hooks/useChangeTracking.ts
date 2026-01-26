import { useState, useEffect, useCallback } from 'react'
import type {
  FormData,
  ItemImage,
} from '@/components/admin/menu-management/manage-menu/menu-Items/types/addItemModal'
import type { Variant } from '@/components/admin/menu-management/manage-menu/menu-Items/variants/types/variant.types'

// Deep comparison utility for objects
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true

  if (obj1 == null || obj2 == null) return obj1 === obj2

  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 !== 'object') return obj1 === obj2

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

// Compare form data fields with detailed logging
const compareFormFields = (current: FormData, initial: FormData): string[] => {
  const changedFields: string[] = []
  const fieldsToCheck: (keyof FormData)[] = [
    'name',
    'description',
    'category_id',
    'is_veg',
    'stock',
    'price',
    'cost',
  ]

  fieldsToCheck.forEach((field) => {
    // Handle numeric comparisons properly
    const currentValue =
      field === 'price' ||
      field === 'cost' ||
      field === 'stock' ||
      field === 'category_id' ||
      field === 'is_veg'
        ? Number(current[field])
        : current[field]
    const initialValue =
      field === 'price' ||
      field === 'cost' ||
      field === 'stock' ||
      field === 'category_id' ||
      field === 'is_veg'
        ? Number(initial[field])
        : initial[field]

    if (currentValue !== initialValue) {
      changedFields.push(field)
    }
  })

  return changedFields
}

// Compare images arrays
const compareImages = (current: ItemImage[], initial: ItemImage[]): boolean => {
  if (current.length !== initial.length) return true

  // Check if any image has base64Data (new upload) or if URLs changed
  for (let i = 0; i < current.length; i++) {
    const currentImg = current[i]
    const initialImg = initial[i]

    // If there's base64Data, it's a new upload
    if (currentImg.base64Data) return true

    // If image URLs are different
    if (currentImg.image !== initialImg.image) return true
  }

  return false
}

// Compare variants arrays with detailed change detection
const compareVariants = (current: Variant[], initial: Variant[]): boolean => {
  // If lengths are different, definitely changed
  if (current.length !== initial.length) {
    return true
  }

  // If both are empty, no changes
  if (current.length === 0 && initial.length === 0) {
    return false
  }

  // Compare each variant
  for (let i = 0; i < current.length; i++) {
    const currentVariant = current[i]
    const initialVariant = initial[i]

    if (!initialVariant) {
      return true
    }

    if (
      currentVariant.name !== initialVariant.name ||
      Number(currentVariant.price) !== Number(initialVariant.price) ||
      currentVariant.id !== initialVariant.id
    ) {
      return true
    }
  }

  return false
}

interface InitialItemState {
  formData: FormData
  images: ItemImage[]
  variants: Variant[]
  timestamp: number
}

interface ChangeDetectionResult {
  hasFormChanges: boolean
  hasImageChanges: boolean
  hasVariantChanges: boolean
  changedFormFields: string[]
  hasAnyChanges: boolean
}

interface UpdatePayload {
  id: number
  name?: string
  description?: string
  categoryId?: number
  images?: string[]
  isVeg?: boolean
  stock?: number
  price?: number
  cost?: number
  status?: string
  currentStatus?: string // Added currentStatus field
  variants?: Variant[] | any
  token: string
}

// Validation function to ensure selective update integrity
const validateSelectiveUpdate = (
  payload: Partial<UpdatePayload>,
  changes: ChangeDetectionResult,
): boolean => {
  // Check that payload only contains expected fields
  const expectedFields = ['id', 'token', 'status', 'currentStatus'] // Added currentStatus
  if (changes.hasFormChanges) {
    expectedFields.push(...changes.changedFormFields)
  }
  if (changes.hasImageChanges) {
    expectedFields.push('images')
  }
  if (changes.hasVariantChanges) {
    expectedFields.push('variants')
  }

  const payloadFields = Object.keys(payload)
  const unexpectedFields = payloadFields.filter(
    (field) =>
      !expectedFields.includes(field) && !['selectiveFields'].includes(field), // Allow API-specific fields
  )

  if (unexpectedFields.length > 0) {
    console.warn('⚠️ Unexpected fields in payload:', unexpectedFields)
  }

  // Validate that changed fields are actually in the payload
  const missingFields = changes.changedFormFields.filter((field) => {
    const mappedField =
      field === 'category_id'
        ? 'categoryId'
        : field === 'is_veg'
          ? 'isVeg'
          : field
    return !payloadFields.includes(mappedField)
  })

  if (missingFields.length > 0) {
    console.error('❌ Missing expected fields in payload:', missingFields)
    return false
  }

  return true
}

export const useChangeTracking = (
  currentFoodItem: any,
  open: boolean,
  formData: FormData,
  itemImages: ItemImage[],
  itemVariants: Variant[],
  existingVariants: Variant[] = [], // New argument default to empty
) => {
  const [initialState, setInitialState] = useState<InitialItemState | null>(
    null,
  )
  // Capture initial state when modal opens
  useEffect(() => {
    if (currentFoodItem && open) {
      const initialFormData: FormData = {
        name: currentFoodItem.name || '',
        description: currentFoodItem.description || '',
        foodType: currentFoodItem.is_veg ? 'Veg' : 'Non-Veg',
        category_id: currentFoodItem.category_id || 0,
        is_veg:
          currentFoodItem.is_veg !== undefined ? currentFoodItem.is_veg : 1,
        discount: currentFoodItem.discount || 0,
        stock: currentFoodItem.stock || 100,
        price: currentFoodItem.price || 0,
        cost: currentFoodItem.cost || 0,
      }

      const initialImages: ItemImage[] =
        currentFoodItem?.images?.map((img: string) => ({
          id: Date.now().toString() + Math.random().toString().substring(2, 5),
          image: img,
          previewImage: img,
          base64Data: null,
        })) || []

      setInitialState({
        formData: initialFormData,
        images: initialImages,
        variants: [], // Will be set when variants are loaded
        timestamp: Date.now(),
      })
    }
  }, [currentFoodItem, open])

  // Update initial variants when they're loaded
  useEffect(() => {
    // Only update initial state if we have existing variants from DB
    // and we haven't set them yet
    if (
      initialState &&
      existingVariants.length > 0 &&
      initialState.variants.length === 0
    ) {
      setInitialState((prev) =>
        prev
          ? {
              ...prev,
              variants: [...existingVariants],
            }
          : null,
      )
    }
  }, [existingVariants, initialState])

  // Detect changes with comprehensive logging
  const detectChanges = useCallback((): ChangeDetectionResult | null => {
    if (!initialState) {
      console.warn('⚠️ Change detection called without initial state')
      return null
    }

    try {
      const changedFormFields = compareFormFields(
        formData,
        initialState.formData,
      )
      const hasImageChanges = compareImages(itemImages, initialState.images)
      const hasVariantChanges = compareVariants(
        itemVariants,
        initialState.variants,
      )

      const result = {
        hasFormChanges: changedFormFields.length > 0,
        hasImageChanges,
        hasVariantChanges,
        changedFormFields,
        hasAnyChanges:
          changedFormFields.length > 0 || hasImageChanges || hasVariantChanges,
      }

      return result
    } catch (error) {
      console.error('❌ Error during change detection:', error)
      // Return null to trigger fallback to full update
      return null
    }
  }, [initialState, formData, itemImages, itemVariants])

  // Build selective payload with error handling
  const buildSelectivePayload = useCallback(
    (
      changes: ChangeDetectionResult,
      uploadedImages: string[],
      currentStatus?: string, // Added currentStatus parameter
    ): Partial<UpdatePayload> => {
      try {
        if (!initialState || !currentFoodItem?.id) {
          throw new Error(
            'Cannot build payload without initial state or item ID',
          )
        }

        const payload: Partial<UpdatePayload> = {
          id: currentFoodItem.id,
          currentStatus, // Pass current status to API
        }

        // Add only changed form fields
        changes.changedFormFields.forEach((field) => {
          switch (field) {
            case 'name':
              payload.name = formData.name
              break
            case 'description':
              payload.description = formData.description
              break
            case 'category_id':
              payload.categoryId = formData.category_id
              break
            case 'is_veg':
              payload.isVeg = Boolean(formData.is_veg)
              break
            case 'stock':
              payload.stock = formData.stock
              break
            case 'price':
              payload.price = formData.price
              break
            case 'cost':
              payload.cost = formData.cost
              break
            default:
              console.warn('  ⚠️ Unknown field:', field)
          }
        })

        // Add images only if changed
        if (changes.hasImageChanges) {
          payload.images = uploadedImages
        }

        // Add variants only if changed
        if (changes.hasVariantChanges) {
          payload.variants = itemVariants.map((variant) => {
            // Try to match with existing variant by ID strictly
            const existingVariant = initialState.variants.find(
              (v) => v.id.toString() === variant.id.toString(),
            )
            return {
              id: existingVariant?.id,
              name: variant.name,
              price: parseInt(variant.price) || 0,
            }
          })
        }

        // Always include status for updates
        if (changes.hasAnyChanges) {
          payload.status = 'available'
        }

        // Validate the payload before returning
        if (!validateSelectiveUpdate(payload, changes)) {
          throw new Error('Selective update validation failed')
        }

        return payload
      } catch (error) {
        console.error('❌ Error building selective payload:', error)
        throw error // Re-throw to trigger fallback in component
      }
    },
    [initialState, currentFoodItem, formData, itemVariants],
  )

  return {
    initialState,
    detectChanges,
    buildSelectivePayload,
    hasInitialState: !!initialState,
  }
}
