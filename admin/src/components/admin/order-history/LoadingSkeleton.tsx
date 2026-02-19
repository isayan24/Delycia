// Order info card skeleton
export const OrderInfoSkeleton = () => (
  <div className="bg-gray-50 dark:bg-slate-800/40 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-800 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-300 dark:bg-slate-700 rounded"></div>
        <div className="h-6 w-12 bg-gray-300 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="h-4 w-24 bg-gray-300 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded"></div>
      <div className="h-4 w-24 bg-gray-300 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-48 bg-gray-300 dark:bg-slate-700 rounded"></div>
      <div className="h-5 w-16 bg-gray-300 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
)

// Desktop Order Card Skeleton
export const LargeOrderCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/50 p-6 shadow-sm animate-pulse">
    <div className="flex flex-col min-[1200px]:flex-row min-[1200px]:items-center justify-between gap-6">
      {/* Left: ID & Status */}
      <div className="flex items-center min-w-32">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-12 bg-gray-300 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Center: Customer & Time */}
      <div className="flex-1 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-10 bg-gray-200 dark:bg-slate-800 rounded"></div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-20 bg-gray-300 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-40 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Right: Total & Actions */}
      <div className="flex items-center gap-6 justify-end min-w-[200px]">
        <div className="text-right space-y-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 ml-auto rounded"></div>
          <div className="h-7 w-28 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="size-9 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="size-9 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
)

// Stats Cards Skeleton
export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#2d1e14] p-8 py-4 rounded-xl border border-[#ead9cd] dark:border-primary/10 flex flex-col gap-2 shadow-sm animate-pulse"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
          <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg size-9"></div>
        </div>
        <div className="h-8 w-16 bg-gray-300 dark:bg-slate-700 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 dark:bg-slate-800 rounded mt-2"></div>
      </div>
    ))}
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
export const LoadingSpinner = ({
  size = 'sm',
}: {
  size?: 'sm' | 'md' | 'lg'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
    ></div>
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
