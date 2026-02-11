/**
 * Magic Link Sent Confirmation Step
 *
 * Shows a confirmation message after successfully sending the magic link
 * via WhatsApp. Includes countdown and resend option.
 */

import React from 'react'
import { CheckCircle, MessageCircle, Clock, RefreshCw } from 'lucide-react'
import { ThemeColors } from '@/types/loginTypes'

interface MagicLinkSentProps {
  phoneNumber: string
  countryCode: string
  expiryMinutes?: number
  canResend: boolean
  resendTimer: number
  isLoading: boolean
  theme: ThemeColors
  onResend: () => void
  onEditPhone: () => void
}

export const MagicLinkSent: React.FC<MagicLinkSentProps> = ({
  phoneNumber,
  countryCode,
  expiryMinutes = 5,
  canResend,
  resendTimer,
  isLoading,
  theme,
  onResend,
  onEditPhone,
}) => {
  const maskedPhone = phoneNumber.slice(-4).padStart(phoneNumber.length, '*')

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Success Icon with Animation */}
      <div className="relative">
        <div
          className={`w-20 h-20 rounded-full bg-linear-to-r ${theme.primary} flex items-center justify-center shadow-lg`}
        >
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Main Message */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Check Your WhatsApp!
        </h3>
        <p className="text-gray-600">
          We've sent a login link to your WhatsApp
        </p>
        <p className="text-gray-800 font-semibold mt-1">
          {countryCode} {maskedPhone}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 rounded-xl p-4 w-full space-y-3">
        <div className="flex items-start gap-3 text-left">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">
            1
          </div>
          <p className="text-gray-700 text-sm">Open WhatsApp on your phone</p>
        </div>
        <div className="flex items-start gap-3 text-left">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">
            2
          </div>
          <p className="text-gray-700 text-sm">
            Look for a message from{' '}
            <span className="font-semibold">Delycia</span>
          </p>
        </div>
        <div className="flex items-start gap-3 text-left">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">
            3
          </div>
          <p className="text-gray-700 text-sm">
            Click the login link to continue
          </p>
        </div>
      </div>

      {/* Expiry Warning */}
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Link expires in {expiryMinutes} minutes</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-3">
        {/* Resend Button */}
        <button
          onClick={onResend}
          disabled={!canResend || isLoading}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            canResend && !isLoading
              ? `bg-linear-to-r ${theme.primary} text-white hover:shadow-lg`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {!canResend
            ? `Resend in ${resendTimer}s`
            : isLoading
              ? 'Sending...'
              : 'Resend Link'}
        </button>

        {/* Edit Number Button */}
        <button
          onClick={onEditPhone}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Use a different number
        </button>
      </div>
    </div>
  )
}

export default MagicLinkSent
