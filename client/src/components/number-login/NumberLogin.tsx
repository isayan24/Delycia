/**
 * Number Login With Name Component
 *
 * Main login component that manages the magic link authentication flow.
 * Steps: Enter Phone → Link Sent
 * 
 * NOTE: Name collection has been moved to checkout (NameCollectionDialog).
 * This component now only handles phone number entry and magic link sending.
 */

import { useState, useCallback, useEffect } from 'react'
import { LoginCallbacks } from '@/types/loginTypes'
import { LoginDialog } from './LoginDialog'
import { getThemeColors } from '@/utils/themeUtils'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import { useMagicLinkMutation } from '@/hooks/mutations/useMagicLinkMutation'
import { getAuthErrorMessage } from '@/utils/authErrorMessages'

interface NumberLoginProps extends LoginCallbacks {
  onMagicLinkSent?: (phoneNumber: string) => void
}

const NumberLogin = ({
  onMagicLinkSent,
}: NumberLoginProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)

  const { user } = useAuthQuery()
  const { setNotification, clearNotification } = useNotificationStore()
  const {
    isOpen: openDialog,
    currentStep,
    setCurrentStep,
    resetLoginDialog,
  } = useLoginDialogStore()

  const magicLinkMutation = useMagicLinkMutation()
  const theme = getThemeColors('whatsapp')

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Request magic link
  const handlePhoneSubmit = useCallback(async () => {
    if (mobileNumber.length >= 10) {
      clearNotification()

      magicLinkMutation.mutate(
        {
          phone_number: mobileNumber,
          country_code: countryCode,
        },
        {
          onSuccess: (data) => {
            if (data.success) {
              setNotification('success', 'Login link sent to your WhatsApp!')
              setCurrentStep(1)
              setResendTimer(60)
              setCanResend(false)
              onMagicLinkSent?.(`${countryCode}${mobileNumber}`)
            } else {
              setNotification(
                'error',
                data.message || 'Failed to send login link',
              )
            }
          },
          onError: (error: any) => {
            console.error('Error requesting magic link:', error)
            const errorMessage = getAuthErrorMessage(error)
            setNotification('error', errorMessage)
          },
        },
      )
    }
  }, [
    mobileNumber,
    countryCode,
    setCurrentStep,
    setNotification,
    clearNotification,
    onMagicLinkSent,
    magicLinkMutation,
  ])

  // Resend magic link
  const handleResendLink = useCallback(() => {
    if (canResend) {
      handlePhoneSubmit()
    }
  }, [canResend, handlePhoneSubmit])

  // Edit phone number
  const handleEditPhone = useCallback(() => {
    setCurrentStep(0)
    clearNotification()
  }, [setCurrentStep, clearNotification])

  // Reset form state
  const resetForm = useCallback(() => {
    setCurrentStep(0)
    setCountryCode('+91')
    setMobileNumber('')
    setResendTimer(0)
    setCanResend(false)
    clearNotification()
  }, [setCurrentStep, clearNotification])

  // Handle cancel/close
  const handleCancel = useCallback(() => {
    setIsOpen(false)
    resetForm()
    setShowCountryDropdown(false)
    resetLoginDialog()
  }, [resetForm, resetLoginDialog])

  // Get step title
  const getStepTitle = useCallback(() => {
    switch (currentStep) {
      case 0:
        return 'Enter Mobile Number'
      case 1:
        return 'Check WhatsApp'
      default:
        return 'Login'
    }
  }, [currentStep])

  // Close dialog if user is already authenticated
  useEffect(() => {
    if ((isOpen || openDialog) && user) {
      // User is already logged in, close the dialog
      handleCancel()
    }
  }, [isOpen, openDialog, user])

  return (
    <div className="px-8">
      <LoginDialog
        isOpen={isOpen || openDialog}
        currentStep={currentStep}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        fullName="" // Not used anymore - kept for backward compatibility
        setFullName={() => {}} // Not used anymore - kept for backward compatibility
        showCountryDropdown={showCountryDropdown}
        setShowCountryDropdown={setShowCountryDropdown}
        isLoading={magicLinkMutation.isPending}
        resendTimer={resendTimer}
        canResend={canResend}
        theme={theme}
        onPhoneSubmit={handlePhoneSubmit}
        onResendLink={handleResendLink}
        onEditPhone={handleEditPhone}
        onFinalSubmit={() => {}} // Not used anymore - kept for backward compatibility
        onCancel={handleCancel || resetLoginDialog}
        getStepTitle={getStepTitle}
      />
    </div>
  )
}

export default NumberLogin
