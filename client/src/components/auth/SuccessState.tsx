/**
 * Success State Component
 * 
 * Displays a success icon and message.
 * Used in auth flows for consistent success UI.
 */

interface SuccessStateProps {
  message?: string
  title?: string
}

/**
 * Success state component for auth flows
 * 
 * @example
 * <SuccessState 
 *   title="Welcome to Delycia!" 
 *   message="Login successful! Redirecting..." 
 * />
 */
export function SuccessState({ 
  title = 'Success!', 
  message = 'Operation completed successfully.' 
}: SuccessStateProps) {
  return (
    <>
      {/* Success Icon */}
      <div className="mb-6">
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
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {title}
      </h1>

      {/* Message */}
      <p className="text-gray-600 mb-6">
        {message}
      </p>
    </>
  )
}
