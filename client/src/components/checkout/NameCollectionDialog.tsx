/**
 * Name Collection Dialog Component
 * 
 * Dialog that appears at checkout if user doesn't have a name.
 * Uses TanStack Query mutation for updating user profile.
 */

import { useState } from 'react'
import { useUpdateUserMutation } from '@/hooks/mutations/useUpdateUserMutation'
import { getNameValidationError, sanitizeName } from '@/utils/nameValidation'
import { getAuthErrorMessage } from '@/utils/authErrorMessages'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NameCollectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (name: string) => void
  userId: string | number // Support both string and number types
}

/**
 * Dialog for collecting user's name at checkout
 * 
 * Features:
 * - Validates name input
 * - Uses TanStack Query mutation
 * - Shows loading state
 * - Handles errors gracefully
 * - Calls onSuccess callback after successful update
 * - Smooth animations on open/close
 * 
 * @example
 * <NameCollectionDialog
 *   isOpen={showNameDialog}
 *   onClose={() => setShowNameDialog(false)}
 *   onSuccess={(name) => proceedWithCheckout()}
 *   userId={user.uid}
 * />
 */
export function NameCollectionDialog({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: NameCollectionDialogProps) {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState('')
  
  const updateUserMutation = useUpdateUserMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate name
    const errorMessage = getNameValidationError(name)
    if (errorMessage) {
      setValidationError(errorMessage)
      return
    }

    const sanitizedName = sanitizeName(name)
    setValidationError('')

    // Generate username from name (lowercase, no spaces) + random suffix
    const username = sanitizedName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000)

    console.log('[NameCollectionDialog] Updating user:', { userId, name: sanitizedName, username })

    // Update user name and username - convert userId to string for API
    updateUserMutation.mutate(
      { uid: String(userId), name: sanitizedName, username },
      {
        onSuccess: () => {
          console.log('[NameCollectionDialog] Name updated successfully')
          onSuccess(sanitizedName)
          onClose()
        },
        onError: (error) => {
          console.error('[NameCollectionDialog] Failed to update name:', error)
        },
      }
    )
  }

  const handleCancel = () => {
    if (!updateUserMutation.isPending) {
      setName('')
      setValidationError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent 
        className='max-w-[27rem]'
      >
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please enter your name to continue with checkout
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="checkout-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="checkout-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setValidationError('')
              }}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
              autoFocus
              disabled={updateUserMutation.isPending}
            />
            {validationError && (
              <p className="text-red-600 text-sm mt-1">
                {validationError}
              </p>
            )}
          </div>

          {updateUserMutation.isError && (
            <p className="text-red-600 text-sm">
              {updateUserMutation.error 
                ? getAuthErrorMessage(updateUserMutation.error) 
                : 'Failed to update name. Please try again.'}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateUserMutation.isPending}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUserMutation.isPending || !name.trim()}
              className="flex-1 py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
