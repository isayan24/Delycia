import { BillData, TaxBreakdown } from '../types'

interface CanvasConfig {
  width: number
  height: number
  padding: number
  lineHeight: number
}

const DEFAULT_CONFIG: CanvasConfig = {
  width: 300,
  height: 800,
  padding: 10,
  lineHeight: 16,
}

/**
 * Render bill to canvas for image generation
 */
export function renderBillToCanvas(
  billData: BillData,
  taxBreakdown: TaxBreakdown,
  config: Partial<CanvasConfig> = {}
): HTMLCanvasElement {
  const { width, height, padding, lineHeight } = { ...DEFAULT_CONFIG, ...config }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  canvas.width = width
  canvas.height = height

  // Setup canvas
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'black'
  ctx.font = '12px Courier New, monospace'
  ctx.textAlign = 'left'

  let y = 20

  // Helper functions
  const drawText = (
    text: string,
    fontSize = 12,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    ctx.font = `${fontSize}px Courier New, monospace`
    ctx.textAlign = align
    const xPos =
      align === 'center' ? width / 2 : align === 'right' ? width - padding : padding
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

  // Header
  drawText(billData.restaurantName.toUpperCase(), 16, 'center')
  drawText(`Order #${billData.orderId}`, 11, 'center')
  y += 10
  drawLine()
  y += 10

  // Customer & Table Info
  drawText(`Table No: ${billData.tableNo}`)
  if (billData.tableZone) drawText(billData.tableZone)
  drawText(`Customer: ${billData.customerName}`)
  drawText(`Phone No: ${billData.customerPhone}`)
  drawText(`Date: ${billData.orderDate}`)
  y += 10
  drawLine()

  // Items
  y += 5
  drawText('ORDER ITEMS', 12, 'center')
  y += 5

  billData.items.forEach((item) => {
    const itemText = `${item.name}${item.variant_name ? ` (${item.variant_name})` : ''} x${item.quantity}`
    const priceText = `₹${item.price.toFixed(2)}`

    ctx.textAlign = 'left'
    ctx.fillText(itemText, padding, y)
    ctx.textAlign = 'right'
    ctx.fillText(priceText, width - padding, y)
    y += lineHeight

    // Addons
    if (item.addons && item.addons.length > 0) {
      ctx.font = '10px Courier New, monospace'
      item.addons.forEach((addon) => {
        const addonText = `  + ${addon.quantity} ${addon.name}`
        const addonPrice = `₹${addon.price.toFixed(2)}`

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

  // Subtotal
  y += 5
  ctx.textAlign = 'left'
  ctx.fillText('Subtotal:', padding, y)
  ctx.textAlign = 'right'
  ctx.fillText(`₹${taxBreakdown.subtotal.toFixed(2)}`, width - padding, y)
  y += 16

  // Discount
  if (billData.discountAmount && billData.discountAmount > 0) {
    ctx.textAlign = 'left'
    ctx.fillText('Discount:', padding, y)
    ctx.textAlign = 'right'
    ctx.fillText(`-₹${billData.discountAmount.toFixed(2)}`, width - padding, y)
    y += 16
  }

  // Tax
  ctx.textAlign = 'left'
  ctx.fillText(`Tax (${taxBreakdown.taxPercent}%):`, padding, y)
  ctx.textAlign = 'right'
  ctx.fillText(`₹${taxBreakdown.taxAmount.toFixed(2)}`, width - padding, y)
  y += 16

  // Grand Total
  y += 5
  ctx.font = '14px Courier New, monospace'
  ctx.textAlign = 'left'
  ctx.fillText('GRAND TOTAL:', padding, y)
  ctx.textAlign = 'right'
  ctx.fillText(`₹${taxBreakdown.totalAmount.toFixed(2)}`, width - padding, y)
  y += 20

  drawLine()

  // Footer
  ctx.font = '10px Courier New, monospace'
  drawText('Thank you for your visit!', 10, 'center')
  drawText('Please come again', 10, 'center')

  return canvas
}

/**
 * Generate filename for bill image
 */
export function generateBillFilename(
  customerName: string,
  orderDate: string
): string {
  const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedDate = orderDate.replace(/[^a-zA-Z0-9]/g, '_')
  return `${sanitizedCustomerName}_${sanitizedDate}.png`
}
