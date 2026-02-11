/**
 * Magic Link Verification Page (UPDATED)
 *
 * This page handles the magic link token verification when user clicks
 * the login link from WhatsApp.
 * 
 * CRITICAL CHANGES:
 * - Uses useVerifyMagicLinkMutation instead of direct axios
 * - Uses useUpdateUserMutation for name updates
 * - TanStack Query cache is updated BEFORE navigation
 * - No manual localStorage manipulation (handled by mutations)
 */

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useVerifyMagicLinkMutation } from '@/hooks/mutations/useVerifyMagicLinkMutation'
import { getAuthErrorMessage } from '@/utils/authErrorMessages'
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/auth/magic')({
  validateSearch: (search) => searchSchema.parse(search),
  component: MagicLinkPage,
})

function MagicLinkPage() {
  return (
    <AuthErrorBoundary>
      <MagicLinkContent />
    </AuthErrorBoundary>
  )
}

function MagicLinkContent() {
  const { token } = useSearch({ from: '/auth/magic' })
  const navigate = useNavigate()
  
  // Use mutations instead of direct axios calls
  const verifyMutation = useVerifyMagicLinkMutation()
  
  const [hasVerified, setHasVerified] = useState(false)

  useEffect(() => {
    // Prevent double verification in React StrictMode
    if (token && !hasVerified && !verifyMutation.isPending && !verifyMutation.isSuccess) {
      setHasVerified(true)
      
      // Use mutation to verify token
      verifyMutation.mutate(token, {
        onSuccess: (data) => {
          console.log('[MagicLinkContent] Verification success:', data)
          
          // Always redirect immediately after successful verification
          // Name will be collected at checkout if needed
          console.log('[MagicLinkContent] User authenticated, redirecting...')
          setTimeout(() => {
            navigate({ to: '/' })
          }, 1500)
        },
        onError: (error) => {
          console.error('[MagicLinkContent] Verification error:', error)
        },
      })
    } else if (!token) {
      // No token provided - show error
      console.error('[MagicLinkContent] No token provided')
    }
  }, [token, hasVerified, verifyMutation.isPending, verifyMutation.isSuccess])

  // Determine status based on mutation states
  const isLoading = verifyMutation.isPending
  const isError = verifyMutation.isError || (!token && !verifyMutation.isPending)
  const isSuccess = verifyMutation.isSuccess

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {isLoading && (
            <div className="w-16 h-16 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          )}
          {isSuccess && (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {isError && (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isLoading && 'Verifying Login Link...'}
          {isSuccess && 'Welcome to Delycia!'}
          {isError && 'Login Failed'}
        </h1>

        {/* Message */}
        <p
          className={`text-gray-600 mb-6 ${isError ? 'text-red-600' : ''}`}
        >
          {isLoading && 'Please wait a moment...'}
          {isSuccess && 'Login successful! Redirecting...'}
          {isError && (verifyMutation.error ? getAuthErrorMessage(verifyMutation.error) : 'Invalid login link. Please request a new one.')}
        </p>

        {/* Back to Login Link (for errors) */}
        {isError && (
          <button
            onClick={() => navigate({ to: '/' })}
            className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  )
}
