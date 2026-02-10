/**
 * Tax Calculation Utility
 * 
 * Provides functions for calculating GST/tax on orders
 * All calculations are performed server-side for security
 */

export interface TaxCalculationInput {
  subtotal: number
  taxPercent: number
}

export interface TaxCalculationResult {
  taxPercent: number
  taxAmount: number
  grandTotal: number
}

export interface TaxBreakdownResult {
  subtotal: number
  taxAmount: number
  totalAmount: number
  taxPercent: number
}

/**
 * Calculate tax breakdown from total amount (reverse calculation)
 * Used when displaying orders that only have total_amount
 * @param totalAmount - The final price including tax
 * @param taxPercent - The tax percentage (e.g., 5 for 5%)
 * @returns Tax breakdown with subtotal, tax amount, and total
 */
export function calculateTaxBreakdown(
  totalAmount: number,
  taxPercent: number
): TaxBreakdownResult {
  // Validate inputs
  if (isNaN(totalAmount) || isNaN(taxPercent) || totalAmount < 0 || taxPercent < 0) {
    console.error('Invalid tax breakdown inputs', { totalAmount, taxPercent })
    return {
      subtotal: 0,
      taxAmount: 0,
      totalAmount: totalAmount >= 0 ? totalAmount : 0,
      taxPercent: 0,
    }
  }

  // Check for infinity
  if (!isFinite(totalAmount) || !isFinite(taxPercent)) {
    console.error('Invalid tax breakdown inputs (infinity)', { totalAmount, taxPercent })
    return {
      subtotal: 0,
      taxAmount: 0,
      totalAmount: totalAmount >= 0 && isFinite(totalAmount) ? totalAmount : 0,
      taxPercent: 0,
    }
  }

  // Calculate subtotal (reverse of adding tax)
  const subtotal = totalAmount / (1 + taxPercent / 100)
  const taxAmount = subtotal * (taxPercent / 100)

  // Round to 2 decimal places
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    taxPercent,
  }
}

/**
 * Calculate total amount with tax (forward calculation)
 * Used when creating orders
 * @param subtotal - The pre-tax amount
 * @param taxPercent - The tax percentage (e.g., 5 for 5%)
 * @returns Total amount with tax included, rounded to 2 decimal places
 */
export function calculateTotalWithTax(
  subtotal: number,
  taxPercent: number
): number {
  if (isNaN(subtotal) || isNaN(taxPercent) || subtotal < 0 || taxPercent < 0) {
    console.error('Invalid total calculation inputs', { subtotal, taxPercent })
    return subtotal >= 0 ? subtotal : 0
  }

  if (!isFinite(subtotal) || !isFinite(taxPercent)) {
    console.error('Invalid total calculation inputs (infinity)', { subtotal, taxPercent })
    return subtotal >= 0 && isFinite(subtotal) ? subtotal : 0
  }

  const totalWithTax = subtotal * (1 + taxPercent / 100)
  return Math.round(totalWithTax * 100) / 100
}

/**
 * Calculate tax amount and grand total
 * @param subtotal - The pre-tax, pre-discount total
 * @param taxPercent - The tax percentage (e.g., 12 for 12%)
 * @returns Tax calculation result with rounded values
 */
export function calculateTax(
  subtotal: number,
  taxPercent: number
): TaxCalculationResult {
  // Validate inputs
  if (isNaN(subtotal) || isNaN(taxPercent) || subtotal < 0 || taxPercent < 0) {
    console.error('Invalid tax calculation inputs', { subtotal, taxPercent })
    return {
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: subtotal >= 0 ? subtotal : 0,
    }
  }

  // Check for infinity
  if (!isFinite(subtotal) || !isFinite(taxPercent)) {
    console.error('Invalid tax calculation inputs (infinity)', { subtotal, taxPercent })
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

/**
 * Calculate subtotal from order items
 * @param items - Array of order items with prices and quantities
 * @returns Total subtotal before tax and discount
 */
export function calculateSubtotal(items: Array<{
  totalItemAmount?: number
  totalPrice?: number
  price?: number
  quantity?: number
}>): number {
  return items.reduce((sum, item) => {
    // Handle different item structures
    const itemTotal = item.totalItemAmount || item.totalPrice || 
                     ((item.price || 0) * (item.quantity || 1))
    return sum + itemTotal
  }, 0)
}
