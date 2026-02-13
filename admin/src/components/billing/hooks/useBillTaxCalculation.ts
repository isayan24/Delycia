import { useMemo } from 'react'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { BillData, TaxBreakdown } from '../types'
import { calculateBillTaxBreakdown } from '../utils/billCalculations'

interface UseBillTaxCalculationProps {
  billData: BillData
}

/**
 * Custom hook for calculating bill tax breakdown
 * Automatically fetches restaurant data using the rid from billData or selected restaurant
 *
 * @param billData - Bill data containing items and amounts
 * @returns Tax breakdown with loading and error states
 */
export function useBillTaxCalculation({
  billData,
}: UseBillTaxCalculationProps) {
  // Get restaurant data from selector (already cached by TanStack Query)
  const { restaurants, selectedRid, isLoadingRestaurants } =
    useRestaurantSelector()

  // Determine which restaurant to use (billData.rid takes priority)
  const restaurantId = billData.rid || (selectedRid ? parseInt(selectedRid) : 0)

  const taxBreakdown = useMemo((): TaxBreakdown => {
    // Return zero values if data is not yet loaded
    if (isLoadingRestaurants) {
      return {
        subtotal: 0,
        taxAmount: 0,
        taxPercent: 0,
        totalAmount: billData.totalAmount,
      }
    }

    // Handle missing restaurant ID (not yet loaded or not set)
    if (!restaurantId) {
      return {
        subtotal: billData.totalAmount,
        taxAmount: 0,
        taxPercent: 0,
        totalAmount: billData.totalAmount,
      }
    }

    // Handle missing restaurant data
    const restaurantKey = restaurantId.toString()
    const restaurant = restaurants[restaurantKey]

    if (!restaurant) {
      console.warn(`Restaurant not found for rid: ${restaurantId}`)
      return {
        subtotal: billData.totalAmount,
        taxAmount: 0,
        taxPercent: 0,
        totalAmount: billData.totalAmount,
      }
    }

    // Validate tax_percent
    const taxPercent = restaurant.tax_percent ?? 0

    if (taxPercent < 0 || taxPercent > 100) {
      console.error(
        `Invalid tax_percent for rid ${restaurantId}: ${taxPercent}`,
      )
      return {
        subtotal: billData.totalAmount,
        taxAmount: 0,
        taxPercent: 0,
        totalAmount: billData.totalAmount,
      }
    }

    try {
      return calculateBillTaxBreakdown(billData, taxPercent)
    } catch (error) {
      console.error('Tax breakdown calculation failed:', error, {
        rid: restaurantId,
        totalAmount: billData.totalAmount,
        taxPercent,
      })
      return {
        subtotal: billData.totalAmount,
        taxAmount: 0,
        taxPercent: 0,
        totalAmount: billData.totalAmount,
      }
    }
  }, [restaurants, isLoadingRestaurants, restaurantId, billData])

  return {
    taxBreakdown,
    isLoading: isLoadingRestaurants,
    error: null,
  }
}
