'use client'
import LoginUse from '../number-login/LoginUse'
import DirectLoginUse from '../number-login/DirectLoginUse'
import { isDirectAuth } from '@/lib/authConfig'

/**
 * LoginWrapper Component
 *
 * This component acts as a container for the login functionality.
 * It renders either the magic link flow (LoginUse) or the direct
 * phone+name flow (DirectLoginUse) based on the AUTH_MODE config.
 */
export default function LoginWrapper() {
  return <div>{isDirectAuth() ? <DirectLoginUse /> : <LoginUse />}</div>
}
