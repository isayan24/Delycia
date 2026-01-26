/**
 * Utility functions for parsing table numbers from QR code data
 */

/**
 * Attempts to parse QR code data as JSON and extract table number
 */
function parseAsJSON(data: string): string | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.table) {
      return String(parsed.table);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Attempts to parse QR code data as URL and extract table number
 */
function parseAsURL(data: string): string | null {
  try {
    const url = new URL(data);
    
    // Try to get table from query parameter
    const tableParam = url.searchParams.get('table');
    if (tableParam) {
      return tableParam;
    }
    
    // Try to extract table from path (e.g., /table/12)
    const pathMatch = url.pathname.match(/\/table\/(\w+)/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Attempts to extract table number from simple string format
 */
function parseAsString(data: string): string | null {
  // Look for patterns like "TABLE_12", "Table 12", "T12", etc.
  const patterns = [
    /table[_\s-]*(\w+)/i,  // Matches: TABLE_12, Table 12, table-12
    /^T(\d+)$/i,            // Matches: T12
    /^(\d+)$/,              // Matches: 12 (pure number)
  ];
  
  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Main function to parse table number from QR code data
 * Tries multiple parsing strategies in order: JSON → URL → String
 */
export function parseTableNumber(qrData: string): string | null {
  if (!qrData || typeof qrData !== 'string') {
    return null;
  }
  
  // Strategy 1: Try parsing as JSON
  const jsonResult = parseAsJSON(qrData);
  if (jsonResult) {
    return jsonResult;
  }
  
  // Strategy 2: Try parsing as URL
  const urlResult = parseAsURL(qrData);
  if (urlResult) {
    return urlResult;
  }
  
  // Strategy 3: Try parsing as simple string
  const stringResult = parseAsString(qrData);
  if (stringResult) {
    return stringResult;
  }
  
  return null;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  tableNumber?: string;
}

/**
 * Validates table number format
 */
export function validateTableNumber(tableNumber: string | null): ValidationResult {
  if (!tableNumber) {
    return {
      isValid: false,
      error: "Invalid QR code. Please scan the table's QR code.",
    };
  }
  
  // Remove whitespace
  const cleaned = tableNumber.trim();
  
  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: "Table number cannot be empty.",
    };
  }
  
  // Check if table number is reasonable (alphanumeric, max 20 chars)
  if (cleaned.length > 20) {
    return {
      isValid: false,
      error: "Invalid table number format.",
    };
  }
  
  // Allow alphanumeric characters, hyphens, and underscores
  const validFormat = /^[a-zA-Z0-9_-]+$/;
  if (!validFormat.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid table number format.",
    };
  }
  
  return {
    isValid: true,
    tableNumber: cleaned,
  };
}

/**
 * Combined function to parse and validate QR code data
 */
export function parseAndValidateQRCode(qrData: string): ValidationResult {
  const tableNumber = parseTableNumber(qrData);
  return validateTableNumber(tableNumber);
}
