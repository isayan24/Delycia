/**
 * Login Types
 *
 * Type definitions for the WhatsApp magic link authentication flow.
 */

export interface LoginCallbacks {
  onFinalSubmit?: (userData: UserData) => Promise<void>
  onMagicLinkSent?: (phoneNumber: string) => void
}

export interface UserData {
  phoneNumber: string
  countryCode: string
  mobileNumber: string
  otp: string // Kept for backward compatibility, empty in magic link flow
  fullName?: string
  loginMethod: string
  isExistingUser?: boolean
}

export interface CountryCode {
  code: string
  country: string
  name: string
}

export interface ThemeColors {
  primary: string
  primaryHover: string
  accent: string
  accentHover: string
  ring: string
  border: string
  bg: string
}

// Type for final submit callback
export type OnFinalSubmit = (userData: UserData) => Promise<void>
