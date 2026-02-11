/**
 * Name Validation Utilities
 * 
 * Utilities for validating user names in the authentication flow.
 */

/**
 * Check if a name is valid for submission
 * 
 * A valid name must:
 * - Not be null or undefined
 * - Not be an empty string (after trimming)
 * - Be at least 2 characters long
 * - Be at most 50 characters long
 * 
 * @param name - The name to validate
 * @returns true if the name is valid, false otherwise
 */
export function isValidName(name: string | null | undefined): boolean {
  if (!name) return false
  
  const trimmedName = name.trim()
  
  // Check if empty
  if (trimmedName === '') return false
  
  // Check length constraints
  if (trimmedName.length < 2) return false
  if (trimmedName.length > 50) return false
  
  return true
}

/**
 * Get validation error message for a name
 * 
 * @param name - The name to validate
 * @returns Error message if invalid, null if valid
 */
export function getNameValidationError(name: string): string | null {
  const trimmedName = name.trim()
  
  if (trimmedName === '') {
    return 'Please enter your name'
  }
  
  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters'
  }
  
  if (trimmedName.length > 50) {
    return 'Name must be less than 50 characters'
  }
  
  return null
}

/**
 * Sanitize a name for storage
 * 
 * @param name - The name to sanitize
 * @returns Sanitized name
 */
export function sanitizeName(name: string): string {
  return name.trim()
}
