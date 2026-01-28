import React, { useState, useCallback, useEffect } from 'react'
import { LoginCallbacks, LoginMethod, UserData } from '@/types/loginTypes'
import { LoginDialog } from './LoginDialog'
import { useOtpTimer } from '@/hooks/useOtpTimer'
import { getThemeColors } from '@/utils/themeUtils'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'

const NumberLoginWithName = ({
  onWhatsAppSubmit,
  onSMSSubmit,
  onOtpVerify,
  onFinalSubmit,
}: LoginCallbacks) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('whatsapp')
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const { user } = useAuthQuery()

  const { message, type } = useNotificationStore()
  const {
    isOpen: openDialog,
    closeLoginDialog,
    currentStep,
    setCurrentStep,
    resetLoginDialog,
    checkoutContext,
  } = useLoginDialogStore()

  const { otpTimer, canResend, resetTimer } = useOtpTimer(currentStep)
  const theme = getThemeColors(loginMethod)

  // Handle phone number submission
  const handlePhoneSubmit = useCallback(async () => {
    if (mobileNumber.length >= 10) {
      setIsLoading(true)
      const fullPhoneNumber = `${countryCode}${mobileNumber}`

      try {
        if (loginMethod === 'whatsapp' && onWhatsAppSubmit) {
          await onWhatsAppSubmit(
            fullPhoneNumber,
            countryCode,
            mobileNumber,
          ).then((res) => {
            if (res === 'OTP sent successfully') {
              // clearNotification();
              setCurrentStep(1)
              resetTimer()
            }
          })
        } else if (loginMethod === 'sms' && onSMSSubmit) {
          console.log('onSMSSubmit')
          console.log('message', message, 'type', type)

          await onSMSSubmit(fullPhoneNumber, countryCode, mobileNumber).then(
            (res) => {
              if (res === 'OTP sent successfully') {
                // clearNotification();
                setCurrentStep(1)
                resetTimer()
              }
            },
          )
        }
      } catch (error) {
        console.error('Error submitting phone number:', error)
        // Don't proceed to next step on error
      } finally {
        setIsLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mobileNumber,
    countryCode,
    loginMethod,
    onWhatsAppSubmit,
    onSMSSubmit,
    message,
    type,
  ])

  //  mark Handle OTP verification with proper error handling
  const handleOtpVerify = useCallback(
    async () => {
      if (otp.join('').length === 6) {
        setIsLoading(true)
        const otpCode = otp.join('')

        try {
          if (onOtpVerify) {
            await onOtpVerify(
              otpCode,
              `${countryCode}${mobileNumber}`,
              loginMethod,
            ).then((res) => {
              if (res === 'OTP verified successfully') {
                // New user - proceed to name entry step
                setCurrentStep(2)
                resetTimer()
              } else if (res === 'User exists - login successful') {
                // Existing user - close dialog and complete login
                setIsOpen(false)
                resetLoginDialog()
                resetForm()
              }
            })
          }
        } catch (error) {
          console.error('Error verifying OTP:', error)
          // Clear OTP on error to allow re-entry
          setOtp(['', '', '', '', '', ''])
        } finally {
          setIsLoading(false)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp, countryCode, mobileNumber, loginMethod, onOtpVerify, message, type],
  )

  // mark resend otp
  const handleResendOtp = useCallback(() => {
    setOtp(['', '', '', '', '', ''])
    resetTimer()
    // Trigger resend by calling the phone submit again
    handlePhoneSubmit()
  }, [resetTimer, handlePhoneSubmit])

  const handleEditPhone = useCallback(() => {
    setCurrentStep(0)
    setOtp(['', '', '', '', '', ''])
    const number = user?.phone_number ?? ''
    setMobileNumber(number)
  }, [user?.phone_number, setCurrentStep])

  const handleFinalSubmit = useCallback(
    async () => {
      setIsLoading(true)
      const userData: UserData = {
        phoneNumber: `${countryCode}${mobileNumber}`,
        countryCode,
        mobileNumber,
        otp: otp.join(''),
        fullName,
        loginMethod,
      }
      try {
        // If there's a checkout context, use its callback instead of the regular onFinalSubmit
        if (checkoutContext?.onCheckoutComplete) {
          await checkoutContext.onCheckoutComplete(userData)
        } else if (onFinalSubmit) {
          await onFinalSubmit(userData)
        }

        setIsOpen(false)
        resetLoginDialog()
        resetForm()
      } catch (error) {
        console.error('Error in final submission:', error)
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      countryCode,
      mobileNumber,
      otp,
      fullName,
      loginMethod,
      onFinalSubmit,
      checkoutContext,
    ],
  )

  const resetForm = useCallback(() => {
    setCurrentStep(0)
    setLoginMethod('whatsapp')
    setCountryCode('+91')
    setMobileNumber('')
    setOtp(['', '', '', '', '', ''])
    setFullName('')
  }, [setCurrentStep])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    resetForm()
    setShowCountryDropdown(false)
    resetLoginDialog()
  }, [resetForm, resetLoginDialog])

  const selectSMSMethod = useCallback(() => {
    setLoginMethod('sms')
    setCurrentStep(0)
    setOtp(['', '', '', '', '', ''])
  }, [setCurrentStep])

  const getStepTitle = useCallback(() => {
    switch (currentStep) {
      case 0:
        return 'Enter Mobile Number'
      case 1:
        return `Verify ${loginMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} OTP`
      case 2:
        return checkoutContext ? 'Complete Your Order' : 'Complete Profile'
      default:
        return 'Login'
    }
  }, [currentStep, loginMethod, checkoutContext])

  // mark if user exist then show only name input

  useEffect(() => {
    if ((isOpen || openDialog) && user) {
      setCurrentStep(2)
    }
  }, [isOpen, openDialog, user, setCurrentStep])

  return (
    <div className="px-8">
      {/* Trigger Button */}
      {/* <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Login
        </button> */}

      <LoginDialog
        isOpen={isOpen || openDialog}
        currentStep={currentStep}
        loginMethod={loginMethod}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        otp={otp}
        setOtp={setOtp}
        fullName={fullName}
        setFullName={setFullName}
        showCountryDropdown={showCountryDropdown}
        setShowCountryDropdown={setShowCountryDropdown}
        isLoading={isLoading}
        otpTimer={otpTimer}
        canResend={canResend}
        theme={theme}
        onPhoneSubmit={handlePhoneSubmit}
        onOtpVerify={handleOtpVerify}
        onOtpResend={handleResendOtp}
        onEditPhone={handleEditPhone}
        onFinalSubmit={handleFinalSubmit}
        onSwitchToSMS={selectSMSMethod}
        onCancel={handleCancel || resetLoginDialog}
        getStepTitle={getStepTitle}
      />
    </div>
  )
}

export default NumberLoginWithName
