/**
 * Name Input Form Component
 * 
 * Form for collecting user's name during registration.
 * Used in magic link flow for new users.
 */

import { useState, FormEvent } from 'react'
import { getNameValidationError, sanitizeName } from '@/utils/nameValidation'

interface NameInputFormProps {
  onSubmit: (name: string) => void
  isLoading?: boolean
  error?: string
}

/**
 * Name input form for new user registration
 * 
 * @example
 * <NameInputForm 
 *   onSubmit={(name) => updateUser(name)}
 *   isLoading={mutation.isPending}
 *   error={mutation.error?.message}
 * />
 */
export function NameInputForm({ onSubmit, isLoading = false, error }: NameInputFormProps) {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Validate name
    const errorMessage = getNameValidationError(name)
    if (errorMessage) {
      setValidationError(errorMessage)
      return
    }

    setValidationError('')
    onSubmit(sanitizeName(name))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 text-left mb-2"
        >
          Your Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setValidationError('')
          }}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          required
          autoFocus
          disabled={isLoading}
        />
        {validationError && (
          <p className="text-red-600 text-sm mt-1">
            {validationError}
          </p>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}
      
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  )
}
