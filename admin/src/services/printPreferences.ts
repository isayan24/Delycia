/**
 * Print Preferences Service
 * 
 * Manages user preferences for automatic printing
 * Stores settings in localStorage per restaurant
 */

const STORAGE_KEY = 'delycia_print_preferences'

export interface PrintPreferences {
  autoPrintEnabled: boolean
  lastUpdated: string
}

interface PrintPreferencesStore {
  [restaurantId: string]: PrintPreferences
}

/**
 * Get print preferences for a specific restaurant
 */
export function getPrintPreferences(restaurantId: string | number): PrintPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {
        autoPrintEnabled: false, // Default: disabled (show preview)
        lastUpdated: new Date().toISOString(),
      }
    }

    const allPreferences: PrintPreferencesStore = JSON.parse(stored)
    const ridKey = String(restaurantId)

    return allPreferences[ridKey] || {
      autoPrintEnabled: false,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error reading print preferences:', error)
    return {
      autoPrintEnabled: false,
      lastUpdated: new Date().toISOString(),
    }
  }
}

/**
 * Set print preferences for a specific restaurant
 */
export function setPrintPreferences(
  restaurantId: string | number,
  preferences: Partial<PrintPreferences>
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allPreferences: PrintPreferencesStore = stored ? JSON.parse(stored) : {}
    const ridKey = String(restaurantId)

    allPreferences[ridKey] = {
      ...allPreferences[ridKey],
      ...preferences,
      lastUpdated: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPreferences))
  } catch (error) {
    console.error('Error saving print preferences:', error)
  }
}

/**
 * Enable auto-print for a restaurant
 */
export function enableAutoPrint(restaurantId: string | number): void {
  setPrintPreferences(restaurantId, { autoPrintEnabled: true })
}

/**
 * Disable auto-print for a restaurant
 */
export function disableAutoPrint(restaurantId: string | number): void {
  setPrintPreferences(restaurantId, { autoPrintEnabled: false })
}

/**
 * Check if auto-print is enabled for a restaurant
 */
export function isAutoPrintEnabled(restaurantId: string | number): boolean {
  const preferences = getPrintPreferences(restaurantId)
  return preferences.autoPrintEnabled
}

/**
 * Clear all print preferences
 */
export function clearPrintPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing print preferences:', error)
  }
}
