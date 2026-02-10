import { useMemo } from 'react'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { calculateTaxBreakdown, calculateTotalWithTax } from '@/lib/tax/taxCalculator'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OrderTaxBreakdownProps {
  rid?: number
  totalAmount: number
  showDetails?: boolean
  className?: string
  isPreTax?: boolean // New prop: true if totalAmount is pre-tax (subtotal), false if post-tax (grand total)
  discountAmount?: number // Optional discount to apply before tax
}

/**
 * OrderTaxBreakdown Component
 * 
 * Displays tax breakdown for an order by fetching restaurant's tax_percent
 * and calculating tax based on whether the amount is pre-tax or post-tax.
 * 
 * @param rid - Restaurant ID (optional, will use selected restaurant if not provided)
 * @param totalAmount - Order amount (can be pre-tax or post-tax based on isPreTax)
 * @param showDetails - Whether to show detailed breakdown (default: true)
 * @param className - Additional CSS classes
 * @param isPreTax - If true, totalAmount is pre-tax subtotal; if false, it's post-tax grand total (default: false)
 * @param discountAmount - Optional discount to apply before calculating tax
 */
export function OrderTaxBreakdown({
  rid,
  totalAmount,
  showDetails = true,
  className = '',
  isPreTax = false,
  discountAmount = 0,
}: OrderTaxBreakdownProps) {
  // Get selected restaurant if rid not provided
  const { selectedRid } = useRestaurantSelector()
  const effectiveRid = rid || (selectedRid ? parseInt(selectedRid) : 0)
  
  // Fetch restaurant data to get tax_percent
  const { data: restaurantMap, isLoading, error } = useRestaurantsQuery([effectiveRid])

  // Calculate tax breakdown with comprehensive error handling
  const breakdown = useMemo(() => {
    // Return null if data is not yet loaded
    if (!restaurantMap) {
      return null
    }

    // Handle missing restaurant data
    const restaurantKey = effectiveRid.toString()
    const restaurant = restaurantMap[restaurantKey]
    
    if (!restaurant) {
      console.error(`Restaurant not found for rid: ${effectiveRid}`)
      return null
    }

    // Validate tax_percent exists and is valid
    const taxPercent = restaurant.tax_percent ?? 0
    
    if (taxPercent < 0 || taxPercent > 100) {
      console.error(`Invalid tax_percent for rid ${effectiveRid}: ${taxPercent}`)
      // Fallback: use 0% tax if invalid
      return {
        subtotal: totalAmount,
        taxAmount: 0,
        totalAmount: totalAmount,
        taxPercent: 0
      }
    }

    try {
      if (isPreTax) {
        // Forward calculation: totalAmount is pre-tax subtotal
        // Apply discount first, then calculate tax
        const subtotalAfterDiscount = totalAmount - discountAmount
        const taxAmount = subtotalAfterDiscount * (taxPercent / 100)
        const grandTotal = subtotalAfterDiscount + taxAmount
        
        return {
          subtotal: Math.round(totalAmount * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          totalAmount: Math.round(grandTotal * 100) / 100,
          taxPercent,
        }
      } else {
        // Reverse calculation: totalAmount is post-tax grand total
        return calculateTaxBreakdown(totalAmount, taxPercent)
      }
    } catch (error) {
      console.error('Tax breakdown calculation failed:', error, {
        rid: effectiveRid,
        totalAmount,
        taxPercent,
        isPreTax
      })
      return null
    }
  }, [restaurantMap, effectiveRid, totalAmount, isPreTax, discountAmount])

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Calculating tax...</span>
      </div>
    )
  }

  // Error state
  if (error || !breakdown) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Unable to calculate tax breakdown. Please refresh the page.
        </AlertDescription>
      </Alert>
    )
  }

  // Compact view (just total)
  if (!showDetails) {
    return (
      <div className={`text-sm font-medium ${className}`}>
        ₹{breakdown.totalAmount.toFixed(2)}
      </div>
    )
  }

  // Detailed view
  return (
    <div className={`space-y-1 text-sm ${className}`}>
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal:</span>
        <span>₹{breakdown.subtotal.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount:</span>
          <span>-₹{discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Tax ({breakdown.taxPercent}%):</span>
        <span>₹{breakdown.taxAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-1">
        <span>Total:</span>
        <span>₹{breakdown.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  )
}

/**
 * Compact version for inline display
 */
export function OrderTaxBreakdownCompact({
  rid,
  totalAmount,
  className = '',
  isPreTax = false,
  discountAmount = 0,
}: Omit<OrderTaxBreakdownProps, 'showDetails'>) {
  return (
    <OrderTaxBreakdown
      rid={rid}
      totalAmount={totalAmount}
      showDetails={false}
      className={className}
      isPreTax={isPreTax}
      discountAmount={discountAmount}
    />
  )
}

/**
 * Cart total with tax breakdown
 * Aggregates multiple order amounts
 */
interface CartTaxBreakdownProps {
  rid: number
  orders: Array<{ total_amount: number }>
  className?: string
}

export function CartTaxBreakdown({
  rid,
  orders,
  className = '',
}: CartTaxBreakdownProps) {
  const cartTotal = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }, [orders])

  return (
    <OrderTaxBreakdown
      rid={rid}
      totalAmount={cartTotal}
      showDetails={true}
      className={className}
    />
  )
}
