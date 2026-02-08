import React, { useState, useCallback, useMemo } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/hooks/queries/useInventoryQuery'

// Import types
import type {
  Category,
  UpdateItemDetailsModalProps,
  PreviewData,
  FoodType,
  ErrorField,
  FormField,
} from '../types/addItemModal'
import type { Variant } from '../variants/types/variant.types'

// Import components
import MobilePreview from '../mobilePreview/MobilePreview'
import ErrorWarning from '../item-inputs/ErrorWarning'
import ItemNameInput from '../item-inputs/ItemNameInput'
import ItemDescriptionInput from '../item-inputs/ItemDescriptionInput'
import CategorySelector from '../selectors/CategorySelector'
import FoodTypeSelector from '../selectors/FoodTypeSelector'
import ImageUploadSection from '../item-inputs/ImageUploadSection'
import PricingSection from '../item-inputs/PricingSection'
import StockAvailability from '../item-inputs/StockAvailability'
import VariantManagerMain from '../variants/VariantManagerMain'

// Import hooks
import { useUpdateItemForm } from './hooks/useUpdateItemForm'
import { useImageUpload } from './hooks/useImageUpload'

// Import utilities
import { validateSingleForm, getErrorFields } from './utils/formValidation'

/**
 * Modal for updating existing menu items
 * Supports selective updates and ImageKit old image cleanup
 */
