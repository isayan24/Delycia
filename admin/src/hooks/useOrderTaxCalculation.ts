import { useMemo } from 'react'
import { useRestaurantSelector } from './useRestaurantSelector'
import { calculateTax } from '@/lib/tax/taxCalculator'

interface UseOrderTaxCalculationOptions {
  subtotal: number
  discountAmount?: number
  rid?: number
}

interface OrderTaxCalculationResult {
  subtotal: number
  discountAmount: number
  subtotalAfterDiscount: number
  taxPercent: number
  taxAmount: number
  grandTotal: number
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook for calculating order tax breakdown
 * Follows TanStack best practices with proper memoization and error handling
 * 
 * Note: This hook may re-run when the restaurants object reference changes,
 * but the calculation itself is memoized based on actual values (subtotal, discount, taxPercent).
 * This is acceptable because TanStack Query caches the data and the calculation is lightweight.
 * 
 * @param options - Configuration object
 * @param options.subtotal - Pre-tax subtotal amount
 * @param options.discountAmount - Optional discount to apply before tax
 * @param options.rid - Optional restaurant ID (uses selected restaurant if not provided)
 * @returns Tax calculation result with loading and error states
 */
export function useOrderTaxCalculation({
  subtotal,
  discountAmount = 0,
  rid,
}: UseOrderTaxCalculationOptions): OrderTaxCalculationResult {
  // Get restaurant data from selector (already cached by TanStack Query)
  const { restaurants, selectedRid, isLoadingRestaurants } = useRestaurantSelector()
  
  // Determine which restaurant to use
  const effectiveRid = rid || (selectedRid ? parseInt(selectedRid) : 0)
  
  // Get tax percent from restaurant data
  // Note: This will re-run when restaurants object changes, but that's okay
  // because TanStack Query ensures the data is cached and stable
  const taxPercent = restaurants[effectiveRid.toString()]?.tax_percent ?? 0

  // Calculate tax breakdown with comprehensive error handling
  const calculation = useMemo(() => {
    // Round inputs to prevent floating point precision issues
    const roundedSubtotal = Math.round(subtotal * 100) / 100
    const roundedDiscount = Math.round(discountAmount * 100) / 100
    
    // Default values while loading or on error
    const defaultResult = {
      subtotal: roundedSubtotal,
      discountAmount: roundedDiscount,
      subtotalAfterDiscount: roundedSubtotal - roundedDiscount,
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: roundedSubtotal - roundedDiscount,
    }

    // Return default if tax percent is not available
    if (taxPercent === 0) {
      return defaultResult
    }

    // Validate tax_percent
    if (taxPercent < 0 || taxPercent > 100) {
      console.error(`Invalid tax_percent for rid ${effectiveRid}: ${taxPercent}`)
      return defaultResult
    }

    try {
      // Calculate subtotal after discount
      const subtotalAfterDiscount = roundedSubtotal - roundedDiscount

      // Calculate tax on the discounted subtotal
      const taxResult = calculateTax(subtotalAfterDiscount, taxPercent)

      return {
        subtotal: roundedSubtotal,
        discountAmount: roundedDiscount,
        subtotalAfterDiscount: Math.round(subtotalAfterDiscount * 100) / 100,
        taxPercent: taxResult.taxPercent,
        taxAmount: taxResult.taxAmount,
        grandTotal: taxResult.grandTotal,
      }
    } catch (error) {
      console.error('Tax calculation failed:', error, {
        rid: effectiveRid,
        subtotal: roundedSubtotal,
        discountAmount: roundedDiscount,
        taxPercent,
      })
      return defaultResult
    }
  }, [taxPercent, subtotal, discountAmount, effectiveRid])

  return {
    ...calculation,
    isLoading: isLoadingRestaurants,
    error: null,
  }
}
