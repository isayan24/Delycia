import React from 'react'
import {
  FormData,
  Errors,
  FoodType,
  Category,
  FormField,
} from '../../types/addItemModal'
import { ItemImage } from '../hooks/useItemFormState'
import ItemNameInput from '../../item-inputs/ItemNameInput'
import ItemDescriptionInput from '../../item-inputs/ItemDescriptionInput'
import FoodTypeSelector from '../../selectors/FoodTypeSelector'
import CategorySelector from '../../selectors/CategorySelector'
import StockAvailability from '../../item-inputs/StockAvailability'
import ImageUploadSection from '../../item-inputs/ImageUploadSection'
import PricingSection from '../../item-inputs/PricingSection'
import VariantManagerMain from '../../variants/VariantManagerMain'
import { Variant } from '../../variants/types/variant.types'

interface SingleItemFormProps {
  formData: FormData
  errors: Errors
  handleInputChange: (field: FormField, value: string | number) => void
  handleFoodTypeChange: (type: FoodType) => void
  categories: Category[]
  itemImages: ItemImage[]
  setItemImages: (images: ItemImage[]) => void
  handleImageUpload: (images: ItemImage[]) => void
  handleRemoveImage: (id: string) => void
  isImageLoading: boolean
  handlePriceChange: (value: string) => void
  handleCostChange: (value: string) => void
  setItemVariants: (variants: Variant[]) => void
}

export function SingleItemForm({
  formData,
  errors,
  handleInputChange,
  handleFoodTypeChange,
  categories,
  itemImages,
  setItemImages,
  handleImageUpload,
  handleRemoveImage,
  isImageLoading,
  handlePriceChange,
  handleCostChange,
  setItemVariants,
}: SingleItemFormProps) {
  return (
    <>
      <ItemNameInput
        value={formData.name}
        onChange={(value: string) => handleInputChange('name', value)}
        hasError={errors.name}
      />

      <ItemDescriptionInput
        value={formData.description}
        onChange={(value: string) => handleInputChange('description', value)}
        hasError={errors.description}
      />

      <section className="flex justify-betweens gap-[1rem] flex-wrap py-5">
        <FoodTypeSelector
          selectedType={formData.foodType}
          onTypeChange={handleFoodTypeChange}
        />

        <CategorySelector
          selectedCategoryId={formData.category_id}
          categories={categories}
          onChange={(value: number) => handleInputChange('category_id', value)}
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
        isImageLoading={isImageLoading}
        hasError={errors.image}
      />

      <PricingSection
        cost={formData.cost?.toString() || ''}
        price={formData.price?.toString() || ''}
        onPriceChange={handlePriceChange}
        onCostChange={handleCostChange}
        hasError={errors.price}
      />

      <VariantManagerMain onSave={setItemVariants} />
    </>
  )
}
