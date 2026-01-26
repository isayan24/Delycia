import React from 'react'
import {
  FormData,
  Errors,
  FoodType,
  Category,
  FormField,
} from '../../types/addItemModal'
import { BulkItemEntry } from '../hooks/useItemFormState'
import FoodTypeSelector from '../../selectors/FoodTypeSelector'
import CategorySelector from '../../selectors/CategorySelector'
import { BulkItemCard } from './BulkItemCard'

interface BulkItemFormProps {
  formData: FormData
  errors: Errors
  handleInputChange: (field: FormField, value: string | number) => void
  handleFoodTypeChange: (type: FoodType) => void
  categories: Category[]
  bulkItems: BulkItemEntry[]
  bulkErrors: { [key: string]: Errors }
  handleRemoveBulkItem: (itemId: string) => void
  handleBulkItemChange: (
    itemId: string,
    field: keyof BulkItemEntry,
    value: any,
  ) => void
  handleAddBulkItem: () => void
  isImageLoading: boolean
}

export function BulkItemForm({
  formData,
  errors,
  handleInputChange,
  handleFoodTypeChange,
  categories,
  bulkItems,
  bulkErrors,
  handleRemoveBulkItem,
  handleBulkItemChange,
  handleAddBulkItem,
  isImageLoading,
}: BulkItemFormProps) {
  return (
    <>
      {/* Shared Fields */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-3">
          Shared Settings (applies to all items)
        </h3>
        <section className="flex gap-4 flex-wrap">
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
        </section>
      </div>

      {/* Bulk Items List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items ({bulkItems.length})</h3>
          {bulkItems.length >= 100 && (
            <span className="text-sm text-red-600">
              Maximum 100 items allowed
            </span>
          )}
        </div>

        {bulkItems.map((item, index) => (
          <BulkItemCard
            key={item.id}
            item={item}
            index={index}
            totalItems={bulkItems.length}
            errors={bulkErrors[item.id] || {}}
            onRemove={handleRemoveBulkItem}
            onChange={handleBulkItemChange}
            isImageLoading={isImageLoading}
          />
        ))}

        {/* Add Another Item Button */}
        {bulkItems.length < 100 && (
          <button
            onClick={handleAddBulkItem}
            type="button"
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors font-medium"
          >
            + Add Another Item
          </button>
        )}
      </div>
    </>
  )
}
