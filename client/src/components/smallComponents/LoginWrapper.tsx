'use client'
import React, { useEffect, useRef } from 'react'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import LoginUse from '../number-login/LoginUse'
import { getCookie, setCookie } from 'cookies-next'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'

export default function LoginWrapper() {
  const { user, isLoading, isAuthenticated } = useAuthQuery()
  const { openLoginDialog } = useLoginDialogStore()
  const intervalRef = useRef<any>(null)

  // Function to check if user is logged in using cookie-based auth
  const isUserLoggedIn = () => {
    return isAuthenticated && user
  }

  // Function to show the dialog and update the cookie
  const attemptShowDialog = () => {
    // Don't show if still loading or user is authenticated
    if (isLoading || isUserLoggedIn()) {
      return
    }

    const lastShown: any = getCookie('lastLoginDialogShown')
    const now = Date.now()

    // For testing: 5 seconds interval
    const intervalInMs = 5 * 1000 // 5 seconds in milliseconds
    // For production: 50 minutes interval
    // const intervalInMs = 50 * 60 * 1000; // 50 minutes in milliseconds

    // Show if never shown before, or if interval time has passed
    if (!lastShown || now - parseInt(lastShown) >= intervalInMs) {
      console.log('Showing login dialog')

      setTimeout(() => {
        openLoginDialog()

        // Set cookie with longer expiration than check interval
        setCookie('lastLoginDialogShown', now.toString(), {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days (much longer than check interval)
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })
      }, 10000)
    }
  }

  useEffect(() => {
    // Don't do anything while auth is loading
    if (isLoading) return

    // Initial check
    attemptShowDialog()

    // Set up interval to check every minute (but only show based on cookie timestamp)
    intervalRef.current = setInterval(attemptShowDialog, 20 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLoading, isAuthenticated]) // Depend on auth loading state

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      <LoginUse />
    </div>
  )
}
