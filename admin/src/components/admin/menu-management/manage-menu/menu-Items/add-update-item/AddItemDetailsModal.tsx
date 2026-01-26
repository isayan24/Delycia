import React, { useState, useCallback, useMemo } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Import types
import type {
  Category,
  FormData,
  Errors,
  AddItemDetailsModalProps,
  PreviewData,
  FoodType,
  FormField,
} from '../types/addItemModal'
import type { Variant } from '../variants/types/variant.types'

// Import components
import ErrorWarning from '../item-inputs/ErrorWarning'
import { SingleItemForm } from './components/SingleItemForm'
import { BulkItemForm } from './components/BulkItemForm'
import { ItemPreviewSection } from './components/ItemPreviewSection'

// Import hooks
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useItemFormState } from './hooks/useItemFormState'
import { useImageUpload } from './hooks/useImageUpload'
import { useItemSubmission } from './hooks/useItemSubmission'

// Import utilities
import {
  validateSingleForm,
  validateBulkForm,
  getErrorFields,
} from './utils/formValidation'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { Button } from '@/components/ui/button'

// Types
interface ItemImage {
  id: string
  image: string | null
  previewImage: string | null
  base64Data: string | null
}

/**
 * Modal for adding/editing menu items
 * Supports both single and bulk item addition modes
 */
