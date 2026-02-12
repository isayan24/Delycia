'use client'
import React from 'react'
import LoginUse from '../number-login/LoginUse'

/**
 * LoginWrapper Component
 *
 * This component acts as a container for the login functionality.
 * It renders the LoginUse component which handles the login dialog state
 * through the useLoginDialogStore.
 *
 * The automatic triggering of the login dialog has been removed to improve UX.
 * Authentication is now explicitly triggered by the user or required checkout steps.
 */
export default function LoginWrapper() {
  return (
    <div>
      <LoginUse />
    </div>
  )
}
