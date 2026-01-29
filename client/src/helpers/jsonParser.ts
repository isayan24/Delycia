/**
 * Safely parses a JSON string into an array or object.
 * Returns the parsed value or a default value (e.g., empty array) if parsing fails.
 */
export const safeJsonParse = <T>(input: any, defaultValue: T): T => {
  if (!input) return defaultValue

  // If it's already the expected type (e.g. array/object), return it
  if (typeof input === 'object') return input as T

  try {
    return JSON.parse(input)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return defaultValue
  }
}
