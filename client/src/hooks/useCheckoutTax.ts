import { useMemo } from 'react'
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername'
import { useRestaurantByUsername } from '@/hooks/queries/useRestaurantsQuery'
import {
  calculateTax,
  type TaxCalculationResult,
} from '@/lib/tax/taxCalculator'

interface UseCheckoutTaxResult extends TaxCalculationResult {
  isLoading: boolean
}

/**
 * Hook for calculating checkout tax breakdown.
 * Reads tax_percent from the restaurant (already cached via useRestaurantByUsername).
 * Tax is UI-only — the backend receives the pre-tax subtotal.
 *
 * @param subtotal - Pre-tax total (sum of item prices)
 * @returns Tax breakdown with loading state
 */
export function useCheckoutTax(subtotal: number): UseCheckoutTaxResult {
  const username = useRestaurantUsername()
  const { restaurant, loading } = useRestaurantByUsername(username || undefined)

  const taxResult = useMemo(() => {
    // While loading, return subtotal as grand total (no tax applied yet)
    if (loading || !restaurant) {
      return {
        taxPercent: 0,
        taxAmount: 0,
        grandTotal: subtotal,
      }
    }

    const taxPercent = restaurant.tax_percent ?? 0

    // Validate tax_percent range
    if (taxPercent < 0 || taxPercent > 100) {
      console.error(
        `[useCheckoutTax] Invalid tax_percent: ${taxPercent} for restaurant "${restaurant.username}"`,
      )
      return {
        taxPercent: 0,
        taxAmount: 0,
        grandTotal: subtotal,
      }
    }

    return calculateTax(subtotal, taxPercent)
  }, [subtotal, restaurant, loading])

  return {
    ...taxResult,
    isLoading: loading,
  }
}
