import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface LoadingOverlayProps {
  message?: string
  subtitle?: string
  isVisible: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Processing...',
  subtitle = 'Please wait a moment',
  isVisible,
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99999] flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <LoadingSpinner size="md" message={message} subtitle={subtitle} />
      </div>
    </div>
  )
}
