'use client'
import NumberLoginWIthName from '@/components/number-login/NumberLogin'
import { OnFinalSubmit } from '@/types/loginTypes'

/**
 * LoginUse Component
 * 
 * Wrapper component for the magic link authentication flow.
 * 
 * NOTE: This component is kept for backward compatibility with OTP flow.
 * The magic link flow is now the primary authentication method and doesn't
 * require most of the logic that was previously here.
 * 
 * Name collection is now handled at checkout via NameCollectionDialog.
 */
function LoginUse() {
  // Kept for backward compatibility with OTP flow (if still used elsewhere)
  const onFinalSubmit: OnFinalSubmit = async () => {
    // This is no longer used in magic link flow
    // Name collection happens at checkout now
    console.warn('[LoginUse] onFinalSubmit called - this should not happen in magic link flow')
  }

  return (
    <NumberLoginWIthName
      onFinalSubmit={onFinalSubmit}
    />
  )
}

export default LoginUse
