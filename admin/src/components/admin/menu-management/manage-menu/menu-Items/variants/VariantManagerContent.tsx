// components/VariantManagerContent.tsx
import React from 'react'
import { Plus } from 'lucide-react'
import { useVariantManager } from './hooks/UseVariantManager'
import { VariantManagerContentProps } from './types/variant.types'
import VariantInput from './navigation-steps/VariantInput'

const VariantManagerContent: React.FC<VariantManagerContentProps> = ({
  onSave,
  initialVariants,
  isVariantDeleting,
  onVariantDeleting,
}) => {
  const {
    variants,
    addVariant,
    removeVariant,
    updateVariantName,
    updateVariantPrice,
  } = useVariantManager(initialVariants)
  React.useEffect(() => {
    if (onSave) {
      onSave(variants)
    }
  }, [variants, onSave])

  const handleRemoveVariant = (variantId: string | number): void => {
    // Check if this variant exists in initialVariants (i.e., it's saved in the database)
    const isExistingVariant = initialVariants.some(
      (v) => v.id.toString() === variantId.toString(),
    )

    if (isExistingVariant) {
      // This variant exists in the database, use the deletion handler with callback
      onVariantDeleting(variantId, () => {
        // After successful deletion from database, remove from local state
        removeVariant(variantId)
      })
    } else {
      // This is a newly added variant, just remove from local state
      removeVariant(variantId)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white">
      <div className="space-y-6">
        {variants.map((variant, index) => (
          <VariantInput
            key={variant.id}
            variant={variant}
            index={index}
            onNameChange={updateVariantName}
            onPriceChange={updateVariantPrice}
            onRemove={handleRemoveVariant}
            canRemove={variants.length > 0}
            isLoading={isVariantDeleting}
          />
        ))}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-0 text-center">
          <button
            onClick={addVariant}
            className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700 p-6 font-medium text-base hover:bg-blue-50 rounded-md transition-colors"
            type="button"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Variant
          </button>
        </div>
      </div>
    </div>
  )
}

export default VariantManagerContent
