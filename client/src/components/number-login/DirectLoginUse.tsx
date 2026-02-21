'use client'
/**
 * Direct Login Use Component (Backup)
 *
 * Controller for the no-OTP backup login flow.
 * Manage state for Phone + Name and calls useDirectLoginMutation.
 */

import { useState, useCallback, useEffect } from 'react'
import { DirectLoginDialog } from './DirectLoginDialog'
import { getThemeColors } from '@/utils/themeUtils'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import { useDirectLoginMutation } from '@/hooks/mutations/useDirectLoginMutation'
import useToast from '@/hooks/UseToast'

const DirectLoginUse = () => {
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const { user } = useAuthQuery()
  const { showError, showSuccess } = useToast()
  const {
    isOpen: openDialog,
    resetLoginDialog,
    checkoutContext,
  } = useLoginDialogStore()

  const directLoginMutation = useDirectLoginMutation()
  const theme = getThemeColors('whatsapp') // Reuse existing theme or 'orange'

  // Reset form
  const resetForm = useCallback(() => {
    setMobileNumber('')
    setFullName('')
    setCountryCode('+91')
  }, [])

  // Handle Close
  const handleCancel = useCallback(() => {
    resetForm()
    resetLoginDialog()
  }, [resetForm, resetLoginDialog])

  // Handle Form Submission
  const handleSubmit = useCallback(async () => {
    if (mobileNumber.length >= 10 && fullName.trim()) {
      directLoginMutation.mutate(
        {
          phone_number: mobileNumber,
          country_code: countryCode,
          name: fullName,
        },
        {
          onSuccess: (userData) => {
            showSuccess('Logged in successfully', `Welcome ${userData.name}!`)

            // If there's a checkout callback, trigger it
            if (checkoutContext?.onCheckoutComplete) {
              checkoutContext.onCheckoutComplete(userData)
            }

            handleCancel()
          },
          onError: (error: any) => {
            console.error('Direct login error:', error)
            showError('Login failed', error.message || 'Something went wrong')
          },
        },
      )
    }
  }, [
    mobileNumber,
    fullName,
    countryCode,
    directLoginMutation,
    checkoutContext,
    handleCancel,
    showError,
    showSuccess,
  ])

  // Auto-close if user is already logged in
  useEffect(() => {
    if (openDialog && user) {
      handleCancel()
    }
  }, [openDialog, user, handleCancel])

  return (
    <DirectLoginDialog
      isOpen={openDialog}
      countryCode={countryCode}
      setCountryCode={setCountryCode}
      mobileNumber={mobileNumber}
      setMobileNumber={setMobileNumber}
      fullName={fullName}
      setFullName={setFullName}
      showCountryDropdown={showCountryDropdown}
      setShowCountryDropdown={setShowCountryDropdown}
      isLoading={directLoginMutation.isPending}
      theme={theme}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

export default DirectLoginUse
