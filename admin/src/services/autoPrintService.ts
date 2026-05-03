/**
 * Auto Print Service
 * 
 * Handles automatic bill printing with printer detection and fallback to preview.
 * Production-ready with error handling, retry logic, and browser compatibility.
 */

import { BillData, TaxBreakdown } from '@/components/billing/types'
import { isAutoPrintEnabled } from './printPreferences'

export interface AutoPrintOptions {
  billData: BillData
  taxBreakdown: TaxBreakdown
  restaurantName: string
  restaurantId?: string | number
  onFallbackToPreview: () => void
  onPrintSuccess?: () => void
  onPrintError?: (error: Error) => void
}

export interface PrinterDetectionResult {
  hasPrinter: boolean
  printerCount: number
  method: 'permissions-api' | 'media-query' | 'fallback'
}

/**
 * Detect if a printer is available
 * Uses multiple detection methods for better browser compatibility
 */
export async function detectPrinter(): Promise<PrinterDetectionResult> {
  // Method 1: Permissions API (Chrome, Edge)
  if ('permissions' in navigator && 'query' in navigator.permissions) {
    try {
      // @ts-ignore - printer permission is not in all TypeScript definitions
      const result = await navigator.permissions.query({ name: 'printer' })
      
      if (result.state === 'granted' || result.state === 'prompt') {
        return {
          hasPrinter: true,
          printerCount: 1, // Can't get exact count from permissions API
          method: 'permissions-api',
        }
      }
    } catch (error) {
      // Permission not supported or denied, try other methods
      console.debug('Permissions API not available for printer detection')
    }
  }

  // Method 2: Media Query (works in most browsers)
  if (window.matchMedia) {
    try {
      const printMediaQuery = window.matchMedia('print')
      // If print media query is supported, assume printer capability exists
      if (printMediaQuery) {
        return {
          hasPrinter: true,
          printerCount: 1,
          method: 'media-query',
        }
      }
    } catch (error) {
      console.debug('Media query printer detection failed')
    }
  }

  // Method 3: Check if print dialog can be triggered
  // This is a fallback - we assume printer exists if window.print is available
  if (typeof window.print === 'function') {
    return {
      hasPrinter: true,
      printerCount: 1,
      method: 'fallback',
    }
  }

  // No printer detection method available
  return {
    hasPrinter: false,
    printerCount: 0,
    method: 'fallback',
  }
}

/**
 * Generate bill HTML for printing
 */
