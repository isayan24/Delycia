import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/smallComponents/LoadingSpinner'

export const PageReloadHandler = () => {
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsReloading(true)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  if (!isReloading) return null

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[99999] flex items-center justify-center">
      <LoadingSpinner
        size="lg"
        message="Refreshing..."
        subtitle="Please wait a moment"
      />
    </div>
  )
}
