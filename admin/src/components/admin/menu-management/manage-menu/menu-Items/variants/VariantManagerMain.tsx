import React, { useState, useEffect, useTransition } from 'react'
import { Variant, VariantManagerProps } from './types/variant.types'
import VariantManagerContent from './VariantManagerContent'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useDeleteVariantMutation } from '@/hooks/queries/useInventoryQuery'
import useToast from '@/hooks/UseToast'

interface ExtendedVariantManagerProps extends VariantManagerProps {
  initialVariants?: Variant[]
}

const VariantManagerMain: React.FC<ExtendedVariantManagerProps> = ({
  onSave,
  initialVariants = [],
}) => {
  const [savedVariants, setSavedVariants] = useState<Variant[]>([])
  const [isVariantDeleting, startTransition] = useTransition()
  const { showError, showSuccess } = useToast()

  const deleteVariantMutation = useDeleteVariantMutation()

  // Set initial variants when provided
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0) {
      setSavedVariants(initialVariants)
    }
  }, [initialVariants])

  const handleSaveVariants = React.useCallback(
    (variants: Variant[]) => {
      setSavedVariants(variants)
      if (onSave) {
        onSave(variants)
      }
    },
    [onSave],
  )

  const onVariantDeleting = (
    variantId: string | number,
    onSuccess?: () => void,
  ) => {
    startTransition(async () => {
      try {
        const variantIdStr = variantId.toString()

        // Find the variant to check if it's an existing one
        const variantToDelete = savedVariants.find(
          (v) => v.id.toString() === variantIdStr,
        )

        if (!variantToDelete) {
          console.error('Variant not found')
          return
        }

        // Check if this is an existing variant from database (numeric ID)
        const isExistingVariant = !isNaN(Number(variantToDelete.id))
        if (isExistingVariant) {
          // This is an existing variant in the database, delete it via API
          await deleteVariantMutation.mutateAsync({
            id: Number(variantIdStr),
          })

          // If we reach here, it means success (otherwise error is thrown)
          if (true) {
            // Update savedVariants state
            const updatedVariants = savedVariants.filter(
              (variant) => variant.id.toString() !== variantIdStr,
            )
            setSavedVariants(updatedVariants)

            // Call the success callback to update the local state in VariantManagerContent
            if (onSuccess) {
              onSuccess()
            }

            showSuccess('Success', 'Variant deleted successfully')

            // Update the parent with the new list
            if (onSave) {
              onSave(updatedVariants)
            }
          } else {
            throw new Error('Failed to delete variant')
          }
        } else {
          // This is a newly added variant (not yet saved to database)
          // Update savedVariants
          const updatedVariants = savedVariants.filter(
            (variant) => variant.id.toString() !== variantIdStr,
          )
          setSavedVariants(updatedVariants)

          // Call the success callback to update local state
          if (onSuccess) {
            onSuccess()
          }

          // Update parent with the new list
          if (onSave) {
            onSave(updatedVariants)
          }
        }
      } catch (error) {
        console.error('Error deleting variant:', error)
        showError('Error', 'Failed to delete variant. Please try again.')
      }
    })
  }

  return (
    <div className="">
      <div className="rounded-lg">
        <Accordion
          type="single"
          collapsible
          className="w-full border-b border-dashed border-gray-400"
        >
          <AccordionItem value="variant-manager" className="border-0">
            <AccordionTrigger className="hover:no-underline px-3 py-3 sm:px-6 sm:py-4 text-base sm:text-xl font-semibold justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {savedVariants.length > 0 ? (
                  <>
                    Edit Variants
                    <span className="text-xs sm:text-sm font-normal text-gray-500">
                      ({savedVariants.length} variant
                      {savedVariants.length !== 1 ? 's' : ''})
                    </span>
                  </>
                ) : (
                  'Add Variants'
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <VariantManagerContent
                onSave={handleSaveVariants}
                initialVariants={savedVariants}
                isVariantDeleting={isVariantDeleting}
                onVariantDeleting={onVariantDeleting}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export default VariantManagerMain
