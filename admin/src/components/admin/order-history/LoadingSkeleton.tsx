import React from 'react'

// Order info card skeleton
export const OrderInfoSkeleton = () => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-300 rounded"></div>
        <div className="h-6 w-12 bg-gray-300 rounded"></div>
      </div>
      <div className="h-4 w-24 bg-gray-300 rounded"></div>
    </div>
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
      <div className="h-4 w-24 bg-gray-300 rounded"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-48 bg-gray-300 rounded"></div>
      <div className="h-5 w-16 bg-gray-300 rounded"></div>
    </div>
  </div>
)

// Order details skeleton
export const OrderDetailsSkeleton = () => (
  <div className="bg-white p-6 h-auto overflow-y-auto border animate-pulse">
    {/* Header skeleton */}
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 w-20 bg-gray-300 rounded"></div>
      </div>
      <div className="text-right">
        <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
        <div className="h-8 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>

    {/* Customer info skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
      <div className="h-6 w-24 bg-gray-300 rounded"></div>
    </div>

    {/* Order info grid skeleton */}
    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="h-3 w-20 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
      <div>
        <div className="h-3 w-20 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
      <div>
        <div className="h-3 w-20 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
      <div>
        <div className="h-3 w-20 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>

    {/* Timeline skeleton */}
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-40 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
      <div className="px-10">
        <div className="flex justify-between">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="h-3 w-12 bg-gray-300 rounded mt-2"></div>
            <div className="h-2 w-10 bg-gray-300 rounded mt-1"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="h-3 w-12 bg-gray-300 rounded mt-2"></div>
            <div className="h-2 w-10 bg-gray-300 rounded mt-1"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Order details skeleton */}
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-32 bg-gray-300 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-16 bg-gray-300 rounded"></div>
        <div className="h-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
)

// Inline loading spinner
export const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
  )
}

// Full page loading state
export const FullPageLoading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading order history...</p>
    </div>
  </div>
)