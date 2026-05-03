/**
 * useAutoPrint Hook
 * 
 * React hook for automatic bill printing with printer detection
 * Provides a clean API for components to trigger auto-print functionality
 */

import { useState, useCallback } from 'react'
import { autoPrintBill, detectPrinter, isAutoPrintSupported } from '@/services/autoPrintService'
import { BillData, TaxBreakdown } from '@/components/billing/types'

export interface UseAutoPrintOptions {
  onPrintSuccess?: () => void
  onPrintError?: (error: Error) => void
  onFallbackToPreview?: () => void
}

export interface UseAutoPrintReturn {
  printBill: (
    billData: BillData,
    taxBreakdown: TaxBreakdown,
    restaurantName: string
  ) => Promise<void>
  isPrinting: boolean
  hasPrinter: boolean | null
  isSupported: boolean
  checkPrinter: () => Promise<void>
}

/**
 * Hook for automatic bill printing
 * 
 * @example
 * ```tsx
 * const { printBill, isPrinting, hasPrinter } = useAutoPrint({
 *   onPrintSuccess: () => console.log('Printed!'),
 *   onFallbackToPreview: () => setShowPreview(true)
 * })
 * 
 * // Later...
 * await printBill(billData, taxBreakdown, restaurantName)
 * ```
 */
export function useAutoPrint(options: UseAutoPrintOptions = {}): UseAutoPrintReturn {
  const [isPrinting, setIsPrinting] = useState(false)
  const [hasPrinter, setHasPrinter] = useState<boolean | null>(null)
  const isSupported = isAutoPrintSupported()

  const checkPrinter = useCallback(async () => {
    try {
      const result = await detectPrinter()
      setHasPrinter(result.hasPrinter)
    } catch (error) {
      console.error('Printer detection error:', error)
      setHasPrinter(false)
    }
  }, [])

  const printBill = useCallback(
    async (
      billData: BillData,
      taxBreakdown: TaxBreakdown,
      restaurantName: string,
      restaurantId?: string | number
    ) => {
      if (!isSupported) {
        console.warn('Auto-print not supported in this browser')
        options.onFallbackToPreview?.()
        return
      }

      setIsPrinting(true)

      try {
        await autoPrintBill({
          billData,
          taxBreakdown,
          restaurantName,
          restaurantId,
          onFallbackToPreview: () => {
            setHasPrinter(false)
            options.onFallbackToPreview?.()
          },
          onPrintSuccess: () => {
            setHasPrinter(true)
            options.onPrintSuccess?.()
          },
          onPrintError: (error) => {
            setHasPrinter(false)
            options.onPrintError?.(error)
          },
        })
      } finally {
        setIsPrinting(false)
      }
    },
    [isSupported, options]
  )

  return {
    printBill,
    isPrinting,
    hasPrinter,
    isSupported,
    checkPrinter,
  }
}
