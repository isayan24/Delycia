// hooks/useVariantManager.ts
import { useState, useEffect } from 'react'
import {
  Variant,
  VariantStep,
  VariantManagerState,
  VariantManagerActions,
} from '../types/variant.types'

export const useVariantManager = (
  initialVariants: Variant[],
): Omit<VariantManagerState, 'savedVariants'> &
  Omit<VariantManagerActions, 'setSavedVariants'> & {
    resetToVariants: () => void
    setVariants: (variants: Variant[]) => void // Add this
  } => {
  const [currentStep, setCurrentStep] = useState<VariantStep>(
    initialVariants.length > 0 ? 'final' : 'variants',
  )

  const [variants, setVariants] = useState<Variant[]>(() => {
    if (initialVariants.length > 0) {
      return initialVariants
    }
    // Generate a unique string ID for new variants
    const timestamp = Date.now().toString()
    const random = Math.random().toString().substring(2, 5)
    return [{ id: `${timestamp}-${random}`, name: '', price: '' }]
  })

  const [nextId, setNextId] = useState<number>(1)

  // Removed standard useEffect synchronization to prevent infinite loops during auto-save.
  // We rely on initial hydration and then local updates pushing up.
  // If parent updates (e.g. via API reload), we might need a more sophisticated sync,
  // but for current 'add item' flow, this avoids the cycle.

  const addVariant = (): void => {
    // Generate unique string ID for new variants
    const timestamp = Date.now().toString()
    const random = Math.random().toString().substring(2, 5)
    const newVariant: Variant = {
      id: `${timestamp}-${random}`,
      name: '',
      price: '',
    }
    setVariants((prev) => [...prev, newVariant])
  }

  const removeVariant = (variantId: string | number): void => {
    setVariants((prev) =>
      prev.filter((variant) => {
        // Convert both to strings for comparison
        return variant.id.toString() !== variantId.toString()
      }),
    )
  }

  const updateVariantName = (
    variantId: string | number,
    name: string,
  ): void => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id.toString() === variantId.toString()
          ? { ...variant, name }
          : variant,
      ),
    )
  }

  const updateVariantPrice = (
    variantId: string | number,
    price: string,
  ): void => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id.toString() === variantId.toString()
          ? { ...variant, price }
          : variant,
      ),
    )
  }

  const resetToVariants = (): void => {
    setCurrentStep('variants')
    if (initialVariants.length > 0) {
      setVariants(initialVariants)
    } else {
      // Generate new unique ID
      const timestamp = Date.now().toString()
      const random = Math.random().toString().substring(2, 5)
      setVariants([{ id: `${timestamp}-${random}`, name: '', price: '' }])
    }
  }

  return {
    currentStep,
    setCurrentStep,
    variants,
    setVariants, // Export setVariants
    nextId,
    addVariant,
    removeVariant,
    updateVariantName,
    updateVariantPrice,
    resetToVariants,
  }
}
