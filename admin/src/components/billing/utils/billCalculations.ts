import { BillData, TaxBreakdown } from '../types'

/**
 * Calculate tax breakdown from item prices (forward calculation)
 * Item prices are pre-tax, and already include quantity multiplication
 * 
 * Calculation order:
 * 1. Subtotal = Sum of item prices
 * 2. Subtotal after discount = Subtotal - Discount
 * 3. Tax = Subtotal after discount × tax_percent
 * 4. Grand Total = Subtotal after discount + Tax
 */
export function calculateBillTaxBreakdown(
  billData: BillData,
  taxPercent: number
): TaxBreakdown {
  // Calculate subtotal from item prices (pre-tax prices that already include quantity)
  const subtotal = billData.items.reduce(
    (sum, item) => sum + item.price,
    0
  )

  // Apply discount to get the taxable amount
  const discountAmount = billData.discountAmount || 0
  const subtotalAfterDiscount = subtotal - discountAmount

  // Calculate tax on the subtotal AFTER discount
  const taxAmount = subtotalAfterDiscount * (taxPercent / 100)

  // Calculate grand total (subtotal after discount + tax)
  const totalAmount = subtotalAfterDiscount + taxAmount

  // Round to 2 decimal places
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    taxPercent,
  }
}
