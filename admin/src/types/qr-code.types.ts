/**
 * Type definitions for QR code generation feature
 * 
 * These interfaces define the data structures used throughout the QR code
 * generation system, from database models to client-side generation configs.
 */

/**
 * QRCode - Database model for qr_codes table
 * 
 * Represents a QR code record stored in the database with metadata.
 * The url field stores the encoded URL (not a file path).
 */
export interface QRCode {
  /** Unique identifier format: {hash}-{rid}-{table_no} or {hash}-{rid}-general */
  id: string
  /** Restaurant ID (foreign key to restaurants table) */
  rid: number
  /** Table number (NULL for general QR codes) */
  table_no: number | null
  /** Status: 0=inactive (legacy digital screen), 1=active */
  status: 0 | 1
  /** Encoded URL (e.g., order.delycia.com/restaurant-name?table=5) */
  url: string
  /** Timestamp of generation */
  created_at: string
}

/**
 * QRCodeGenerationConfig - Client-side configuration for generating a QR code
 * 
 * Used to configure the parameters for a single QR code generation request.
 */
export interface QRCodeGenerationConfig {
  /** Table ID (primary key from tables table) - used in URL */
  tableId: number | null
  /** Table number (for display purposes only) */
  tableNumber: string | null
  /** Custom text displayed above the QR code */
  topText: string
  /** Custom text displayed below the QR code */
  bottomText: string
}

/**
 * GeneratedQRCode - Result of client-side QR code generation
 * 
 * Contains the generated QR code image data and metadata for download/preview.
 */
export interface GeneratedQRCode {
  /** Table ID (primary key from tables table) */
  tableId: number | null
  /** Table number (for display purposes) */
  tableNumber: string | null
  /** Encoded URL in the QR code */
  url: string
  /** Base64-encoded PNG image data URL */
  dataUrl: string
  /** Filename for download (e.g., restaurant-name-table-5.png) */
  filename: string
}

/**
 * Restaurant - Restaurant model (subset of fields from restaurants table)
 * 
 * Contains the essential restaurant information needed for QR code generation.
 */
export interface Restaurant {
  /** Restaurant ID */
  id: number
  /** URL-safe identifier used in QR code URLs */
  username: string
  /** Display name (used as default top text) */
  name: string
}

/**
 * Table - Table model (subset of fields from tables table)
 * 
 * Represents a table within a restaurant for QR code generation.
 */
export interface Table {
  /** Table ID */
  id: number
  /** Restaurant ID (foreign key) */
  rid: number
  /** Table number/identifier */
  table_number: string
  /** Table capacity */
  capacity: number
  /** Zone/section where table is located */
  zone: string
  /** Current table status */
  status: 'available' | 'occupied' | 'reserved'
}