export default function AddItemDetailsModal({
  categories,
  categoryId,
  open,
  onOpenChange,
  refetch,
}: AddItemDetailsModalProps) {
  // Mode state
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false)
  const [showWarning, setShowWarning] = useState<boolean>(false)

  // Single item state
  const [itemImages, setItemImages] = useState<ItemImage[]>([])
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Errors>({})
  const [itemVariants, setItemVariants] = useState<Variant[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    foodType: 'Veg',
    category_id: categoryId,
    is_veg: 1,
    discount: 0,
    stock: 100,
    price: 0,
    cost: 0,
  })

  // Hooks
  const { selectedRid } = useRestaurantSelector()
  const {
    bulkItems,
    bulkErrors,
    setBulkErrors,
    handleAddBulkItem,
    handleRemoveBulkItem,
    handleBulkItemChange,
    resetBulkItems,
    initializeBulkItems,
  } = useItemFormState()

  const { uploadImages, uploadBulkItemImages } = useImageUpload()

  const handleRemoveAllImages = useCallback(() => {
    itemImages.forEach((img) => {
      if (img.previewImage) {
        URL.revokeObjectURL(img.previewImage)
      }
    })
    setItemImages([])
    setErrors((prev) => ({ ...prev, image: true }))
  }, [itemImages])

  const handleSuccess = useCallback(() => {
    onOpenChange(false)
    // Reset form
    setFormData({
      name: '',
      description: '',
      category_id: categoryId,
      foodType: 'Veg',
      is_veg: 1,
      discount: 0,
      stock: 100,
      price: 0,
      cost: 0,
    })
    setItemVariants([])
    handleRemoveAllImages()
    resetBulkItems()
  }, [categoryId, onOpenChange, resetBulkItems, handleRemoveAllImages])

  const { isPending, submitSingleItem, submitBulkItems } = useItemSubmission(
    handleSuccess,
    refetch,
    // ✅ Removed refreshCategories - not needed
  )

  // Helper functions
  const getCurrentCategoryName = (): string | undefined => {
    const category = categories?.find(
      (cat: Category) => cat.id == formData.category_id,
    )
    return category?.name
  }

  const handleInputChange = useCallback(
    (field: FormField, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof Errors]) {
        setErrors((prev) => ({ ...prev, [field]: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors, showWarning],
  )

  const handleFoodTypeChange = useCallback((type: FoodType) => {
    setFormData((prev) => ({
      ...prev,
      foodType: type,
      is_veg: type === 'Veg' ? 1 : 0,
    }))
  }, [])

  const handleImageUpload = useCallback(
    (newImages: ItemImage[]) => {
      setItemImages(newImages)
      if (newImages.length > 0) {
        setErrors((prev) => ({ ...prev, image: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [showWarning],
  )

  const handleRemoveImage = useCallback((imageId: string) => {
    setItemImages((prev) => {
      const updatedImages = prev.filter((img) => img.id !== imageId)
      const imageToRemove = prev.find((img) => img.id === imageId)
      if (imageToRemove?.previewImage) {
        URL.revokeObjectURL(imageToRemove.previewImage)
      }
      if (updatedImages.length === 0) {
        setErrors((prevErrors) => ({ ...prevErrors, image: true }))
      }
      return updatedImages
    })
  }, [])

  const handlePriceChange = useCallback(
    (value: string) => {
      const numericValue = value === '' ? 0 : parseInt(value) || 0
      setFormData((prev) => ({ ...prev, price: numericValue }))
      if (errors.price && numericValue > 0) {
        setErrors((prev) => ({ ...prev, price: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors.price, showWarning],
  )

  const handleCostChange = useCallback(
    (value: string) => {
      const numericValue = value === '' ? 0 : parseInt(value) || 0
      setFormData((prev) => ({ ...prev, cost: numericValue }))
      if (errors.cost && numericValue > 0) {
        setErrors((prev) => ({ ...prev, cost: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors.cost, showWarning],
  )

  const savedVariant = (variants: Variant[]) => {
    setItemVariants(variants)
  }

  // Mode toggle with confirmation
  const handleModeToggle = () => {
    const hasUnsavedSingleData =
      formData.name || formData.description || itemImages.length > 0
    const hasUnsavedBulkData = bulkItems.some(
      (item) => item.name || item.description || item.images.length > 0,
    )

    if (hasUnsavedSingleData || hasUnsavedBulkData) {
      if (
        !confirm(
          'You have unsaved data. Switching modes will clear your current work. Continue?',
        )
      ) {
        return
      }
    }

    if (!isBulkMode) {
      initializeBulkItems()
    } else {
      setFormData({
        name: '',
        description: '',
        foodType: 'Veg',
        category_id: categoryId,
        is_veg: 1,
        discount: 0,
        stock: 100,
        price: 0,
        cost: 0,
      })
      handleRemoveAllImages()
    }

    setErrors({})
    setShowWarning(false)
    setIsBulkMode(!isBulkMode)
  }

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isBulkMode) {
      // Validate bulk form
      const { errors: newBulkErrors, categoryError } = validateBulkForm(
        formData.category_id,
        bulkItems,
      )

      if (categoryError) {
        setErrors((prev) => ({ ...prev, category_id: true }))
      }

      if (Object.keys(newBulkErrors).length > 0 || categoryError) {
        setBulkErrors(newBulkErrors)
        setShowWarning(true)
        return
      }

      // Submit bulk items
      await submitBulkItems({
        bulkItems,
        formData: {
          category_id: formData.category_id,
          is_veg: formData.is_veg,
        },
        uploadBulkItemImages,
        rid: selectedRid,
      })
    } else {
      // Validate single form
      const validationErrors = validateSingleForm(formData, itemImages)

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        setShowWarning(true)
        return
      }

      // Upload images and submit
      try {
        const imageLinks = await uploadImages(itemImages)
        if (imageLinks.length === 0) {
          return
        }

        await submitSingleItem({
          formData,
          imageLinks,
          itemVariants,
          rid: selectedRid,
        })
      } catch (err) {
        console.error('Error uploading images:', err)
      }
    }

    setShowWarning(false)
  }

  // Preview data for mobile preview
  const previewData: PreviewData = useMemo(
    () => ({
      name: formData.name,
      description: formData.description,
      foodType: formData.foodType,
      price: formData.price,
      cost: formData.cost,
      image:
        itemImages.length > 0
          ? itemImages[itemImages.length - 1].previewImage ||
            itemImages[itemImages.length - 1].image
          : null,
      images: itemImages
        .map((img) => img.previewImage || img.image)
        .filter(Boolean) as string[],
    }),
    [formData, itemImages],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex overflow-hidden">
        {/* Preview Section - Only visible in Single Mode or when not in Bulk Mode (can be adjusted per design) */}
        {!isBulkMode && <ItemPreviewSection previewData={previewData} />}

        <div className="w-full py-0 overflow-y-auto relative">
          <header
            style={{ boxShadow: '0px -4px 8px black' }}
            className="sticky top-0 bg-white z-[52] p-5 pb-0 left-0 mb-8 w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-black">
                  {getCurrentCategoryName()}
                </h2>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => !isBulkMode && handleModeToggle()}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      !isBulkMode
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Single Item
                  </button>
                  <button
                    onClick={() => isBulkMode && handleModeToggle()}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isBulkMode
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bulk Add
                  </button>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <Separator className="mt-4 shadow-sm" />
          </header>

          <ErrorWarning
            showWarning={showWarning}
            errorFields={getErrorFields(errors)}
          />

          <div className="p-5 space-y-5 relative text-lg">
            {isBulkMode ? (
              <BulkItemForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleFoodTypeChange={handleFoodTypeChange}
                categories={categories}
                bulkItems={bulkItems}
                bulkErrors={bulkErrors}
                handleRemoveBulkItem={handleRemoveBulkItem}
                handleBulkItemChange={handleBulkItemChange}
                handleAddBulkItem={handleAddBulkItem}
                isImageLoading={isImageLoading}
              />
            ) : (
              <SingleItemForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleFoodTypeChange={handleFoodTypeChange}
                categories={categories}
                itemImages={itemImages}
                setItemImages={setItemImages}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                isImageLoading={isImageLoading}
                handlePriceChange={handlePriceChange}
                handleCostChange={handleCostChange}
                setItemVariants={savedVariant}
              />
            )}

            <div className="flex justify-between pt-4 sticky -bottom-2 left-0 right-0 w-full bg-white p-5 border-t mt-auto">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-red-200 text-red-600 border border-red-500 px-6 py-4 rounded-lg hover:bg-red-300 transition-colors"
              >
                Discard
              </Button>
              <StatefulButton
                onClick={onSubmit}
                className="bg-green-500 text-white text-lg px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                disabled={isPending}
              >
                {isBulkMode
                  ? `Save ${bulkItems.length} Item${bulkItems.length > 1 ? 's' : ''}`
                  : 'Save Item'}
              </StatefulButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
