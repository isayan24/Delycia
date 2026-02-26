import React from 'react'
import { LoadingSpinner } from '@/components/smallComponents/LoadingSpinner'

export const GlobalLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[99999] flex items-center justify-center">
      <LoadingSpinner
        size="lg"
        message="Loading..."
        subtitle="Please wait a moment"
      />
    </div>
  )
}
