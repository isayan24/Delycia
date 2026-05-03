import { BillData, TaxBreakdown } from '../types'
import { renderBillToCanvas, generateBillFilename } from './canvasRenderer'

/**
 * Download bill as PNG image
 */
export async function downloadBillAsImage(
  billData: BillData,
  taxBreakdown: TaxBreakdown
): Promise<void> {
  try {
    const canvas = renderBillToCanvas(billData, taxBreakdown)
    const filename = generateBillFilename(billData.customerName, billData.orderDate)

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Error downloading bill image:', error)
    throw error
  }
}

/**
 * Share bill as PNG image
 */
export async function shareBillAsImage(
  billData: BillData,
  taxBreakdown: TaxBreakdown,
  onShareToMobile?: (phoneNumber: string) => void
): Promise<void> {
  try {
    const canvas = renderBillToCanvas(billData, taxBreakdown)
    const filename = generateBillFilename(billData.customerName, billData.orderDate)

    // Call custom share handler if provided
    if (onShareToMobile && billData.customerPhone) {
      onShareToMobile(billData.customerPhone)
    }

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })

    if (!blob) throw new Error('Failed to create blob from canvas')

    // Try native share API
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Bill - Order ${billData.orderId}`,
          text: `Bill for Order ${billData.orderId}`,
          files: [file],
        })
        return
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error sharing bill:', error)
    // Fallback to download
    await downloadBillAsImage(billData, taxBreakdown)
  }
}

/**
 * Print bill using thermal printer
 */
export function printBill(billHTML: string, orderId: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

  if (!iframeDoc) {
    document.body.removeChild(iframe)
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

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 250)
}
