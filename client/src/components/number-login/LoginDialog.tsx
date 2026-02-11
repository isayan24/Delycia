'use client'
/**
 * Login Dialog Component
 *
 * Multi-step login dialog for WhatsApp magic link authentication.
 * Steps: Phone Input → Magic Link Sent
 * 
 * NOTE: Name input step (step 2) is no longer used - name collection moved to checkout
 */

import React, { useEffect, useState } from 'react'
import { FastForward } from 'lucide-react'
import { ProgressBar } from '../smallComponents/ProgressBar'
import { NameInputStep } from '../steps/NameInputStep'
import { PhoneInputStep } from '../steps/PhoneInputStep'
import { MagicLinkSent } from '../steps/MagicLinkSent'
import { ThemeColors } from '@/types/loginTypes'
import { useNotificationStore } from '@/store/notificationStore'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'

interface LoginDialogProps {
  isOpen: boolean
  currentStep: number
  countryCode: string
  setCountryCode: (code: string) => void
  mobileNumber: string
  setMobileNumber: (number: string) => void
  fullName: string
  setFullName: (name: string) => void
  showCountryDropdown: boolean
  setShowCountryDropdown: (show: boolean) => void
  isLoading: boolean
  resendTimer: number
  canResend: boolean
  theme: ThemeColors
  onPhoneSubmit: () => void
  onResendLink: () => void
  onEditPhone: () => void
  onFinalSubmit: () => void
  onCancel: () => void
  getStepTitle: () => string
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  currentStep,
  countryCode,
  setCountryCode,
  mobileNumber,
  setMobileNumber,
  fullName,
  setFullName,
  showCountryDropdown,
  setShowCountryDropdown,
  isLoading,
  resendTimer,
  canResend,
  theme,
  onPhoneSubmit,
  onResendLink,
  onEditPhone,
  onFinalSubmit,
  onCancel,
  getStepTitle,
}) => {
  const { message, type, clearNotification } = useNotificationStore()
  const { closeLoginDialog } = useLoginDialogStore()
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the animation triggers
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSkip = () => {
    onCancel()
    clearNotification()
    closeLoginDialog()
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-2 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div
          className={`bg-linear-to-r ${theme.primary} p-6 text-white relative `}
        >
          {currentStep !== 2 && (
            <button
              onClick={handleSkip}
              className="absolute top-2 right-4 flex items-center gap-1 hover:bg-white-30 hover:bg-opacity-20 rounded-full p-2 py-1 transition-all"
            >
              Skip for now <FastForward className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl font-bold mb-2 max-[500px]:mt-6">
            {getStepTitle()}
          </h2>
          <ProgressBar currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Notification Message */}
        {message && (
          <div
            className={`mb-1 p-3 ${type === 'success' ? 'bg-green-50' : 'bg-red-50'} border border-green-200 rounded-lg`}
          >
            <p
              className={`text-green-600 text-sm text-center font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}
            >
              {message}
            </p>
          </div>
        )}

        {/* Content Container */}
        <div className="relative h-[370px] overflow-hidden">
          {/* Step 0: Phone Number Input */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 0 ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <PhoneInputStep
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              showCountryDropdown={showCountryDropdown}
              setShowCountryDropdown={setShowCountryDropdown}
              isLoading={isLoading}
              theme={theme}
              onSubmit={onPhoneSubmit}
            />
          </div>

          {/* Step 1: Magic Link Sent Confirmation */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 1
                ? 'translate-x-0'
                : currentStep === 0
                  ? 'translate-x-full'
                  : '-translate-x-full'
            }`}
          >
            <MagicLinkSent
              phoneNumber={mobileNumber}
              countryCode={countryCode}
              expiryMinutes={5}
              canResend={canResend}
              resendTimer={resendTimer}
              isLoading={isLoading}
              theme={theme}
              onResend={onResendLink}
              onEditPhone={onEditPhone}
            />
          </div>

          {/* Step 2: Full Name (kept for backward compatibility but not used) */}
          <div
            className={`absolute inset-0 p-6 transition-transform duration-500 ease-in-out ${
              currentStep === 2 ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <NameInputStep
              fullName={fullName}
              setFullName={setFullName}
              isLoading={isLoading}
              theme={theme}
              onSubmit={onFinalSubmit}
              onEditPhone={onEditPhone}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