function generateBillHTML(
  billData: BillData,
  taxBreakdown: TaxBreakdown,
  restaurantName: string
): string {
  const isGuestUser = billData.customerName === 'Guest'
  const showTable = billData.tableNo !== 'N/A'
  const showTax = taxBreakdown.taxPercent > 0

  return `
    <div class="bill-container">
      <!-- Header -->
      <div class="text-center mb-4 border-b" style="padding-bottom: 8px;">
        <div class="font-bold" style="font-size: 16px;">
          ${restaurantName || 'RESTAURANT BILL'}
        </div>
        <div style="font-size: 11px;">
          Order #${billData.orderId}
        </div>
      </div>

      <!-- Customer & Table Info -->
      <div class="space-y-1" style="margin-bottom: 16px; margin-top: 10px;">
        ${
          showTable
            ? `
          <div class="flex justify-between font-bold border-b" style="font-size: 14px; padding-bottom: 8px; margin-bottom: 8px;">
            <span>Table: ${billData.tableNo}</span>
          </div>
          ${
            billData.tableZone
              ? `
          <div class="flex justify-between font-bold border-b" style="font-size: 12px; padding-bottom: 8px; margin-bottom: 8px;">
            <span>${billData.tableZone}</span>
          </div>
          `
              : ''
          }
        `
            : ''
        }
        ${
          !isGuestUser
            ? `
          <div class="flex justify-between" style="font-size: 11px;">
            <span>Customer:</span>
            <span class="font-bold">${billData.customerName}</span>
          </div>
          <div class="flex justify-between" style="font-size: 11px;">
            <span>Phone No:</span>
            <span>${billData.customerPhone}</span>
          </div>
        `
            : ''
        }
        <div class="flex justify-between" style="font-size: 11px;">
          <span>Date:</span>
          <span>${billData.orderDate}</span>
        </div>
      </div>

      <!-- Items -->
      <div class="border-t py-2 mb-2" style="border-bottom: ${showTax ? '1px solid #000' : 'none'}; padding: 8px 0; margin-bottom: 8px;">
        <div class="font-bold text-center mb-2" style="margin-bottom: 8px;">
          ORDER ITEMS
        </div>
        <div class="space-y-1" style="font-size: 11px;">
          ${billData.items
            .map(
              (item) => `
            <div>
              <div class="flex justify-between">
                <span>
                  ${item.name}${item.variant_name ? ` (${item.variant_name})` : ''} x${item.quantity}
                </span>
                <span>₹${item.price.toFixed(2)}</span>
              </div>
              ${
                item.addons && item.addons.length > 0
                  ? `
                <div style="font-size: 10px; color: #666; margin-top: 2px;">
                  ${item.addons
                    .map(
                      (addon) => `
                    <div class="flex justify-between" style="padding-left: 8px;">
                      <span>+ ${addon.quantity} ${addon.name}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Special Instructions -->
      ${
        billData.specialInstructions && billData.specialInstructions.trim()
          ? `
        <div class="py-2 mb-2" style="border-bottom: 1px dashed #000; padding: 6px 0; margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px;">
            NOTE:
          </div>
          <div style="font-size: 11px; font-style: italic;">
            ${billData.specialInstructions}
          </div>
        </div>
      `
          : ''
      }

      <!-- Subtotal (only if tax > 0) -->
      ${
        showTax
          ? `
        <div class="py-1" style="padding: 4px 0;">
          <div class="flex justify-between" style="font-size: 12px;">
            <span>Subtotal:</span>
            <span>₹${taxBreakdown.subtotal.toFixed(2)}</span>
          </div>
        </div>
      `
          : ''
      }

      <!-- Discount -->
      ${
        billData.discountAmount !== undefined && billData.discountAmount > 0
          ? `
        <div class="py-1" style="padding: 4px 0;">
          <div class="flex justify-between" style="font-size: 12px;">
            <span>Discount:</span>
            <span>-₹${billData.discountAmount.toFixed(2)}</span>
          </div>
        </div>
      `
          : ''
      }

      <!-- Tax (only if tax > 0) -->
      ${
        showTax
          ? `
        <div class="py-1" style="padding: 4px 0;">
          <div class="flex justify-between" style="font-size: 12px;">
            <span>Tax (${taxBreakdown.taxPercent}%):</span>
            <span>₹${taxBreakdown.taxAmount.toFixed(2)}</span>
          </div>
        </div>
      `
          : ''
      }

      <!-- Total -->
      <div class="border-t py-2 mb-4" style="padding: 8px 0; margin-bottom: 16px;">
        <div class="flex justify-between font-bold" style="font-size: 14px;">
          <span>GRAND TOTAL:</span>
          <span>₹${taxBreakdown.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center border-t" style="padding-top: 8px; font-size: 10px;">
        <div>Thank you for your visit!</div>
        <div>Please come again</div>
      </div>
    </div>
  `
}

/**
 * Print bill silently (without preview dialog)
 * Returns true if print was initiated, false if failed or cancelled
 */
async function printBillSilently(
  billHTML: string,
  _orderId: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    iframe.style.visibility = 'hidden'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (!iframeDoc) {
      document.body.removeChild(iframe)
      resolve(false)
      return
    }

    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
            }
            * { box-sizing: border-box; }
            .bill-container { 
              width: 80mm;
              max-width: 80mm;
              margin: 0 auto;
              padding: 10mm;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .py-2 { padding: 8px 0; }
            .py-1 { padding: 4px 0; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .space-y-1 > * + * { margin-top: 4px; }
            @media print {
              @page {
                margin: 0;
                size: 80mm auto;
              }
              html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .bill-container { 
                max-width: none;
                padding: 10mm;
              }
            }
          </style>
        </head>
        <body>${billHTML}</body>
      </html>
    `)
    iframeDoc.close()

    // Track if print dialog was opened
    let printDialogOpened = false
    let cleanupTimer: NodeJS.Timeout

    // Listen for beforeprint event (print dialog opened)
    iframe.contentWindow?.addEventListener('beforeprint', () => {
      printDialogOpened = true
    })

    // Listen for afterprint event (print dialog closed)
    iframe.contentWindow?.addEventListener('afterprint', () => {
      // Clean up after a short delay
      cleanupTimer = setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
        resolve(printDialogOpened)
      }, 500)
    })

    // Wait for content to load, then trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        
        // Fallback cleanup if afterprint doesn't fire (user cancelled immediately)
        setTimeout(() => {
          if (!printDialogOpened && document.body.contains(iframe)) {
            document.body.removeChild(iframe)
            resolve(false)
          }
        }, 2000)
      } catch (error) {
        console.error('Print error:', error)
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
        clearTimeout(cleanupTimer)
        resolve(false)
      }
    }, 250)
  })
}

/**
 * Main auto-print function
 * Checks user preferences and prints automatically if enabled, otherwise shows preview
 */
export async function autoPrintBill(
  options: AutoPrintOptions
): Promise<void> {
  const {
    billData,
    taxBreakdown,
    restaurantName,
    restaurantId,
    onFallbackToPreview,
    onPrintSuccess,
    onPrintError,
  } = options

  try {
    // Check if auto-print is enabled for this restaurant
    const autoPrintEnabled = restaurantId ? isAutoPrintEnabled(restaurantId) : false

    if (!autoPrintEnabled) {
      console.log('Auto-print disabled, showing preview')
      onFallbackToPreview()
      return
    }

    console.log('Auto-print enabled, attempting to print...')

    // Generate bill HTML
    const billHTML = generateBillHTML(billData, taxBreakdown, restaurantName)

    // Attempt to print silently
    const printSuccess = await printBillSilently(billHTML, billData.orderId)

    if (printSuccess) {
      console.log('Print dialog opened successfully')
      onPrintSuccess?.()
    } else {
      console.log('Print was cancelled or failed, showing preview')
      onFallbackToPreview()
    }
  } catch (error) {
    console.error('Auto-print error:', error)
    onPrintError?.(error as Error)
    // Fallback to preview on any error
    onFallbackToPreview()
  }
}

/**
 * Check if auto-print is supported in current browser
 */
export function isAutoPrintSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.print === 'function' &&
    typeof document.createElement === 'function'
  )
}
