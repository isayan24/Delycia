/**
 * Loading State Component
 * 
 * Displays a loading spinner with customizable message.
 * Used in auth flows for consistent loading UI.
 */

interface LoadingStateProps {
  message?: string
}

/**
 * Loading state component for auth flows
 * 
 * @example
 * <LoadingState message="Verifying login link..." />
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <>
      {/* Loading Spinner */}
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {message}
      </h1>

      {/* Message */}
      <p className="text-gray-600 mb-6">
        Please wait a moment...
      </p>
    </>
  )
}
