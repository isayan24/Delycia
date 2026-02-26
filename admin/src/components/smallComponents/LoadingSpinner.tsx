import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  subtitle?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
  subtitle,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const spinnerSize = sizeClasses[size]

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="relative">
        <div
          className={`${spinnerSize} border-4 border-indigo-100 rounded-full`}
        ></div>
        <div
          className={`${spinnerSize} border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}
        ></div>
      </div>
      {(message || subtitle) && (
        <div className="text-center">
          {message && (
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {message}
            </p>
          )}
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
