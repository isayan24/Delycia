/**
 * File Download Service
 * 
 * Handles downloading QR code images as PNG files and creating ZIP archives
 * for bulk downloads. Uses file-saver for cross-browser compatibility.
 * 
 * Features:
 * - Individual PNG downloads
 * - Bulk ZIP archive creation
 * - Standardized filename patterns
 * - Error handling for browser download permissions
 */

import { saveAs } from 'file-saver'
import JSZip from 'jszip'

/**
 * File to be included in ZIP archive
 */
export interface ZipFile {
  /** Filename for the file in the ZIP */
  filename: string
  /** Base64 data URL of the file */
  dataUrl: string
}

/**
 * Download Service
 * 
 * Provides methods for downloading QR code images individually or in bulk.
 */
export class DownloadService {
  /**
   * Download a single PNG file
   * 
   * @param dataUrl - Base64-encoded PNG data URL
   * @param filename - Filename for the download
   */
  downloadPNG(dataUrl: string, filename: string): void {
    try {
      // Convert data URL to blob
      const blob = this.dataUrlToBlob(dataUrl)
      
      // Trigger download using file-saver
      saveAs(blob, filename)
    } catch (error) {
      console.error('[DownloadService] Failed to download PNG:', error)
      throw new Error(`Failed to download ${filename}. Please check browser permissions.`)
    }
  }

  /**
   * Download multiple files as a ZIP archive
   * 
   * @param files - Array of files to include in ZIP
   * @param zipFilename - Filename for the ZIP archive
   */
  async downloadZIP(files: ZipFile[], zipFilename: string): Promise<void> {
    try {
      // Create new ZIP archive
      const zip = new JSZip()

      // Add each file to the ZIP
      for (const file of files) {
        const blob = this.dataUrlToBlob(file.dataUrl)
        zip.file(file.filename, blob)
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6 // Balanced compression
        }
      })

      // Trigger download
      saveAs(zipBlob, zipFilename)
    } catch (error) {
      console.error('[DownloadService] Failed to create ZIP:', error)
      throw new Error('Failed to create ZIP archive. Please try downloading files individually.')
    }
  }

  /**
   * Generate ZIP filename with timestamp
   * 
   * @param restaurantUsername - Restaurant username
   * @returns ZIP filename with ISO timestamp
   */
  generateZipFilename(restaurantUsername: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `${restaurantUsername}-qr-codes-${timestamp}.zip`
  }

  /**
   * Convert data URL to Blob
   * 
   * @param dataUrl - Base64-encoded data URL
   * @returns Blob object
   */
  private dataUrlToBlob(dataUrl: string): Blob {
    // Split data URL into parts
    const parts = dataUrl.split(',')
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format')
    }

    // Extract MIME type and base64 data
    const mimeMatch = parts[0].match(/:(.*?);/)
    if (!mimeMatch) {
      throw new Error('Could not extract MIME type from data URL')
    }
    const mimeType = mimeMatch[1]
    const base64Data = parts[1]

    // Decode base64 to binary
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Create blob
    return new Blob([bytes], { type: mimeType })
  }
}

/**
 * Singleton instance of download service
 */
export const downloadService = new DownloadService()
