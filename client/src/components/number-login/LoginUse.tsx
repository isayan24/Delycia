'use client'
import NumberLoginWIthName from '@/components/number-login/NumberLoginWIthName'
import { useNotificationStore } from '@/store/notificationStore'
import {
  OnFinalSubmit,
  OnOtpVerify,
  OnSMSSubmit,
  OnWhatsAppSubmit,
} from '@/types/loginTypes'
import axios from 'axios'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  checkUserExists,
  UserExistenceResult,
} from '@/utils/userExistenceCheck'
import axiosInstance from '@/lib/axios'

function LoginUse() {
  // Retrieve session data from cookie-based auth
  const [countryCode, setCountryCode] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [userExists, setUserExists] = useState<boolean | null>(null)

  const setNotification = useNotificationStore.getState().setNotification

  const { user, login } = useAuthQuery()

  const onWhatsAppSubmit: OnWhatsAppSubmit = async (
    fullPhoneNumber,
    countryCode,
    mobileNumber,
  ) => {
    // Store phone number details
    setCountryCode(countryCode)
    setMobileNumber(mobileNumber)
    // mark from here all the api route and send the mobile number
    try {
      const response = await axios
        .post('/api/verify', {
          phone_number: fullPhoneNumber,
          channel: 'whatsapp',
        })
        .then((res) => {
          setNotification('success', 'OTP sent successfully')
          return 'OTP sent successfully'
        })
        .catch((err) => {
          console.log('error', err)
          setNotification('error', 'Failed to send OTP. Please try again.')
          throw err
        })
      return response
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Failed to sending OTP. Please try again.')
    }
  }

  const onSMSSubmit: OnSMSSubmit = async (
    fullPhoneNumber,
    countryCode,
    mobileNumber,
  ) => {
    // Store phone number details
    setCountryCode(countryCode)
    setMobileNumber(mobileNumber)
    // mark from here all the api route and send the mobile number
    try {
      const response = await axios
        .post('/api/verify', {
          phone_number: fullPhoneNumber,
          channel: 'sms',
        })
        .then((res) => {
          setNotification('success', 'OTP sent successfully')
          return 'OTP sent successfully'
        })
        .catch((err) => {
          console.log('error', err)
          setNotification('error', 'Failed to send OTP. Please try again.')
          throw err
        })
      return response
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Failed to sending OTP. Please try again.')
    }
  }

  const onOtpVerify: OnOtpVerify = async (otpCode, phoneNumber) => {
    try {
      const response = await axios
        .post('/api/verify', {
          code: otpCode,
          phone_number: phoneNumber,
        })
        .then((res) => {
          setNotification('success', 'OTP verified successfully')
          return 'OTP verified successfully'
        })
        .catch((err) => {
          console.log('error', err)
          setNotification('error', 'Failed to verify OTP. Please try again.')
          return 'Failed to verify OTP. Please try again.'
        })

      // If OTP verification successful, check if user exists
      if (response === 'OTP verified successfully') {
        setIsCheckingUser(true)

        try {
          const userCheckResult: UserExistenceResult =
            await checkUserExists(phoneNumber)
          setUserExists(userCheckResult.exists)

          if (userCheckResult.exists) {
            // User exists - proceed with direct login
            const loginSuccess = await login({
              country_code: countryCode,
              phone_number: mobileNumber,
            })

            if (!loginSuccess) {
              console.error('Login failed')
              toast.error('Login failed. Please try again.')
              throw new Error('Login failed')
            }

            setNotification('success', 'Welcome back! Login successful')
            return 'User exists - login successful'
          } else {
            // todo 1: if user accidently exit while login in name submit page, logout from session
            console.log('I am in the else block....')
            try {
              console.log('I am trying to create a user....')

              const loginSuccess = await login({
                country_code: countryCode,
                phone_number: mobileNumber,
              })

              if (!loginSuccess) {
                console.error('Error creating user')
                toast.error('Error in creating user, please try again')
              }
            } catch (error) {
              console.error('Error creating user:', error)
              toast.error('Error in creating user, please try again')
            }

            // User doesn't exist - proceed to name entry step
            setNotification('info', 'Please complete your profile')
            return 'OTP verified successfully'
          }
        } catch (userCheckError) {
          // if user not exists 1: create user 2: show the name field 3: update the user data 4: store in session

          console.error('User existence check failed:', userCheckError)
          setNotification(
            'info',
            'Unable to verify user status. Please proceed with profile completion.',
          )

          // Fallback to current behavior - show name entry step
          setUserExists(false)
          return 'OTP verified successfully'
        } finally {
          setIsCheckingUser(false)
        }
      }

      return response
    } catch (error) {
      console.error('Error verifying OTP:', error)
      throw error
    }
  }

  const onFinalSubmit: OnFinalSubmit = async (userData) => {
    if (user?._id) {
      const fullName = (userData.fullName || '')
        .toLowerCase()
        .replace(/\s+/g, '')
      const mobileNumber = userData.mobileNumber || ''
      const lastTwoDigits = mobileNumber.slice(-2)
      const username = fullName + lastTwoDigits

      await updateUserData({
        uid: user._id,
        name: userData.fullName,
        username: username,
      })
    }
  }

  const updateUserData = async (userData: any) => {
    try {
      const response = await axios
        .post('/api/user/update', userData)
        .then((res) => {
          if (res.status === 200) {
            toast.success('User Login successfully')
            return true
          }
        })
        .catch((err) => {
          console.log('error', err)
          toast.error('Failed to update user data. Please try again.')
          return false
        })
      if (response) {
        const loginSuccess = await login({
          country_code: countryCode,
          phone_number: mobileNumber,
        })

        if (!loginSuccess) {
          toast.error('Failed to login after profile update')
        }
      }
    } catch (error) {
      console.error('Error updating user data', error)
    }
  }

  return (
    // <div className="flex justify-center items-center min-h-[80vh] p-5">
    <NumberLoginWIthName
      onWhatsAppSubmit={onWhatsAppSubmit}
      onSMSSubmit={onSMSSubmit}
      onOtpVerify={onOtpVerify}
      onFinalSubmit={onFinalSubmit}
    />
    // {/* </div> */}
  )
}

export default LoginUse
