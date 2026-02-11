/**
 * Phone Input Step Component
 *
 * First step in the login flow - collects phone number and sends
 * magic link via WhatsApp.
 */

import React from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { CountrySelector } from '../smallComponents/CountrySelector'
import { LoadingSpinner } from '../smallComponents/LoadingSpinner'
import { ThemeColors } from '../../types/loginTypes'

interface PhoneInputStepProps {
  countryCode: string
  setCountryCode: (code: string) => void
  mobileNumber: string
  setMobileNumber: (number: string) => void
  showCountryDropdown: boolean
  setShowCountryDropdown: (show: boolean) => void
  isLoading: boolean
  theme: ThemeColors
  onSubmit: () => void
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  countryCode,
  setCountryCode,
  mobileNumber,
  setMobileNumber,
  showCountryDropdown,
  setShowCountryDropdown,
  isLoading,
  theme,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            WhatsApp Login
          </span>
        </div>

        {/* Phone Input */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <div className="flex gap-2">
          <CountrySelector
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            showDropdown={showCountryDropdown}
            setShowDropdown={setShowCountryDropdown}
            theme={theme}
          />

          <div className="flex-1 relative">
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) =>
                setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg ${theme.ring} focus:border-transparent outline-none transition-all`}
              placeholder="Enter 10-digit mobile number"
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-3">
          We'll send a secure login link to your WhatsApp. Just click it to sign
          in - no code needed!
        </p>

        {/* Benefits */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>No OTP to remember</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 text-sm mt-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>One-click secure login</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <button
          onClick={onSubmit}
          disabled={mobileNumber.length < 10 || isLoading}
          className={`w-full bg-linear-to-r ${theme.primary} ${theme.primaryHover} disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Login Link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
