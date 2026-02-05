import { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Share, Printer } from 'lucide-react'

interface BillItem {
  name: string
  quantity: number
  price: number
  variant_name?: string | null
  addons?: any[]
}
interface BillData {
  orderId: string
  tableNo: string | number
  customerName: string
  customerPhone: string
  items: BillItem[]
  totalAmount: number
  discountAmount?: number
  orderDate: string
  paymentMethod: string
  paymentStatus: string
}

interface ThermalBillProps {
  isOpen: boolean
  onClose: () => void
  billData: BillData
  /** Show print button - default true */
  showPrintButton?: boolean
  /** Show download button - default true */
  showDownloadButton?: boolean
  /** Show share button - default true */
  showShareButton?: boolean
  /** Custom callback for share to mobile - receives customer phone number */
  onShareToMobile?: (phoneNumber: string) => void
}

export default function ThermalBill({
  isOpen,
  onClose,
  billData,
  showPrintButton = true,
  showDownloadButton = true,
  showShareButton = true,
  onShareToMobile,
}: ThermalBillProps) {
  const billRef = useRef<HTMLDivElement>(null)

  const downloadAsImage = async () => {
    if (!billRef.current) return

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size (thermal printer width: ~80mm = ~300px at 96dpi)
      const width = 300
      const height = 800 // Adjust based on content
      canvas.width = width
      canvas.height = height

      // Fill background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      // Set font
      ctx.fillStyle = 'black'
      ctx.font = '12px Courier New, monospace'
      ctx.textAlign = 'left'

      let y = 20
      const lineHeight = 16
      const padding = 10

      // Helper function to draw text
      const drawText = (
        text: string,
        x: number,
        fontSize = 12,
        align: 'left' | 'center' | 'right' = 'left',
      ) => {
        ctx.font = `${fontSize}px Courier New, monospace`
        ctx.textAlign = align
        const xPos =
          align === 'center'
            ? width / 2
            : align === 'right'
              ? width - padding
              : x
        ctx.fillText(text, xPos, y)
        y += lineHeight
      }

      // Helper function to draw line
      const drawLine = () => {
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        y += 10
      }

      // Header
      drawText('RESTAURANT BILL', padding, 16, 'center')
      drawText(`Order #${billData.orderId}`, padding, 11, 'center')
      y += 10
      drawLine()
      y += 10
      // Customer & Table Info
      drawText(`Table No: ${billData.tableNo}`, padding)
      drawText(`Customer: ${billData.customerName}`, padding)
      drawText(`Phone No: ${billData.customerPhone}`, padding)
      drawText(`Date: ${billData.orderDate}`, padding)
      y += 10
      drawLine()

      // Items header
      y += 5 // Add padding top above ORDER ITEMS
      drawText('ORDER ITEMS', padding, 12, 'center')
      y += 5

      // Items
      billData.items.forEach((item) => {
        const itemText = `${item.name}${item.variant_name ? ` (${item.variant_name})` : ''} x${item.quantity}`
        const priceText = `₹${item.price}`

        // Draw item name and quantity
        ctx.textAlign = 'left'
        ctx.fillText(itemText, padding, y)

        // Draw price aligned to right
        ctx.textAlign = 'right'
        ctx.fillText(priceText, width - padding, y)

        y += lineHeight

        // Draw addons
        if (item.addons && item.addons.length > 0) {
          ctx.font = '10px Courier New, monospace'
          item.addons.forEach((addon: any) => {
            const addonText = `  + ${addon.quantity} ${addon.name} (${addon.price})`
            const addonPrice = `₹${addon.price}`

            ctx.textAlign = 'left'
            ctx.fillText(addonText, padding, y)

            ctx.textAlign = 'right'
            ctx.fillText(addonPrice, width - padding, y)

            y += lineHeight
          })
          // Reset font
          ctx.font = '12px Courier New, monospace'
        }
      })

      y += 10
      drawLine()

      // Discount (if applicable)
      if (billData.discountAmount && Number(billData.discountAmount) > 0) {
        y += 5
        ctx.font = '12px Courier New, monospace'
        ctx.textAlign = 'left'
        ctx.fillText('Discount:', padding, y)
        ctx.textAlign = 'right'
        ctx.fillText(
          `-₹${Number(billData.discountAmount).toFixed(2)}`,
          width - padding,
          y,
        )
        y += 16
      }

      // Total - Add padding top above total
      y += 5
      ctx.font = '14px Courier New, monospace'
      ctx.textAlign = 'left'
      ctx.fillText('TOTAL:', padding, y)
      ctx.textAlign = 'right'
      ctx.fillText(`₹${billData.totalAmount.toFixed(2)}`, width - padding, y)
      y += 20

      drawLine()

      // Footer
      drawText('Thank you for your visit!', padding, 10, 'center')
      drawText('Please come again', padding, 10, 'center')

      // Download the image with customer name and date format
      const sanitizedCustomerName = billData.customerName.replace(
        /[^a-zA-Z0-9]/g,
        '_',
      )
      const sanitizedDate = billData.orderDate.replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${sanitizedCustomerName}_${sanitizedDate}.png`

      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const shareAsImage = async () => {
    if (!billRef.current) return

    try {
      // Use the same canvas creation logic as download
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = 300
      const height = 800
      canvas.width = width
      canvas.height = height

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = 'black'
      ctx.font = '12px Courier New, monospace'
      ctx.textAlign = 'left'

      let y = 20
      const lineHeight = 16
      const padding = 10

      const drawText = (
        text: string,
        x: number,
        fontSize = 12,
        align: 'left' | 'center' | 'right' = 'left',
      ) => {
        ctx.font = `${fontSize}px Courier New, monospace`
        ctx.textAlign = align
        const xPos =
          align === 'center'
            ? width / 2
            : align === 'right'
              ? width - padding
              : x
        ctx.fillText(text, xPos, y)
        y += lineHeight
      }

      const drawLine = () => {
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        y += 10
      }

      drawText('RESTAURANT BILL', padding, 16, 'center')
      drawText(`Order #${billData.orderId}`, padding, 11, 'center')
      y += 10
      drawLine()
      y += 10
      drawText(`Table No: ${billData.tableNo}`, padding)
      drawText(`Customer: ${billData.customerName}`, padding)
      drawText(`Phone No: ${billData.customerPhone}`, padding)
      drawText(`Date: ${billData.orderDate}`, padding)
      y += 10
      drawLine()

      drawText('ORDER ITEMS', padding, 12, 'center')
      y += 5

      billData.items.forEach((item) => {
        const itemText = `${item.name}${item.variant_name ? ` (${item.variant_name})` : ''} x${item.quantity}`
        const priceText = `₹${item.price}`

        ctx.textAlign = 'left'
        ctx.fillText(itemText, padding, y)
        ctx.textAlign = 'right'
        ctx.fillText(priceText, width - padding, y)
        y += lineHeight

        if (item.addons && item.addons.length > 0) {
          ctx.font = '10px Courier New, monospace'
          item.addons.forEach((addon: any) => {
            const addonText = `  + ${addon.quantity} ${addon.name} (${addon.price})`
            const addonPrice = `₹${addon.price}`

            ctx.textAlign = 'left'
            ctx.fillText(addonText, padding, y)

            ctx.textAlign = 'right'
            ctx.fillText(addonPrice, width - padding, y)

            y += lineHeight
          })
          ctx.font = '12px Courier New, monospace'
        }
      })

      y += 10
      drawLine()

      // Discount (if applicable)
      if (billData.discountAmount && Number(billData.discountAmount) > 0) {
        y += 5
        ctx.font = '12px Courier New, monospace'
        ctx.textAlign = 'left'
        ctx.fillText('Discount:', padding, y)
        ctx.textAlign = 'right'
        ctx.fillText(
          `-₹${Number(billData.discountAmount).toFixed(2)}`,
          width - padding,
          y,
        )
        y += 16
      }

      // Add padding top above total
      y += 5
      ctx.font = '14px Courier New, monospace'
      ctx.textAlign = 'left'
      ctx.fillText('TOTAL:', padding, y)
      ctx.textAlign = 'right'
      ctx.fillText(`₹${billData.totalAmount.toFixed(2)}`, width - padding, y)
      y += 20

      drawLine()

      drawText('Thank you for your visit!', padding, 10, 'center')
      drawText('Please come again', padding, 10, 'center')

      // Convert canvas to blob and share
      canvas.toBlob(async (blob) => {
        if (!blob) return

        // Create filename with customer name and date
        const sanitizedCustomerName = billData.customerName.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        )
        const sanitizedDate = billData.orderDate.replace(/[^a-zA-Z0-9]/g, '_')
        const filename = `${sanitizedCustomerName}_${sanitizedDate}.png`

        // If custom share handler is provided, call it with customer phone
        if (onShareToMobile && billData.customerPhone) {
          onShareToMobile(billData.customerPhone)
        }

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], filename, {
            type: 'image/png',
          })

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Bill - Order ${billData.orderId}`,
              text: `Bill for Order ${billData.orderId}`,
              files: [file],
            })
            return
          }
        }

        // Fallback: create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Error sharing:', error)
      downloadAsImage() // Fallback to download
    }
  }

  const printThermal = () => {
    if (!billRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const billHTML = billRef.current.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Order ${billData.orderId}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              width: 80mm;
              background: white;
            }
            * {
              box-sizing: border-box;
            }
            .bill-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .py-2 { padding: 8px 0; }
            .py-1 { padding: 4px 0; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .w-full { width: 100%; }
            .space-y-1 > * + * { margin-top: 4px; }
            .uppercase { text-transform: uppercase; }
            @media print {
              body { margin: 0; padding: 0; }
              .bill-container { max-width: none; }
            }
          </style>
        </head>
        <body>
          ${billHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // Sample data for preview
  const sampleBillData: BillData = {
    orderId: 'ORD-2024-001',
    tableNo: 'T-05',
    customerName: 'John Doe',
    customerPhone: '+91 9876543210',
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 300 },
      { name: 'Mutton Curry', quantity: 1, price: 250 },
      { name: 'Naan', quantity: 3, price: 60 },
      { name: 'Cold Drink', quantity: 2, price: 80 },
    ],
    totalAmount: 640,
    discountAmount: 50,
    orderDate: '2024-03-15 14:30',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
  }

  const currentBillData = billData || sampleBillData

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Bill Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Preview */}
          <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
            <div
              ref={billRef}
              className="bill-container"
              style={{
                width: '80mm',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              {/* Header */}
              <div
                className="text-center mb-4 border-b pb-2"
                style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid #000',
                  paddingBottom: '8px',
                }}
              >
                <div
                  className="font-bold text-lg"
                  style={{ fontWeight: 'bold', fontSize: '16px' }}
                >
                  RESTAURANT BILL
                </div>
                <div className="text-sm" style={{ fontSize: '11px' }}>
                  Order #{currentBillData.orderId}
                </div>
              </div>

              {/* Customer & Table Info */}
              <div
                className="space-y-1"
                style={{ marginBottom: '16px', marginTop: '10px' }}
              >
                <div
                  className="flex justify-between"
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Table No:</span>
                  <span className="font-bold" style={{ fontWeight: 'bold' }}>
                    {currentBillData.tableNo}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Customer:</span>
                  <span className="font-bold" style={{ fontWeight: 'bold' }}>
                    {currentBillData.customerName}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Phone No:</span>
                  <span>{currentBillData.customerPhone}</span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Date:</span>
                  <span>{currentBillData.orderDate}</span>
                </div>
              </div>

              {/* Items */}
              <div
                className="border-t border-b py-2 mb-2"
                style={{
                  borderTop: '1px solid #000',
                  borderBottom: '1px solid #000',
                  padding: '8px 0',
                  marginBottom: '8px',
                }}
              >
                <div
                  className="font-bold text-center mb-2"
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}
                >
                  ORDER ITEMS
                </div>
                <div className="space-y-1" style={{ fontSize: '11px' }}>
                  {currentBillData.items.map((item, index) => (
                    <div key={index}>
                      <div
                        className="flex justify-between"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          {item.name}{' '}
                          {item.variant_name ? `(${item.variant_name})` : ''} x
                          {item.quantity}
                        </span>
                        <span>₹{item.price}</span>
                      </div>
                      {item.addons && item.addons.length > 0 && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#666',
                            marginTop: '2px',
                          }}
                        >
                          {item.addons.map((addon: any, aIdx: number) => (
                            <div
                              key={aIdx}
                              className="flex justify-between pl-2"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingLeft: '8px',
                              }}
                            >
                              <span>
                                + {addon.quantity} {addon.name} ({addon.price})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              {/* Discount */}
              {(Number(currentBillData?.discountAmount) || 0) > 0 && (
                <div className="py-1" style={{ padding: '4px 0' }}>
                  <div
                    className="flex justify-between"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <span>Discount:</span>
                    <span>
                      -₹
                      {Number(currentBillData?.discountAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div
                className="border-t py-2 mb-4"
                style={{
                  borderTop: '1px solid #000',
                  padding: '8px 0',
                  marginBottom: '16px',
                }}
              >
                <div
                  className="flex justify-between font-bold text-lg"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  <span>TOTAL:</span>
                  <span>
                    {currentBillData.discountAmount &&
                    currentBillData.discountAmount > 0
                      ? currentBillData.totalAmount -
                        currentBillData.discountAmount
                      : currentBillData.totalAmount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div
                className="text-center border-t pt-2"
                style={{
                  textAlign: 'center',
                  borderTop: '1px solid #000',
                  paddingTop: '8px',
                  fontSize: '10px',
                }}
              >
                <div>Thank you for your visit!</div>
                <div>Please come again</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {showDownloadButton && (
              <Button
                onClick={downloadAsImage}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}

            {showShareButton && (
              <Button
                onClick={shareAsImage}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            )}

            {showPrintButton && (
              <Button
                onClick={printThermal}
                className="flex-1 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
