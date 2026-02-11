/**
 * Error State Component
 * 
 * Displays an error icon and message with optional retry button.
 * Used in auth flows for consistent error UI.
 */

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

/**
 * Error state component for auth flows
 * 
 * @example
 * <ErrorState 
 *   message="Login link expired" 
 *   onRetry={() => requestNewLink()} 
 * />
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <>
      {/* Error Icon */}
      <div className="mb-6">
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
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Login Failed
      </h1>

      {/* Error Message */}
      <p className="text-red-600 mb-6">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          Try Again
        </button>
      )}
    </>
  )
}
