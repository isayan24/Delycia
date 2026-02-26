/**
 * QR Code Generation Service
 * 
 * Client-side QR code generation using the qrcode library with HTML5 Canvas.
 * Generates high-resolution QR codes with custom text above and below.
 * 
 * Features:
 * - Error correction level M (15% recovery)
 * - High-resolution output (512x512px minimum)
 * - 4-module quiet zone around QR code
 * - Custom text rendering with proper typography
 * - Batch generation support
 */

import QRCode from 'qrcode'
import type { GeneratedQRCode } from '../types/qr-code.types'

/**
 * Options for generating a single QR code
 */
export interface QRCodeGenerationOptions {
  /** URL to encode in the QR code */
  url: string
  /** Text to display above the QR code */
  topText: string
  /** Text to display below the QR code */
  bottomText: string
  /** Table number (null for general QR codes) */
  tableNumber: string | null
  /** Restaurant username for filename generation */
  restaurantUsername: string
  /** QR code size in pixels (default: 512) */
  size?: number
  /** Error correction level (default: 'M') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Result of QR code generation
 */
export interface QRCodeGenerationResult {
  /** Base64-encoded PNG data URL */
  dataUrl: string
  /** Blob for file download */
  blob: Blob
}

/**
 * QR Code Generator Service
 * 
 * Handles client-side QR code generation with custom text rendering.
 */
export class QRCodeGenerator {
  private readonly DEFAULT_SIZE = 512
  private readonly DEFAULT_ERROR_CORRECTION = 'M' as const
  private readonly QR_CODE_MARGIN = 4 // 4-module quiet zone
  private readonly TEXT_PADDING = 20
  private readonly TOP_TEXT_SIZE = 24
  private readonly BOTTOM_TEXT_SIZE = 18
  private readonly FONT_FAMILY = 'Arial, sans-serif'

  /**
   * Generate a single QR code with custom text
   * 
   * @param options - QR code generation options
   * @returns Promise resolving to data URL and blob
   */
  async generate(options: QRCodeGenerationOptions): Promise<QRCodeGenerationResult> {
    const size = options.size || this.DEFAULT_SIZE
    const errorCorrectionLevel = options.errorCorrectionLevel || this.DEFAULT_ERROR_CORRECTION

    // Create a temporary canvas for the QR code
    const qrCanvas = document.createElement('canvas')
    
    // Generate QR code on canvas with proper settings
    await QRCode.toCanvas(qrCanvas, options.url, {
      width: size,
      margin: this.QR_CODE_MARGIN,
      errorCorrectionLevel,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Create final canvas with text
    const finalCanvas = this.addTextToCanvas(
      qrCanvas,
      options.topText,
      options.bottomText,
      size
    )

    // Convert to data URL and blob
    const dataUrl = finalCanvas.toDataURL('image/png')
    const blob = await this.canvasToBlob(finalCanvas)

    return { dataUrl, blob }
  }

  /**
   * Generate multiple QR codes in batch
   * 
   * @param configs - Array of QR code generation options
   * @returns Promise resolving to array of generated QR codes
   */
  async generateBatch(configs: QRCodeGenerationOptions[]): Promise<GeneratedQRCode[]> {
    // Process all QR codes in parallel for better performance
    const results = await Promise.all(
      configs.map(async (config) => {
        const result = await this.generate(config)
        const filename = this.generateFilename(
          config.restaurantUsername,
          config.tableNumber
        )

        return {
          tableNumber: config.tableNumber,
          url: config.url,
          dataUrl: result.dataUrl,
          filename
        }
      })
    )

    return results
  }

  /**
   * Add custom text above and below QR code on a new canvas
   * 
   * @param qrCanvas - Canvas containing the QR code
   * @param topText - Text to display above QR code
   * @param bottomText - Text to display below QR code
   * @param qrSize - Size of the QR code
   * @returns New canvas with QR code and text
   */
  private addTextToCanvas(
    qrCanvas: HTMLCanvasElement,
    topText: string,
    bottomText: string,
    qrSize: number
  ): HTMLCanvasElement {
    // Calculate dimensions for final canvas
    const topTextHeight = topText ? this.TOP_TEXT_SIZE + this.TEXT_PADDING * 2 : 0
    const bottomTextHeight = bottomText ? this.BOTTOM_TEXT_SIZE + this.TEXT_PADDING * 2 : 0
    const totalHeight = topTextHeight + qrSize + bottomTextHeight

    // Create final canvas
    const canvas = document.createElement('canvas')
    canvas.width = qrSize
    canvas.height = totalHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context')
    }

    // Fill background with white
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw top text if provided
    if (topText) {
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${this.TOP_TEXT_SIZE}px ${this.FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(topText, qrSize / 2, topTextHeight / 2)
    }

    // Draw QR code
    ctx.drawImage(qrCanvas, 0, topTextHeight)

    // Draw bottom text if provided
    if (bottomText) {
      ctx.fillStyle = '#000000'
      ctx.font = `${this.BOTTOM_TEXT_SIZE}px ${this.FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const bottomTextY = topTextHeight + qrSize + bottomTextHeight / 2
      ctx.fillText(bottomText, qrSize / 2, bottomTextY)
    }

    return canvas
  }

  /**
   * Convert canvas to Blob
   * 
   * @param canvas - Canvas element
   * @returns Promise resolving to Blob
   */
  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      }, 'image/png')
    })
  }

  /**
   * Generate filename for QR code download
   * 
   * @param restaurantUsername - Restaurant username
   * @param tableNumber - Table number (null for general QR codes)
   * @returns Filename string
   */
  private generateFilename(restaurantUsername: string, tableNumber: string | null): string {
    if (tableNumber) {
      return `${restaurantUsername}-table-${tableNumber}.png`
    }
    return `${restaurantUsername}-general.png`
  }
}

/**
 * Singleton instance of QR code generator
 */
export const qrCodeGenerator = new QRCodeGenerator()
