import React, { useEffect, useState } from 'react'
import { User, Phone, LogIn, FastForward } from 'lucide-react'
import { CountrySelector } from '../smallComponents/CountrySelector'
import { LoadingSpinner } from '../smallComponents/LoadingSpinner'
import { ThemeColors } from '@/types/loginTypes'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'

interface DirectLoginDialogProps {
  isOpen: boolean
  countryCode: string
  setCountryCode: (code: string) => void
  mobileNumber: string
  setMobileNumber: (number: string) => void
  fullName: string
  setFullName: (name: string) => void
  showCountryDropdown: boolean
  setShowCountryDropdown: (show: boolean) => void
  isLoading: boolean
  theme: ThemeColors
  onSubmit: () => void
  onCancel: () => void
}

export const DirectLoginDialog: React.FC<DirectLoginDialogProps> = ({
  isOpen,
  countryCode,
  setCountryCode,
  mobileNumber,
  setMobileNumber,
  fullName,
  setFullName,
  showCountryDropdown,
  setShowCountryDropdown,
  isLoading,
  theme,
  onSubmit,
  onCancel,
}) => {
  const { closeLoginDialog } = useLoginDialogStore()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSkip = () => {
    onCancel()
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
          className={`bg-linear-to-r ${theme.primary} p-6 text-white relative`}
        >
          <button
            onClick={handleSkip}
            className="absolute top-2 right-4 flex items-center gap-1 hover:bg-white/20 rounded-full p-2 py-1 transition-all text-sm"
          >
            Skip for now <FastForward className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold mb-1">Welcome!</h2>
          <p className="text-white/80 text-sm">
            Please provide your details to place the order.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(
                      e.target.value.replace(/\D/g, '').slice(0, 10),
                    )
                  }
                  className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl ${theme.ring} focus:border-transparent outline-none transition-all text-sm`}
                  placeholder="10-digit number"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic">
              * Needed for tracking and parsing your order.
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl ${theme.ring} focus:border-transparent outline-none transition-all text-sm`}
                placeholder="Enter your full name"
              />
            </div>
            <p className="text-[10px] text-gray-500 italic">
              * Needed so our staff can bring the order to the right person.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={
                mobileNumber.length < 10 || !fullName.trim() || isLoading
              }
              className={`flex-2 bg-linear-to-r ${theme.primary} ${theme.primaryHover} disabled:from-gray-200 disabled:to-gray-300 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm`}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Proceed to Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
