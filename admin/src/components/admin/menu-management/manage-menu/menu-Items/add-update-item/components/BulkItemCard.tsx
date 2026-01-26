import React from 'react'
import { X } from 'lucide-react'
import type { BulkItemEntry } from '../hooks/useItemFormState'
import type { Errors } from '../../types/addItemModal'
import ItemNameInput from '../../item-inputs/ItemNameInput'
import ItemDescriptionInput from '../../item-inputs/ItemDescriptionInput'
import ImageUploadSection from '../../item-inputs/ImageUploadSection'
import VariantManagerMain from '../../variants/VariantManagerMain'

interface ItemImage {
  id: string
  image: string | null
  previewImage: string | null
  base64Data: string | null
}

interface BulkItemCardProps {
  item: BulkItemEntry
  index: number
  totalItems: number
  errors: Errors
  onRemove: (itemId: string) => void
  onChange: (itemId: string, field: keyof BulkItemEntry, value: any) => void
  isImageLoading: boolean
}

/**
 * Individual bulk item form card
 * Displays all fields for a single item in bulk mode
 */
export const BulkItemCard: React.FC<BulkItemCardProps> = ({
  item,
  index,
  totalItems,
  errors,
  onRemove,
  onChange,
  isImageLoading,
}) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50 relative">
      {/* Item Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700">Item #{index + 1}</h4>
        {totalItems > 1 && (
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-md transition-colors"
            type="button"
            aria-label={`Remove item ${index + 1}`}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Item Fields */}
      <div className="space-y-4">
        <ItemNameInput
          value={item.name}
          onChange={(value: string) => onChange(item.id, 'name', value)}
          hasError={errors?.name}
        />

        <ItemDescriptionInput
          value={item.description}
          onChange={(value: string) => onChange(item.id, 'description', value)}
          hasError={errors?.description}
        />

        <ImageUploadSection
          setItemImages={(newImages: ItemImage[]) =>
            onChange(item.id, 'images', newImages)
          }
          itemImages={item.images}
          onImageUpload={(newImages: ItemImage[]) =>
            onChange(item.id, 'images', newImages)
          }
          onRemoveImage={(imageId) => {
            const updatedImages = item.images.filter(
              (img) => img.id !== imageId,
            )
            onChange(item.id, 'images', updatedImages)
          }}
          isImageLoading={isImageLoading}
          hasError={errors?.image}
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={item.cost || ''}
              onChange={(e) =>
                onChange(item.id, 'cost', parseInt(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-md ${
                errors?.cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) =>
                onChange(item.id, 'price', parseInt(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-md ${
                errors?.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={item.stock || ''}
              onChange={(e) =>
                onChange(item.id, 'stock', parseInt(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-md ${
                errors?.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="100"
              min="0"
            />
          </div>
        </div>

        {/* Variants Section */}
        <div className="pt-2">
          <VariantManagerMain
            initialVariants={item.variants || []}
            onSave={(variants) => onChange(item.id, 'variants', variants)}
          />
        </div>
      </div>
    </div>
  )
}
