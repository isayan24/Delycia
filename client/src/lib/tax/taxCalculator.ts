/**
 * Tax Calculation Utility (Client)
 *
 * Forward-only tax calculation for checkout display.
 * Tax is UI-only — the backend receives pre-tax totals.
 */

export interface TaxCalculationResult {
  taxPercent: number
  taxAmount: number
  grandTotal: number
}

/**
 * Calculate tax amount and grand total (forward calculation)
 * @param subtotal - The pre-tax total (sum of item prices)
 * @param taxPercent - The tax percentage (e.g., 5 for 5%)
 * @returns Tax calculation result with rounded values
 */
export function calculateTax(
  subtotal: number,
  taxPercent: number,
): TaxCalculationResult {
  // Validate inputs
  if (isNaN(subtotal) || isNaN(taxPercent) || subtotal < 0 || taxPercent < 0) {
    return {
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: subtotal >= 0 ? subtotal : 0,
    }
  }

  if (!isFinite(subtotal) || !isFinite(taxPercent)) {
    return {
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: subtotal >= 0 && isFinite(subtotal) ? subtotal : 0,
    }
  }

  // Calculate tax amount
  const taxAmount = (subtotal * taxPercent) / 100

  // Round to 2 decimal places
  const roundedTaxAmount = Math.round(taxAmount * 100) / 100
  const grandTotal = Math.round((subtotal + roundedTaxAmount) * 100) / 100

  return {
    taxPercent,
    taxAmount: roundedTaxAmount,
    grandTotal,
  }
}