export default function UpdateItemDetailsModal({
  categories,
  categoryId,
  open,
  onOpenChange,
  refetch,
  currentFoodItem,
}: UpdateItemDetailsModalProps) {
  const [errors, setErrors] = useState<any>({})
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [isPending, setIsPending] = useState<boolean>(false)

  // Track images marked for deletion (URLs to delete on submit)
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([])

  const { showError, showSuccess } = useToast()
  const queryClient = useQueryClient()

  // Use custom hooks
  const {
    formData,
    setFormData,
    itemImages,
    setItemImages,
    itemVariants,
    setItemVariants,
    existingVariants,
    isLoadingVariants,
    detectChanges,
    buildSelectivePayload,
    hasInitialState,
  } = useUpdateItemForm(currentFoodItem, open, categoryId)

  const { uploadImagesWithCleanup } = useImageUpload()

  // Reset removed images tracking when modal closes or item changes
  React.useEffect(() => {
    if (!open || !currentFoodItem) {
      setRemovedImageUrls([])
    }
  }, [open, currentFoodItem?.id])

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
      if (errors[field as ErrorField]) {
        setErrors((prev: any) => ({ ...prev, [field]: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors, showWarning, setFormData],
  )

  const handleFoodTypeChange = useCallback(
    (type: FoodType) => {
      const newIsVeg = type === 'Veg' ? 1 : 0
      setFormData((prev) => ({
        ...prev,
        foodType: type,
        is_veg: newIsVeg as 0 | 1,
      }))
    },
    [setFormData],
  )

  const handleImageUpload = useCallback(
    (newImages: any[]) => {
      setItemImages(newImages)
      if (newImages.length > 0) {
        setErrors((prev: any) => ({ ...prev, image: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [showWarning, setItemImages],
  )

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      setItemImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === imageId)

        // If it's an existing ImageKit image (not a newly uploaded blob), track it for deletion
        if (imageToRemove?.image && !imageToRemove.image.startsWith('blob:')) {
          setRemovedImageUrls((prevRemoved) => [
            ...prevRemoved,
            imageToRemove.image!,
          ])
        }

        // Clean up blob URL if it exists
        if (
          imageToRemove?.previewImage &&
          imageToRemove.previewImage.startsWith('blob:')
        ) {
          URL.revokeObjectURL(imageToRemove.previewImage)
        }

        const updatedImages = prev.filter((img) => img.id !== imageId)

        if (updatedImages.length === 0) {
          setErrors((prevErrors: any) => ({ ...prevErrors, image: true }))
        }

        return updatedImages
      })
    },
    [setItemImages],
  )

  const handlePriceChange = useCallback(
    (value: string) => {
      const numericValue = value === '' ? 0 : parseInt(value) || 0
      setFormData((prev) => ({ ...prev, price: numericValue }))
      if (errors.price && numericValue > 0) {
        setErrors((prev: any) => ({ ...prev, price: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors.price, showWarning, setFormData],
  )

  const handleCostChange = useCallback(
    (value: string) => {
      const numericValue = value === '' ? 0 : parseInt(value) || 0
      setFormData((prev) => ({ ...prev, cost: numericValue }))
      if (errors.cost && numericValue > 0) {
        setErrors((prev: any) => ({ ...prev, cost: false }))
      }
      if (showWarning) setShowWarning(false)
    },
    [errors.cost, showWarning, setFormData],
  )

  const savedVariant = (variants: Variant[]) => {
    setItemVariants(variants)
  }

  // Form submission with ImageKit cleanup
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateSingleForm(formData, itemImages)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setShowWarning(true)
      showError('Error Updating Items', 'Please fill in all required fields')
      return
    }

    if (!hasInitialState) {
      showError('Error', 'Change tracking not initialized.Please try again.')
      return
    }

    setIsPending(true)

    try {
      // Detect what has changed
      const changes = detectChanges()

      if (!changes) {
        // Fallback to full update
        console.warn('⚠️ Change detection failed - falling back to full update')

        const imageLinks = await uploadImagesWithCleanup(
          itemImages,
          removedImageUrls, // Pass tracked removed URLs
        )

        if (imageLinks.length === 0) {
          showError('Error', 'Failed to upload images')
          setIsPending(false)
          return
        }

        const fullUpdateData = {
          id: currentFoodItem?.id,
          rid: currentFoodItem?.rid,
          name: formData.name,
          description: formData.description,
          categoryId: formData.category_id,
          images: imageLinks,
          isVeg: formData.is_veg,
          stock: formData.stock,
          price: formData.price,
          cost: formData.cost,
          status: 'available',
          currentStatus: currentFoodItem?.status,
          variants: itemVariants.map((variant) => {
            // Check if this variant exists in the original list (by ID match)
            const isExisting = existingVariants.some(
              (ev) => ev.id.toString() === variant.id.toString(),
            )
            return {
              id: isExisting ? variant.id : undefined,
              name: variant.name,
              price: parseInt(variant.price as any) || 0,
            }
          }),
        }

        await axios.patch(`/api/inventory`, fullUpdateData)
        showSuccess('Successfully!', 'Item updated successfully!')
        refetch()
        onOpenChange(false)
        setIsPending(false)
        return
      }

      // If no changes detected
      if (!changes.hasAnyChanges) {
        showSuccess('No Changes', 'No changes detected to update.')
        setIsPending(false)
        return
      }

      // Handle image uploads with cleanup if images changed
      let imageLinks: string[] = []
      console.log('*** changes *****', changes)
      if (changes.hasImageChanges) {
        imageLinks = await uploadImagesWithCleanup(itemImages, removedImageUrls)
        if (imageLinks.length === 0) {
          showError('Error', 'Failed to upload images')
          setIsPending(false)
          return
        }
      }

      // Build selective payload
      let selectivePayload
      try {
        selectivePayload = buildSelectivePayload(
          changes,
          imageLinks,
          currentFoodItem?.status,
        )
      } catch (error) {
        // Fallback to full update
        console.error('Failed to build selective payload:', error)

        const fullImageLinks = await uploadImagesWithCleanup(
          itemImages,
          removedImageUrls,
        )

        const fullUpdateData = {
          id: currentFoodItem?.id,
          rid: currentFoodItem?.rid,
          name: formData.name,
          description: formData.description,
          categoryId: formData.category_id,
          images: fullImageLinks,
          isVeg: formData.is_veg,
          stock: formData.stock,
          price: formData.price,
          cost: formData.cost,
          status: 'available',
          currentStatus: currentFoodItem?.status,
          variants: itemVariants.map((variant) => {
            // Check if this variant exists in the original list (by ID match)
            const isExisting = existingVariants.some(
              (ev) => ev.id.toString() === variant.id.toString(),
            )
            return {
              id: isExisting ? variant.id : undefined,
              name: variant.name,
              price: parseInt(variant.price as any) || 0,
            }
          }),
        }

        await axios.patch(`/api/inventory`, fullUpdateData)
        showSuccess('Successfully!', 'Item updated successfully (fallback)!')
        refetch()
        onOpenChange(false)
        setIsPending(false)
        return
      }

      // Selective update
      const apiPayload = {
        ...selectivePayload,
        rid: currentFoodItem?.rid,
        selectiveFields: changes.changedFormFields,
      }
      const response = await axios.patch(`/api/inventory`, apiPayload)
      console.log(response, 'response in client \n\n\n\n\n\n')

      // Success message based on what was updated
      let successMessage = 'Item updated successfully!'
      const updatedItems: string[] = []

      if (changes.hasFormChanges) {
        updatedItems.push(`${changes.changedFormFields.length} field(s)`)
      }
      if (changes.hasImageChanges) {
        updatedItems.push('images')
      }
      if (changes.hasVariantChanges) {
        updatedItems.push('variants')
      }

      if (updatedItems.length > 0) {
        successMessage = `Updated: ${updatedItems.join(', ')}`
      }

      showSuccess('Successfully!', successMessage)
      refetch()
      // Invalidate variants query to ensure fresh data on next open
      if (currentFoodItem?.id) {
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.variants.byInventoryId(
            currentFoodItem.id.toString(),
          ),
        })
      }
      onOpenChange(false)
    } catch (err) {
      console.error('Error submitting form:', err)

      let errorMessage = 'Error updating item or variants'

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      showError('Error', errorMessage)
    } finally {
      setIsPending(false)
      setShowWarning(false)
    }
  }

  // Preview data
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-0">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] sm:h-[90vh] flex overflow-hidden">
        <MobilePreview previewData={previewData} />

        <div className="w-full py-0 overflow-y-auto relative">
          <header
            style={{ boxShadow: '0px -4px 8px black' }}
            className="sticky top-0 bg-white z-52 p-3 sm:p-5 pb-0 left-0 mb-8d w-full"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-bold text-black">
                {getCurrentCategoryName()}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <Separator className="mt-2 sm:mt-4 shadow-sm" />
          </header>

          <ErrorWarning
            showWarning={showWarning}
            errorFields={getErrorFields(errors)}
          />

          <div className="p-3 sm:p-5 space-y-3 sm:space-y-5 relative text-sm sm:text-lg">
            <ItemNameInput
              value={formData.name}
              onChange={(value: string) => handleInputChange('name', value)}
              hasError={errors.name}
            />

            <ItemDescriptionInput
              value={formData.description}
              onChange={(value: string) =>
                handleInputChange('description', value)
              }
              hasError={errors.description}
            />

            <section className="flex justify-betweens gap-2 sm:gap-4 flex-wrap py-2 sm:py-5">
              <FoodTypeSelector
                selectedType={formData.foodType}
                onTypeChange={handleFoodTypeChange}
              />

              <CategorySelector
                selectedCategoryId={formData.category_id}
                categories={categories}
                onChange={(value: number) =>
                  handleInputChange('category_id', value)
                }
                hasError={errors.category_id}
              />
              <StockAvailability
                value={formData.stock}
                onChange={(value: number) => handleInputChange('stock', value)}
                hasError={errors.stock}
              />
            </section>

            <ImageUploadSection
              setItemImages={setItemImages}
              itemImages={itemImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              isImageLoading={false}
              hasError={errors.image}
            />

            <PricingSection
              cost={formData.cost}
              price={formData.price}
              onPriceChange={handlePriceChange}
              onCostChange={handleCostChange}
              hasError={errors.price || errors.cost}
            />

            <div className={isLoadingVariants ? 'opacity-50' : ''}>
              <VariantManagerMain
                onSave={savedVariant}
                initialVariants={existingVariants}
              />
            </div>

            <div className="flex justify-between pt-2 sm:pt-4 sticky -bottom-2 left-0 right-0 w-full bg-white p-3 sm:p-5">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-red-200 text-red-600 border border-red-500 px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-base rounded-md hover:bg-red-300 transition-colors"
              >
                Discard
              </Button>
              <Button
                onClick={onSubmit}
                className="bg-orange-500 text-white text-sm sm:text-lg px-4 sm:px-6 py-2 sm:py-4 rounded-md hover:bg-orange-600 transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Updating...</span>
                    <span className="sm:hidden">Updating</span>
                  </span>
                ) : (
                  <span>
                    <span className="hidden sm:inline">Update Item</span>
                    <span className="sm:hidden">Update</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
